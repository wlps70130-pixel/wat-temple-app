import React, { useState } from 'react';

export default function AiAssistant({ 
  mode = 'general', 
  contextData = '', 
  title = 'AI Assistant', 
  subtitle = 'Powered by Gemini (Google AI)', 
  icon = '🪄',
  themeColor = '#4f46e5',
  buttonText = 'วิเคราะห์ข้อมูล',
  isDarkMode = false
}) {
  const [aiInsight, setAiInsight] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [isFallback, setIsFallback] = useState(false);

  const handleAnalyze = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    setIsFallback(false);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setAiInsight('กรุณาตั้งค่า VITE_GEMINI_API_KEY ใน Environment Variables เพื่อใช้งาน AI วิเคราะห์ข้อมูล');
        setIsFallback(true);
        setIsAiLoading(false);
        return;
      }

      const prompt = `คุณคือ "สุดยอดผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าและพลังงานระดับแนวหน้าของประเทศไทย" ที่มีประสบการณ์สูงสุดในการจัดการพลังงานและการลดต้นทุนค่าไฟ (Energy Management & Cost Reduction) ระดับประเทศและระดับโลก
หน้าที่ของคุณคือวิเคราะห์ข้อมูลการใช้พลังงานไฟฟ้าสำหรับ "วัดหลวงพ่อสดธรรมกายาราม" อย่างละเอียดลึกซึ้งที่สุด 
คุณสามารถให้รายละเอียดเชิงลึก อธิบายสาเหตุ วิเคราะห์ผลลัพธ์ และเสนอแนวทางแก้ไขที่ประหยัดงบประมาณที่สุดแต่ได้ผลลัพธ์ดีเยี่ยมที่สุด ตรงจุดที่สุด 
ให้คำแนะนำแบบมืออาชีพ สามารถอธิบายหลักวิศวกรรมให้คนทั่วไปเข้าใจได้ง่าย เน้นความคุ้มค่าและสามารถลงมือปฏิบัติได้จริง ไม่จำกัดความยาวของเนื้อหา

ข้อมูลระบบไฟฟ้าปัจจุบัน:
${contextData}

กรุณาวิเคราะห์และให้คำแนะนำแบบจัดเต็มในหัวข้อต่อไปนี้:
1. วิเคราะห์ภาพรวมเชิงลึก: สถานะการใช้ไฟปัจจุบัน, แนวโน้มค่าใช้จ่าย, พฤติกรรมการใช้ไฟ และชี้เป้าความผิดปกติ (ถ้ามี)
2. เจาะลึกรายอาคาร/จุดใช้งาน: วิเคราะห์ว่าจุดใดหรืออาคารใดมีการใช้พลังงานสิ้นเปลืองที่สุด สาเหตุที่เป็นไปได้เชิงวิศวกรรม และวิธีจัดการแบบชี้เป้า
3. กลยุทธ์ลดค่าไฟขั้นเด็ดขาด: แนะนำวิธีลดค่าไฟที่เห็นผลทันที (เช่น การบริหารจัดการ Peak Demand, การหลีกเลี่ยงช่วง On-Peak สำหรับ TOU) 
4. การแก้ปัญหา Power Factor (PF Penalty): วิเคราะห์ค่า PF ถ้ามีค่าปรับให้เสนอวิธีแก้แบบเจาะจง (เช่น การติดตั้งหรือปรับจูน Capacitor Bank)
5. แผนปฏิบัติการ (Action Plan): แนะนำสิ่งที่ควรทำทันที (ใช้เงินน้อย/ไม่ใช้เงิน) และสิ่งที่ควรลงทุนในอนาคตเพื่อความคุ้มค่าระยะยาว`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192
          }
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || `HTTP Error ${res.status}`);
      }
      
      if (data.candidates && data.candidates[0].content) {
        setAiInsight(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (e) {
      console.error(e);
      setAiInsight(`เกิดข้อผิดพลาด: ${e.message}`);
      setIsFallback(true);
    }
    setIsAiLoading(false);
  };

  // Convert hex to rgba for glassmorphism
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bgStyle = isDarkMode 
    ? { background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.2)}, ${hexToRgba(themeColor, 0.4)})`, borderColor: themeColor }
    : { background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.05)}, ${hexToRgba(themeColor, 0.15)})`, borderColor: hexToRgba(themeColor, 0.5) };

  return (
    <div style={{ ...bgStyle, borderRadius: '24px', padding: '1.5rem', borderStyle: 'solid', borderWidth: '1px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '-20px', top: '-10px', fontSize: '8rem', opacity: isDarkMode ? 0.05 : 0.1 }}>🤖</div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '800' }}>{title}</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: themeColor, fontWeight: '600' }}>{subtitle}</p>
        </div>
        <button 
          onClick={handleAnalyze} 
          disabled={isAiLoading || !contextData}
          style={{ 
            background: isAiLoading ? (isDarkMode ? '#475569' : '#cbd5e1') : themeColor, 
            color: 'white', 
            border: 'none', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '20px', 
            fontWeight: '700', 
            cursor: (isAiLoading || !contextData) ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            opacity: (!contextData && !isAiLoading) ? 0.5 : 1
          }}
        >
          {isAiLoading ? (
            <>
              <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              กำลังวิเคราะห์...
            </>
          ) : buttonText}
        </button>
      </div>

      {aiInsight && (
        <div style={{ marginTop: '1.5rem', background: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)', padding: '1.25rem', borderRadius: '16px', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`, position: 'relative', zIndex: 1, animation: 'fade-in 0.4s ease-out' }}>
          <div style={{ fontSize: '0.95rem', color: isDarkMode ? '#f8fafc' : '#1e293b', lineHeight: '1.6', fontWeight: '500' }}>
            {aiInsight.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 0.5rem 0' }}>{line}</p>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
