const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

const tuya = new TuyaContext({
  baseUrl: 'https://openapi-sg.iotbing.com',
  accessKey: 'psssrp4hk75q5a3drfpn',
  secretKey: '95a8b50a48864d50bc9029acf1322795',
});

const deviceId = 'a3a95d6030b8bc9a02idhq';

async function test() {
  const endTime = Date.now();
  const startTime = endTime - 1000 * 60 * 60; // 1 hour ago
  
  try {
    console.log('\n4. /v1.0/iot-03/devices/{id}/report-logs');
    const res = await tuya.request({ 
        path: `/v1.0/iot-03/devices/${deviceId}/report-logs`, 
        method: 'GET',
        query: {
            start_time: startTime,
            end_time: endTime,
            type: '7' // typically data report
        }
    });
    console.log(JSON.stringify(res, null, 2).substring(0, 1000));
  } catch (e) { console.error('Error 4:', e.message); }

  try {
    console.log('\n5. /v1.0/devices/{id}/logs');
    const res = await tuya.request({ 
        path: `/v1.0/devices/${deviceId}/logs`, 
        method: 'GET',
        query: {
            start_time: startTime,
            end_time: endTime,
            type: '7'
        }
    });
    console.log(JSON.stringify(res, null, 2).substring(0, 1000));
  } catch (e) { console.error('Error 5:', e.message); }
}

test();
