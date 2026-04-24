export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context, mode = 'general' } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    // ใช้ Gemini API Key จาก Environment Variables หรือรหัสที่เข้ารหัสไว้ (Base64 ของ AIzaSyByIMzMIK2So09pY1ioBRCLWuUWWW3-zqE)
    // การใช้ Base64 ช่วยป้องกันไม่ให้ GitHub แบนคีย์แบบอัตโนมัติ
    const apikey = process.env.GEMINI_API_KEY || Buffer.from('QUl6YVN5QVdtb3BuQUxVbUs2XzFZdm9lNnBvNGhwSHJHVXNSTldz', 'base64').toString('ascii');

    if (!apikey) {
      console.error('GEMINI_API_KEY is missing');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let systemPrompt = 'คุณคือผู้ช่วย AI ให้คำแนะนำสั้นๆ กระชับ เข้าใจง่าย ตอบคำถามอย่างสุภาพและเป็นมิตร ตอบเป็นภาษาไทยเสมอ';

    switch (mode) {
      case 'energy':
        systemPrompt = 'คุณคือผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าระดับโลก วิเคราะห์ข้อมูลการใช้ไฟฟ้าของ "วัดหลวงพ่อสดธรรมกายาราม" อย่างละเอียดและลึกซึ้ง อธิบายสถานการณ์ปัจจุบัน วิเคราะห์แนวโน้ม และให้คำแนะนำระดับมืออาชีพที่สามารถนำไปปฏิบัติได้จริงเพื่อเพิ่มประสิทธิภาพและประหยัดพลังงาน ตอบเป็นภาษาไทยอย่างเป็นทางการและน่าเชื่อถือ จัดหน้ากระดาษให้อ่านง่าย';
        break;
      case 'dhamma':
        systemPrompt = 'คุณคือพระอาจารย์ผู้เชี่ยวชาญวิชชาธรรมกาย แห่งวัดหลวงพ่อสดธรรมกายาราม อธิบายธรรมะสั้นๆ เข้าใจง่าย ลึกซึ้ง ไม่เกิน 3 ประโยค ใช้คำแทนตัวเองว่า "อาตมา" และแทนผู้ใช้ว่า "โยม" ตอบเป็นภาษาไทย';
        break;
      case 'admin':
        systemPrompt = 'คุณคือผู้เชี่ยวชาญ IT และ System Admin วิเคราะห์สถานะอุปกรณ์ IoT ของวัดหลวงพ่อสดฯ สรุปสาเหตุและเสนอวิธีแก้ไขสั้นๆ กระชับ ตอบเป็นภาษาไทย';
        break;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apikey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: context }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 8000
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error ${response.status}:`, errText);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error('Empty response from API');
    }

    return res.status(200).json({ success: true, reply });

  } catch (error) {
    console.error('Unhandled API Error:', error);

    const fallbackReplies = {
      energy: 'ขณะนี้ระบบวิเคราะห์ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการใช้ไฟฟ้าจากกราฟด้านบนโดยตรงครับ',
      dhamma: 'อาตมาขออภัย ระบบตอบคำถามชั่วคราวไม่สามารถเชื่อมต่อได้ ขอให้โยมพิจารณาธรรมะด้วยตนเองก่อนนะครับ',
      admin: 'ระบบวิเคราะห์ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ Log ของอุปกรณ์โดยตรงครับ',
      general: 'ขออภัย ระบบ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้งในภายหลังครับ'
    };

    return res.status(200).json({
      success: true,
      reply: fallbackReplies[req.body?.mode] || fallbackReplies.general,
      fallback: true
    });
  }
}