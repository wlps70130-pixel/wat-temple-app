import { TuyaContext } from '@tuya/tuya-connector-nodejs';

export default async function handler(req, res) {
  // รับ Device ID ผ่าน parameter เช่น /api/tuya?deviceId=xxxxx
  const { query: { deviceId } } = req;

  if (!deviceId) {
    return res.status(400).json({ error: "Missing deviceId parameter" });
  }

  // เซ็ตอัพการเชื่อมต่อกับ Tuya Central Europe Data Center
  const tuya = new TuyaContext({
    baseUrl: 'https://openapi.tuyaeu.com',
    accessKey: process.env.TUYA_CLIENT_ID,
    secretKey: process.env.TUYA_CLIENT_SECRET,
  });

  try {
    // ดึงค่าสถานะ Real-time ล่าสุดทั้งหมดจากมิเตอร์ (V, A, kW, kWh)
    const response = await tuya.request({
      path: `/v1.0/devices/${deviceId}/status`,
      method: 'GET',
    });

    if (response && response.success) {
      // ส่งข้อมูลดิบกลับไปให้ React จัดการ (Frontend)
      return res.status(200).json({ success: true, result: response.result });
    } else {
      // หากเกิดข้อผิดพลาดจากฝั่ง Tuya API
      return res.status(500).json({ success: false, error: response });
    }

  } catch (error) {
    console.error("Tuya API Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
