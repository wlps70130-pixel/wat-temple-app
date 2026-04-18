import React, { useState, useEffect } from 'react';
import { User, Users, Loader2, X, Phone, BookOpen, Award, Calendar } from 'lucide-react';
import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/11hBRfyMG6g2qhhSSPceu1_LvmBTrp0aOkmjculEM-r0/export?format=csv';

// ─── Detail Modal ────────────────────────────────────────────────────────────
function MonkModal({ monk, onClose }) {
  if (!monk) return null;

  const fields = [
    { icon: <Award size={15} />, label: 'ตำแหน่ง', value: monk.title },
    { icon: <BookOpen size={15} />, label: 'ฉายา / วิทยฐานะ', value: monk.degree || monk.education },
    { icon: <Calendar size={15} />, label: 'บวชมาแล้ว', value: monk.years ? `${monk.years} พรรษา` : null },
    { icon: <Phone size={15} />, label: 'ติดต่อ', value: monk.contact },
    { icon: <BookOpen size={15} />, label: 'หน้าที่', value: monk.duty },
    { icon: <BookOpen size={15} />, label: 'หมายเหตุ', value: monk.note },
  ].filter(f => f.value && String(f.value).trim() !== '');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '1rem', animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '24px 24px 20px 20px',
          width: '100%', maxWidth: '480px', maxHeight: '85vh',
          overflow: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)'
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#e2e8f0' }} />
        </div>

        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)',
          margin: '0.75rem', borderRadius: '18px', padding: '1.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white'
            }}
          >
            <X size={16} />
          </button>

          {/* Avatar */}
          {monk.image && monk.image.trim() !== '' ? (
            <img src={monk.image} alt={monk.name}
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.5)' }}>
              <User size={44} color="white" />
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>
              {monk.title || 'พระภิกษุ'}
            </div>
            <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: '800', lineHeight: 1.2 }}>
              {monk.name}
            </div>
          </div>
        </div>

        {/* Info Fields */}
        {fields.length > 0 ? (
          <div style={{ padding: '0 1rem 1.5rem' }}>
            {fields.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.85rem 0',
                borderBottom: i < fields.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginBottom: '2px' }}>{f.label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' }}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1rem 1.5rem 2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            🙏 ยังไม่มีข้อมูลเพิ่มเติม
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

// ─── Monk Card ────────────────────────────────────────────────────────────────
function MonkCard({ monk, size = 'md', borderColor = '#f59e0b' }) {
  const [selected, setSelected] = useState(false);
  const avatarSize = size === 'lg' ? 80 : size === 'md' ? 56 : 44;

  const sizes = {
    lg: { name: '1rem', title: '0.8rem', pad: '1.25rem 1rem' },
    md: { name: '0.85rem', title: '0.7rem', pad: '0.85rem 0.5rem' },
    sm: { name: '0.75rem', title: '0.65rem', pad: '0.75rem 0.4rem' },
  };
  const s = sizes[size];

  return (
    <>
      <div
        onClick={() => setSelected(true)}
        style={{
          background: 'white', borderRadius: '18px', textAlign: 'center',
          padding: s.pad, borderTop: `3px solid ${borderColor}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
          position: 'relative', overflow: 'hidden',
          userSelect: 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
      >
        {/* Tap hint */}
        <div style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '0.55rem', color: '#cbd5e1', fontWeight: '600', letterSpacing: '0.3px' }}>TAP</div>

        {/* Avatar */}
        {monk.image && monk.image.trim() !== '' ? (
          <img src={monk.image} alt={monk.name}
            style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${borderColor}`, boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}
          />
        ) : (
          <div style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%', background: `linear-gradient(135deg, ${borderColor}22, ${borderColor}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${borderColor}` }}>
            <User size={avatarSize * 0.45} color={borderColor} />
          </div>
        )}

        {/* Title */}
        {monk.title && (
          <div style={{ fontSize: s.title, color: '#d97706', fontWeight: '700', lineHeight: 1.2 }}>
            {monk.title}
          </div>
        )}

        {/* Name */}
        <div style={{ fontSize: s.name, color: '#1e293b', fontWeight: '700', lineHeight: 1.25 }}>
          {monk.name}
        </div>

        {/* Duty preview */}
        {monk.duty && (
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', lineHeight: 1.3, marginTop: '-2px' }}>
            {monk.duty}
          </div>
        )}
      </div>

      {selected && <MonkModal monk={monk} onClose={() => setSelected(false)} />}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SanghaChart() {
  const [data, setData] = useState({ abbot: null, viceAbbots: [], assistants: [], monks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data.filter(row => row.role && row.name);
        setData({
          abbot: rows.find(r => r.role === 'abbot') || null,
          viceAbbots: rows.filter(r => r.role === 'viceAbbot'),
          assistants: rows.filter(r => r.role === 'assistant'),
          monks: rows.filter(r => r.role === 'monk'),
        });
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
        <Loader2 size={32} color="#eab308" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>กำลังโหลดข้อมูลคณะสงฆ์...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const Connector = () => (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.5rem 0' }}>
      <div style={{ width: '2px', height: '1.75rem', background: 'linear-gradient(to bottom, #fbbf24, #e2e8f0)' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
        <Users size={22} color="#d97706" />
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
          ผังคณะสงฆ์วัดหลวงพ่อสดฯ
        </h2>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: '-0.25rem 0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
        <span>👆</span> กดที่ภาพเพื่อดูข้อมูล
      </p>

      {/* Abbot */}
      {data.abbot && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 15%' }}>
          <MonkCard monk={data.abbot} size="lg" borderColor="#ca8a04" />
        </div>
      )}

      {/* Vice Abbots */}
      {data.viceAbbots.length > 0 && (
        <>
          <Connector />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', padding: '0 0.25rem' }}>
            {data.viceAbbots.map((monk, i) => (
              <div key={i} style={{ flex: '1 1 calc(50% - 0.3rem)' }}>
                <MonkCard monk={monk} size="md" borderColor="#f59e0b" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Assistants */}
      {data.assistants.length > 0 && (
        <>
          <Connector />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0 0.25rem' }}>
            {data.assistants.map((monk, i) => (
              <MonkCard key={i} monk={monk} size="sm" borderColor="#fbbf24" />
            ))}
          </div>
        </>
      )}

      {/* Ordinary Monks */}
      {data.monks.length > 0 && (
        <>
          <Connector />
          <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef9c3)', borderRadius: '18px', padding: '1rem', border: '1px solid #fde68a' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#92400e' }}>พระภิกษุสามเณร</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '500' }}>ทั้งหมด {data.monks.length} รูป</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {data.monks.map((monk, i) => (
                <MonkCard key={i} monk={monk} size="sm" borderColor="#fcd34d" />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
