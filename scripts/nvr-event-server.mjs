import https from 'node:https';

const config = {
  baseUrl: process.env.NVR_BASE_URL || 'https://192.168.1.69:20443',
  token: process.env.NVR_ACCESS_TOKEN,
  id: Number(process.env.NVR_EVENT_SERVER_ID || 1),
  host: process.env.NVR_EVENT_HOST || '192.168.1.53',
  port: Number(process.env.NVR_EVENT_PORT || 10000),
  url: process.env.NVR_EVENT_URL || '/api/nvr-events',
  protocol: process.env.NVR_EVENT_PROTOCOL || 'HTTP',
  pictureSwitch: process.env.NVR_EVENT_PICTURE_SWITCH || 'off'
};

const usage = () => {
  console.error('Usage: node scripts/nvr-event-server.mjs <get|set|delete>');
  console.error('Required env: NVR_ACCESS_TOKEN');
  process.exit(1);
};

const request = (method, apiPath, body) => new Promise((resolve, reject) => {
  const target = new URL(apiPath, config.baseUrl);
  const payload = body ? JSON.stringify(body) : undefined;

  const req = https.request({
    method,
    hostname: target.hostname,
    port: target.port || 443,
    path: `${target.pathname}${target.search}`,
    rejectUnauthorized: false,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/json',
      ...(payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      } : {})
    }
  }, res => {
    let text = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { text += chunk; });
    res.on('end', () => {
      const data = text ? JSON.parse(text) : {};
      if (res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(data)}`));
        return;
      }
      resolve(data);
    });
  });

  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

const command = process.argv[2];
if (!['get', 'set', 'delete'].includes(command)) usage();
if (!config.token) usage();

if (command === 'get') {
  const data = await request('GET', '/openapi/event_server');
  console.log(JSON.stringify(data, null, 2));
}

if (command === 'set') {
  const data = await request('POST', '/openapi/event_server', {
    id: config.id,
    ip_or_domain: config.host,
    port: config.port,
    url: config.url,
    protocol: config.protocol,
    picture_switch: config.pictureSwitch
  });
  console.log(JSON.stringify(data, null, 2));
}

if (command === 'delete') {
  const data = await request('POST', '/openapi/event_server/delete', {
    id: config.id
  });
  console.log(JSON.stringify(data, null, 2));
}
