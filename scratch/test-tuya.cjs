const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

const tuya = new TuyaContext({
  baseUrl: 'https://openapi-sg.iotbing.com',
  accessKey: 'psssrp4hk75q5a3drfpn',
  secretKey: '95a8b50a48864d50bc9029acf1322795',
});

const deviceId = 'a3a95d6030b8bc9a02idhq';

async function test() {
  console.log('Testing Tuya API for Device:', deviceId);

  try {
    console.log('\n1. /v1.0/devices/{id} (Basic Details)');
    const res1 = await tuya.request({ path: `/v1.0/devices/${deviceId}`, method: 'GET' });
    console.log(JSON.stringify(res1, null, 2).substring(0, 500));
  } catch (e) { console.error('Error 1:', e.message); }

  try {
    console.log('\n2. /v1.0/iot-03/devices/{id}/status (IoT Core Status)');
    const res2 = await tuya.request({ path: `/v1.0/iot-03/devices/${deviceId}/status`, method: 'GET' });
    console.log(JSON.stringify(res2, null, 2));
  } catch (e) { console.error('Error 2:', e.message); }

  try {
    console.log('\n3. /v1.0/devices/{id}/specifications (Device Specs)');
    const res3 = await tuya.request({ path: `/v1.0/devices/${deviceId}/specifications`, method: 'GET' });
    console.log(JSON.stringify(res3, null, 2));
  } catch (e) { console.error('Error 3:', e.message); }
}

test();
