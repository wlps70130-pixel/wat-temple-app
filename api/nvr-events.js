import { mkdir, readFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const maxDuration = 60;

const CAMERA_LOOKUP = {
  '1': { model: 'VIGI C340S', ip: '192.168.1.63' },
  '2': { model: 'VIGI C340S', ip: '192.168.1.67' },
  '3': { model: 'VIGI C340S', ip: '192.168.1.207' },
  '4': { model: 'VIGI C340S', ip: '192.168.1.41' },
  '5': { model: 'InSight S445ZI', ip: '192.168.1.202' },
  '6': { model: 'VIGI C340-W', ip: '192.168.1.70' }
};

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'x-nvr-event-secret'
]);

const sendJson = (res, statusCode, data) => {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(data));
};

const getHeader = (headers = {}, name) => {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
};

const redactHeaders = (headers = {}) => {
  const redacted = {};
  for (const [key, value] of Object.entries(headers)) {
    redacted[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? '[redacted]' : value;
  }
  return redacted;
};

const collectReadableBody = async (req) => {
  if (!req || typeof req.on !== 'function') return Buffer.alloc(0);

  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
    req.on('end', resolve);
    req.on('error', reject);
  });
  return Buffer.concat(chunks);
};

const getBodyBuffer = async (req) => {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.body && typeof req.body === 'object') return Buffer.from(JSON.stringify(req.body));
  return collectReadableBody(req);
};

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getMultipartBoundary = (contentType = '') => {
  const match = contentType.match(/boundary="?([^";]+)"?/i);
  return match?.[1] || '';
};

const parsePartHeaders = (text) => {
  const headers = {};
  for (const line of text.split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
  }
  return headers;
};

const parseMultipartBody = (rawBody, contentType = '') => {
  const boundary = getMultipartBoundary(contentType);
  if (!boundary) return null;

  const rawLatin1 = rawBody.toString('latin1');
  const delimiterCandidates = [`--${boundary}`, boundary.startsWith('--') ? boundary : `--${boundary}`];
  const delimiter = delimiterCandidates.find(candidate => rawLatin1.includes(candidate));
  if (!delimiter) return null;

  const parts = rawLatin1
    .split(delimiter)
    .map(part => part.replace(/^\r?\n/, '').replace(/\r?\n--\r?\n?$/, '').replace(/\r?\n$/, ''))
    .filter(part => part && part !== '--');

  const parsedParts = [];
  let eventPayload = null;

  for (const part of parts) {
    const separator = part.indexOf('\r\n\r\n') >= 0 ? '\r\n\r\n' : '\n\n';
    const separatorIndex = part.indexOf(separator);
    if (separatorIndex === -1) continue;

    const headerText = part.slice(0, separatorIndex);
    const bodyLatin1 = part.slice(separatorIndex + separator.length);
    const headers = parsePartHeaders(headerText);
    const disposition = headers['content-disposition'] || '';
    const name = disposition.match(/name="([^"]+)"/)?.[1] || null;
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] || null;
    const partContentType = headers['content-type'] || '';
    const bodyBuffer = Buffer.from(bodyLatin1, 'latin1');
    const isJson = partContentType.includes('application/json') || name === 'event';

    if (isJson) {
      const text = bodyBuffer.toString('utf8').trim();
      const json = parseJson(text);
      if (json) eventPayload = json;
      parsedParts.push({ name, filename, contentType: partContentType, size: bodyBuffer.length, json });
    } else {
      parsedParts.push({ name, filename, contentType: partContentType, size: bodyBuffer.length });
    }
  }

  return {
    payload: eventPayload,
    multipart: {
      boundary,
      partCount: parsedParts.length,
      imageCount: parsedParts.filter(part => part.contentType?.startsWith('image/')).length,
      parts: parsedParts
    }
  };
};

const parseBody = (rawBody, contentType = '') => {
  const rawText = rawBody.toString('utf8');
  if (!rawText) return null;

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartBody(rawBody, contentType)?.payload || null;
  }

  if (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
    return parseJson(rawText);
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(rawText));
  }

  return null;
};

const findValue = (input, names) => {
  if (!input || typeof input !== 'object') return undefined;

  for (const [key, value] of Object.entries(input)) {
    const normalized = key.toLowerCase().replace(/[_-]/g, '');
    if (names.includes(normalized)) return value;
  }

  for (const value of Object.values(input)) {
    if (value && typeof value === 'object') {
      const found = findValue(value, names);
      if (found !== undefined) return found;
    }
  }

  return undefined;
};

const getEventHour = (date) => {
  const timeZone = process.env.NVR_EVENT_TIME_ZONE || 'Asia/Bangkok';
  const hour = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone
  }).format(date);

  return Number(hour);
};

const getActivityPeriod = (date) => {
  const hour = getEventHour(date);
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

const getEventDate = (payload, fallback) => {
  const value = findValue(payload, ['time', 'timestamp', 'eventtime', 'datetime', 'date', 'localtime']);
  if (!value) return fallback;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const summarizeEvent = (payload, rawText, receivedAt) => {
  const eventAt = getEventDate(payload, receivedAt);
  const eventType = findValue(payload, ['eventtype', 'event', 'type', 'alarmtype', 'eventname']) || '';
  const channel = findValue(payload, ['channel', 'channelid', 'cameraid', 'deviceid', 'id']);
  const cameraIp = findValue(payload, ['ip', 'cameraip', 'deviceip', 'address']);
  const normalizedChannel = channel === undefined || channel === null ? '' : String(channel);
  const camera = CAMERA_LOOKUP[normalizedChannel]
    || Object.values(CAMERA_LOOKUP).find(item => item.ip === String(cameraIp))
    || null;
  const eventText = `${eventType} ${rawText}`.toLowerCase();

  return {
    time: eventAt.toISOString(),
    receivedAt: receivedAt.toISOString(),
    cameraId: normalizedChannel || null,
    cameraIp: cameraIp ? String(cameraIp) : camera?.ip || null,
    cameraModel: camera?.model || null,
    eventType: eventType ? String(eventType) : null,
    personDetected: /person|human|people|pedestrian|intrusion|linecross/.test(eventText),
    activityPeriod: getActivityPeriod(eventAt),
    duangkaewScore: null
  };
};

const getLogDir = () => process.env.NVR_EVENT_LOG_DIR || path.join(process.cwd(), 'data', 'nvr-events');

const getLogPath = (date = new Date()) => {
  const day = date.toISOString().slice(0, 10);
  return path.join(getLogDir(), `${day}.jsonl`);
};

const readRecentEvents = async (limit = 20) => {
  try {
    const text = await readFile(getLogPath(), 'utf8');
    return text
      .trim()
      .split('\n')
      .filter(Boolean)
      .slice(-limit)
      .map(line => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const isAuthorized = (req) => {
  const expected = process.env.NVR_EVENT_SECRET;
  if (!expected) return true;

  const provided = getHeader(req.headers, 'x-nvr-event-secret') || req.query?.secret;
  return provided === expected;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { success: true });

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { success: false, error: 'Unauthorized event receiver request' });
  }

  if (req.method === 'GET') {
    const limit = Math.min(Number(req.query?.limit || 20) || 20, 100);
    const events = await readRecentEvents(limit);
    return sendJson(res, 200, {
      success: true,
      configured: true,
      logDir: getLogDir(),
      count: events.length,
      events
    });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    const receivedAt = new Date();
    const contentType = getHeader(req.headers, 'content-type') || '';
    const rawBody = await getBodyBuffer(req);
    const multipart = parseMultipartBody(rawBody, contentType);
    const rawText = contentType.includes('multipart/form-data')
      ? rawBody.toString('utf8', 0, Math.min(rawBody.length, 4000))
      : rawBody.toString('utf8');
    const payload = multipart?.payload || parseBody(rawBody, contentType);

    const event = {
      id: crypto.randomUUID(),
      receivedAt: receivedAt.toISOString(),
      sourceIp: req.ip || getHeader(req.headers, 'x-forwarded-for') || null,
      contentType,
      headers: redactHeaders(req.headers),
      summary: summarizeEvent(payload, rawText, receivedAt),
      rawBodySize: rawBody.length,
      multipart: multipart?.multipart || null,
      payload,
      rawTextPreview: rawText,
      rawText: contentType.includes('multipart/form-data') ? undefined : rawText
    };

    await mkdir(getLogDir(), { recursive: true });
    await appendFile(getLogPath(receivedAt), `${JSON.stringify(event)}\n`, 'utf8');

    return sendJson(res, 200, {
      success: true,
      id: event.id,
      summary: event.summary
    });
  } catch (error) {
    console.error('NVR event receiver error:', error);
    return sendJson(res, 500, { success: false, error: error.message });
  }
}
