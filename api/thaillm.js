export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    // Use environment variable if available, fallback to hardcoded key for immediate testing
    const apikey = process.env.THAILLM_API_KEY || 'tp96fQjhqBLcvN3qanCI1aoRV5Siv7bC';
    
    const mode = req.body.mode || 'general';

    let systemPrompt = 'คุณคือผู้ช่วย AI ทำหน้าที่คอยให้คำแนะนำสั้นๆ กระชับ เข้าใจง่าย ตอบคำถามอย่างสุภาพและเป็นมิตร';
    
    switch (mode) {
      case 'energy':
        systemPrompt = 'คุณคือผู้ช่วย AI เชี่ยวชาญด้านวิศวกรรมพลังงาน ทำหน้าที่วิเคราะห์ข้อมูลการใช้ไฟฟ้าแบบเรียลไทม์ของ "วัดหลวงพ่อสดธรรมกายาราม" คุณต้องเขียนสรุปสถานการณ์และให้คำแนะนำในการประหยัดไฟแบบสั้นๆ กระชับ เข้าใจง่าย (ไม่เกิน 3 ประโยค) ใช้คำสุภาพและน่าเชื่อถือ';
        break;
      case 'dhamma':
        systemPrompt = 'คุณคือพระอาจารย์ผู้เชี่ยวชาญวิชชาธรรมกาย แห่งวัดหลวงพ่อสดธรรมกายาราม ทำหน้าที่ให้ความรู้และอธิบายธรรมะจากชื่อไฟล์เสียงหรือหัวข้อที่ผู้ใช้กำลังฟังอยู่ ให้อธิบายสั้นๆ เข้าใจง่าย ลึกซึ้ง (ไม่เกิน 3 ประโยค) ใช้คำแทนตัวเองว่า "อาตมา" และแทนผู้ใช้ว่า "โยม"';
        break;
      case 'admin':
        systemPrompt = 'คุณคือผู้เชี่ยวชาญด้าน IT และ System Admin ทำหน้าที่วิเคราะห์ Log หรือสถานะอุปกรณ์ IoT ของวัดหลวงพ่อสดฯ ให้สรุปสาเหตุและเสนอวิธีแก้ปัญหาสั้นๆ กระชับ';
        break;
    }

    const response = await fetch('https://thaillm.or.th/api/typhoon/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey
      },
      body: JSON.stringify({
        model: '/model',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: context 
          }
        ],
        max_tokens: 500,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('ThaiLLM Error:', err);
      return res.status(response.status).json({ error: 'Failed to fetch from ThaiLLM API' });
    }

    const data = await response.json();
    
    // Extract the text content from the completion
    const reply = data?.choices?.[0]?.message?.content || "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล";

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
