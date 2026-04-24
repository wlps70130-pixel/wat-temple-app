const { TuyaContext } = require('@tuya/tuya-connector-nodejs');
const tuya = new TuyaContext({
  baseUrl: 'https://openapi-sg.iotbing.com',
  accessKey: 'psssrp4hk75q5a3drfpn',
  secretKey: '95a8b50a48864d50bc9029acf1322795',
});
const deviceId = 'a3a95d6030b8bc9a02idhq';
async function test() {
  const res = await tuya.request({ path: `/v1.0/devices/${deviceId}/status`, method: 'GET' });
  console.log(JSON.stringify(res.result, null, 2));
}
test();
