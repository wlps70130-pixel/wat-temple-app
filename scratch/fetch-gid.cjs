const https = require('https');

https.get('https://docs.google.com/spreadsheets/d/11hBRfyMG6g2qhhSSPceu1_LvmBTrp0aOkmjculEM-r0/edit?usp=sharing', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/"name":"[^"]+","gid":"\d+"/g);
    if (matches) {
      console.log(matches.map(m => m));
    } else {
      console.log("No gids found. Maybe it's not public?");
    }
  });
});
