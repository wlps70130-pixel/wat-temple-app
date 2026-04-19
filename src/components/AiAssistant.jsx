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
      const res = await fetch('/api/thaillm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, context: contextData })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('ไม่สามารถอ่านข้อมูลจากเซิร์ฟเวอร์ได้');
      }

      if (data.success) {
        setAiInsight(data.reply);
        setIsFallback(!!data.fallback);
      } else {
        setAiInsight('ขออภัย ระบบ AI ชั่วคราวไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้งครับ');
        setIsFallback(true);
      }
    } catch (e) {
      setAiInsight('ขออภัย ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่ครับ');
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
