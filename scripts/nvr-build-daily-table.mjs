import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const inputDir = process.env.NVR_EVENT_LOG_DIR || path.join(process.cwd(), 'data', 'nvr-events');
const outputDir = process.env.NVR_TABLE_DIR || path.join(process.cwd(), 'data', 'nvr-tables');
const date = process.argv[2] || new Date().toISOString().slice(0, 10);

const inputPath = path.join(inputDir, `${date}.jsonl`);
const outputPath = path.join(outputDir, `${date}.csv`);

const escapeCsv = (value) => {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const getEventRows = (lines) => lines
  .filter(Boolean)
  .map(line => JSON.parse(line))
  .map(event => {
    const summary = event.summary || {};
    return {
      id: event.id,
      time: summary.time || event.receivedAt || '',
      receivedAt: event.receivedAt || summary.receivedAt || '',
      cameraId: summary.cameraId || '',
      cameraIp: summary.cameraIp || '',
      cameraModel: summary.cameraModel || '',
      eventType: summary.eventType || '',
      personDetected: summary.personDetected ? 'yes' : 'no',
      activityPeriod: summary.activityPeriod || '',
      duangkaewScore: summary.duangkaewScore || '',
      rawBodySize: event.rawBodySize || '',
      sourceIp: event.sourceIp || ''
    };
  });

const headers = [
  'id',
  'time',
  'receivedAt',
  'cameraId',
  'cameraIp',
  'cameraModel',
  'eventType',
  'personDetected',
  'activityPeriod',
  'duangkaewScore',
  'rawBodySize',
  'sourceIp'
];

try {
  const text = await readFile(inputPath, 'utf8');
  const rows = getEventRows(text.split(/\r?\n/));
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(','))
  ].join('\n');

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${csv}\n`, 'utf8');

  console.log(JSON.stringify({
    success: true,
    date,
    inputPath,
    outputPath,
    count: rows.length
  }, null, 2));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log(JSON.stringify({
      success: true,
      date,
      inputPath,
      outputPath,
      count: 0,
      message: 'No event log for this date yet.'
    }, null, 2));
    process.exit(0);
  }

  throw error;
}
