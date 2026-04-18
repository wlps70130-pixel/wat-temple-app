const https = require('https');
const qs = require('querystring');
const servers = [];
for(let i=1; i<=100; i++) {
  servers.push('shelly-' + i + '-eu.shelly.cloud');
  servers.push('shelly-' + i + '-asia.shelly.cloud');
  servers.push('shelly-' + i + '-us.shelly.cloud');
}

const postData = qs.stringify({
  id: 'e08cfe96bc38',
  auth_key: 'NDBmZjYwdWlkFFD944BFE845180CBC1C841EA9A06D86A747318179B7E151C8DD1BB3907E8E579ABA7F9504D2CD12'
});

async function checkServer(server) {
  return new Promise((resolve) => {
    const options = {
      hostname: server,
      port: 443,
      path: '/device/status',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('isok')) {
          const json = JSON.parse(data);
          if (json.isok === true) resolve({server, data});
          else resolve(null);
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(postData);
    req.end();
  });
}

(async () => {
  console.log('Starting scan of 300 servers...');
  const chunkSize = 50;
  for (let i = 0; i < servers.length; i += chunkSize) {
    const chunk = servers.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(checkServer));
    const found = results.find(r => r !== null);
    if (found) {
      console.log('FOUND SERVER:', found.server);
      console.log('DATA:', found.data);
      process.exit(0);
    }
  }
  console.log('Not found.');
})();
