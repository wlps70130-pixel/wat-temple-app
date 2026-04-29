import React, { useState } from 'react';

export default function AiAssistant({
  mode = 'general',
  contextData = '',
  title = 'AI Assistant',
  subtitle = 'Powered by Gemini (Google AI)',
  icon = '🤖',
  themeColor = '#4f46e5',
  buttonText = 'วิเคราะห์ข้อมูล',
  isDarkMode = false
}) {
  const [aiInsight, setAiInsight] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const handleAnalyze = async () => {
    if (!contextData || isAiLoading) return;

    setIsAiLoading(true);
    setAiInsight(null);
    setIsFallback(false);

    try {
      const response = await fetch('/api/thaillm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, context: contextData })
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      setAiInsight(data.reply || 'AI ยังไม่สามารถสร้างคำตอบได้ในขณะนี้');
      setIsFallback(Boolean(data.fallback));
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiInsight('ระบบ AI ยังเชื่อมต่อไม่ได้ กรุณาตรวจสอบ GEMINI_API_KEY ใน Environment Variables แล้วลองใหม่อีกครั้ง');
      setIsFallback(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const hexToRgba = (hex, alpha) => {
    const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#4f46e5';
    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bgStyle = isDarkMode
    ? {
        background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.18)}, ${hexToRgba(themeColor, 0.34)})`,
        borderColor: themeColor,
        color: '#f8fafc'
      }
    : {
        background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.08)}, ${hexToRgba(themeColor, 0.18)})`,
        borderColor: hexToRgba(themeColor, 0.5),
        color: '#0f172a'
      };

  return (
    <div className="ai-assistant-card" style={bgStyle}>
      <div className="ai-assistant-ghost" aria-hidden="true">🤖</div>

      <div className="ai-assistant-header">
        <div className="ai-assistant-title-group">
          <span className="ai-assistant-icon">{icon}</span>
          <div>
            <h3 className="ai-assistant-title">{title}</h3>
            <p className="ai-assistant-subtitle" style={{ color: themeColor }}>{subtitle}</p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAiLoading || !contextData}
          className="ai-assistant-button"
          style={{
            background: isAiLoading ? (isDarkMode ? '#475569' : '#cbd5e1') : themeColor,
            cursor: (isAiLoading || !contextData) ? 'not-allowed' : 'pointer',
            opacity: (!contextData && !isAiLoading) ? 0.55 : 1
          }}
        >
          {isAiLoading ? (
            <>
              <span className="ai-assistant-spinner" />
              กำลังวิเคราะห์...
            </>
          ) : buttonText}
        </button>
      </div>

      {aiInsight && (
        <div className={`ai-assistant-result ${isFallback ? 'is-fallback' : ''}`}>
          {aiInsight.split('\n').filter(Boolean).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}

      <style>{`
        .ai-assistant-card {
          position: relative;
          overflow: hidden;
          border-width: 1px;
          border-style: solid;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 12px 32px rgba(25, 42, 70, 0.06);
        }

        .ai-assistant-ghost {
          position: absolute;
          right: -14px;
          top: -18px;
          font-size: 8rem;
          line-height: 1;
          opacity: 0.08;
          pointer-events: none;
        }

        .ai-assistant-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ai-assistant-title-group {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: min(100%, 240px);
        }

        .ai-assistant-icon {
          font-size: 1.35rem;
          line-height: 1.25;
        }

        .ai-assistant-title {
          margin: 0;
          font-size: 1.14rem;
          line-height: 1.35;
          font-weight: 800;
          color: inherit;
        }

        .ai-assistant-subtitle {
          margin: 6px 0 0;
          font-size: 0.95rem;
          line-height: 1.45;
          font-weight: 700;
        }

        .ai-assistant-button {
          min-height: 44px;
          border: 0;
          border-radius: 999px;
          padding: 10px 20px;
          color: #ffffff;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 800;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .ai-assistant-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(15, 23, 42, 0.18);
        }

        .ai-assistant-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.95);
          border-top-color: transparent;
          border-radius: 50%;
          animation: ai-spin 900ms linear infinite;
        }

        .ai-assistant-result {
          position: relative;
          z-index: 1;
          margin-top: 22px;
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.74);
          border: 1px solid rgba(255,255,255,0.64);
          color: #1e293b;
          font-size: 0.98rem;
          line-height: 1.72;
          font-weight: 500;
        }

        .ai-assistant-result.is-fallback {
          background: rgba(255,255,255,0.58);
        }

        .ai-assistant-result p {
          margin: 0 0 10px;
        }

        .ai-assistant-result p:last-child {
          margin-bottom: 0;
        }

        @keyframes ai-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 560px) {
          .ai-assistant-card {
            padding: 20px;
            border-radius: 22px;
          }

          .ai-assistant-header {
            gap: 18px;
          }

          .ai-assistant-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
