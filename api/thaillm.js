export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context, mode = 'general' } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    const apikey = process.env.THAILLM_API_KEY || 'tp96fQjhqBLcvN3qanCI1aoRV5Siv7bC';

    let systemPrompt = 'คุณคือผู้ช่วย AI ให้คำแนะนำสั้นๆ กระชับ เข้าใจง่าย ตอบคำถามอย่างสุภาพและเป็นมิตร ตอบเป็นภาษาไทยเสมอ';

    switch (mode) {
      case 'energy':
        systemPrompt = 'คุณคือผู้เชี่ยวชาญด้านวิศวกรรมพลังงาน วิเคราะห์ข้อมูลการใช้ไฟฟ้าของ "วัดหลวงพ่อสดธรรมกายาราม" สรุปสถานการณ์และให้คำแนะนำประหยัดไฟสั้นๆ ไม่เกิน 3 ประโยค ใช้คำสุภาพ ตอบเป็นภาษาไทย';
        break;
      case 'dhamma':
        systemPrompt = 'คุณคือพระอาจารย์ผู้เชี่ยวชาญวิชชาธรรมกาย แห่งวัดหลวงพ่อสดธรรมกายาราม อธิบายธรรมะสั้นๆ เข้าใจง่าย ลึกซึ้ง ไม่เกิน 3 ประโยค ใช้คำแทนตัวเองว่า "อาตมา" และแทนผู้ใช้ว่า "โยม" ตอบเป็นภาษาไทย';
        break;
      case 'admin':
        systemPrompt = 'คุณคือผู้เชี่ยวชาญ IT และ System Admin วิเคราะห์สถานะอุปกรณ์ IoT ของวัดหลวงพ่อสดฯ สรุปสาเหตุและเสนอวิธีแก้ไขสั้นๆ กระชับ ตอบเป็นภาษาไทย';
        break;
    }

    // ลองทีละ endpoint
    const endpoints = [
      {
        url: 'https://thaillm.or.th/api/typhoon/v1/chat/completions',
        headers: { 'Content-Type': 'application/json', 'apikey': apikey },
        body: { model: 'typhoon-s-thaillm-8b-instruct', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: context }], max_tokens: 400, temperature: 0.5 }
      },
      {
        url: 'https://thaillm.or.th/api/typhoon/v1/chat/completions',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apikey}` },
        body: { model: 'typhoon-s-thaillm-8b-instruct', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: context }], max_tokens: 400, temperature: 0.5 }
      },
      {
        url: 'https://api.opentyphoon.ai/v1/chat/completions',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apikey}` },
        body: { model: 'typhoon-v2-8b-instruct', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: context }], max_tokens: 400, temperature: 0.5 }
      }
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: endpoint.headers,
          body: JSON.stringify(endpoint.body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[${endpoint.url}] Error ${response.status}:`, errText);
          lastError = `HTTP ${response.status}`;
          continue; // ลอง endpoint ต่อไป
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content || null;

        if (!reply) {
          lastError = 'Empty response from API';
          continue;
        }

        return res.status(200).json({ success: true, reply });

      } catch (err) {
        console.error(`[${endpoint.url}] Fetch error:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    // ทุก endpoint ล้มเหลว — ส่ง fallback message
    const fallbackReplies = {
      energy: 'ขณะนี้ระบบวิเคราะห์ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการใช้ไฟฟ้าจากกราฟด้านบนโดยตรงครับ',
      dhamma: 'อาตมาขออภัย ระบบตอบคำถามชั่วคราวไม่สามารถเชื่อมต่อได้ ขอให้โยมพิจารณาธรรมะด้วยตนเองก่อนนะครับ',
      admin: 'ระบบวิเคราะห์ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ Log ของอุปกรณ์โดยตรงครับ',
      general: 'ขออภัย ระบบ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้งในภายหลังครับ'
    };

    return res.status(200).json({
      success: true,
      reply: fallbackReplies[mode] || fallbackReplies.general,
      fallback: true
    });

  } catch (error) {
    console.error('Unhandled API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
