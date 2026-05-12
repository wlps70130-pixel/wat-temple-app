import http from 'node:http';
import https from 'node:https';

export const maxDuration = 60;

const DEFAULT_CAMERA_URL = 'https://192.168.1.252';

const getConfiguredValue = (value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  return trimmed && trimmed !== 'undefined' && trimmed !== 'null' ? trimmed : '';
};

const stripFrameBlockingHeaders = (headers = {}) => {
  const output = {};
  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.toLowerCase();
    if (
      normalized === 'x-frame-options' ||
      normalized === 'content-security-policy' ||
      normalized === 'content-security-policy-report-only' ||
      normalized === 'transfer-encoding' ||
      normalized === 'connection'
    ) {
      continue;
    }
    output[key] = value;
  }
  return output;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    if (typeof res.status === 'function') res.status(405);
    else res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const targetBase = getConfiguredValue(process.env.CCTV_TARGET_URL) || DEFAULT_CAMERA_URL;
  const requestPath = typeof req.query?.path === 'string' ? req.query.path : '/';

  let targetUrl;
  try {
    targetUrl = new URL(requestPath, targetBase);
  } catch {
    if (typeof res.status === 'function') res.status(400);
    else res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Invalid CCTV target URL' }));
  }

  const transport = targetUrl.protocol === 'http:' ? http : https;
  const authHeader = process.env.CCTV_USERNAME && process.env.CCTV_PASSWORD
    ? `Basic ${Buffer.from(`${process.env.CCTV_USERNAME}:${process.env.CCTV_PASSWORD}`).toString('base64')}`
    : undefined;

  const requestOptions = {
    method: 'GET',
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === 'http:' ? 80 : 443),
    path: `${targetUrl.pathname}${targetUrl.search}`,
    rejectUnauthorized: false,
    timeout: 15000,
    headers: {
      Accept: req.headers?.accept || '*/*',
      ...(authHeader ? { Authorization: authHeader } : {})
    }
  };

  const proxyRequest = transport.request(requestOptions, upstream => {
    res.statusCode = upstream.statusCode || 200;
    const headers = stripFrameBlockingHeaders(upstream.headers);
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    }
    upstream.pipe(res);
  });

  proxyRequest.on('timeout', () => {
    proxyRequest.destroy(new Error('CCTV connection timed out'));
  });

  proxyRequest.on('error', error => {
    if (!res.headersSent) {
      if (typeof res.status === 'function') res.status(502);
      else res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify({
      success: false,
      error: error.message,
      hint: 'ตรวจสอบว่าเครื่อง server เข้าถึงกล้องได้ และตั้งค่า CCTV_TARGET_URL ถูกต้อง'
    }));
  });

  proxyRequest.end();
}
