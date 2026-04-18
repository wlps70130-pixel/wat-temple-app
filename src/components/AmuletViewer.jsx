import React, { useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';

const AMULET_URL = 'https://watluangporsodh-ratchaburi-amulet.netlify.app/';

export default function AmuletViewer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  const handleReload = () => {
    setLoading(true);
    setError(false);
    setKey(k => k + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '0' }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 0.25rem 0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🪬</span> พระของขวัญ
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>วัดหลวงพ่อสดธรรมกายาราม ราชบุรี</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleReload} title="โหลดใหม่"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <RefreshCw size={15} color="#64748b" />
          </button>
          <a href={AMULET_URL} target="_blank" rel="noreferrer" title="เปิดในเบราว์เซอร์"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <ExternalLink size={15} color="#64748b" />
          </a>
        </div>
      </div>

      {/* iframe container */}
      <div style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', position: 'relative', background: '#fafafa' }}>

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fffbeb', zIndex: 10, gap: '0.75rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🪬</div>
            <Loader2 size={24} color="#d97706" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: '600' }}>กำลังโหลดพระของขวัญ...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fffbeb', zIndex: 10, gap: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>⚠️</div>
            <p style={{ fontSize: '0.88rem', color: '#92400e', fontWeight: '700' }}>ไม่สามารถโหลดหน้าเว็บได้</p>
            <p style={{ fontSize: '0.75rem', color: '#b45309' }}>เว็บไซต์ภายนอกอาจปฏิเสธการแสดงผลใน iframe</p>
            <button onClick={handleReload} style={{ background: '#d97706', color: 'white', border: 'none', borderRadius: '12px', padding: '0.5rem 1.25rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              ลองใหม่
            </button>
            <a href={AMULET_URL} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontSize: '0.78rem', fontWeight: '600', textDecoration: 'none', marginTop: '0.25rem' }}>
              <ExternalLink size={13} /> เปิดในเบราว์เซอร์แทน
            </a>
          </div>
        )}

        <iframe
          key={key}
          src={AMULET_URL}
          title="พระของขวัญ วัดหลวงพ่อสดฯ"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          allow="fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}
