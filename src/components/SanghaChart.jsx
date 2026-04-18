import React, { useState, useEffect } from 'react';
import { User, Users, Loader2, X, BookOpen, Award, Calendar, FileText, Clock, Star } from 'lucide-react';
import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/11hBRfyMG6g2qhhSSPceu1_LvmBTrp0aOkmjculEM-r0/export?format=csv';

// ─── Utility Functions ───────────────────────────────────────────
const calcAge = (birthDate) => {
  if (!birthDate) return null;
  const [d, m, y] = birthDate.split('/').map(Number);
  if (!y) return null;
  const birthYear = y > 2400 ? y - 543 : y; // พ.ศ. → ค.ศ.
  const age = new Date().getFullYear() - birthYear;
  return age;
};

const calcPhansa = (ordinationDate) => {
  if (!ordinationDate) return null;
  const [d, m, y] = ordinationDate.split('/').map(Number);
  if (!y) return null;
  const ordYear = y > 2400 ? y - 543 : y;
  return new Date().getFullYear() - ordYear;
};

const SANGHA_RANKS = {
  'สมเด็จพระสังฆราช': { color: '#7c3aed', bg: '#ede9fe' },
  'สมเด็จพระราชาคณะ': { color: '#7c3aed', bg: '#ede9fe' },
  'พระราชาคณะเจ้าคณะรอง': { color: '#1d4ed8', bg: '#dbeafe' },
  'พระราชาคณะชั้นธรรม': { color: '#0369a1', bg: '#e0f2fe' },
  'พระราชาคณะชั้นเทพ': { color: '#0369a1', bg: '#e0f2fe' },
  'พระราชาคณะชั้นราช': { color: '#0369a1', bg: '#e0f2fe' },
  'พระราชาคณะชั้นสามัญ': { color: '#15803d', bg: '#dcfce7' },
  'พระครูสัญญาบัตร': { color: '#92400e', bg: '#fef3c7' },
  'พระครูฐานานุกรม': { color: '#92400e', bg: '#fef3c7' },
  'พระครูประทวน': { color: '#92400e', bg: '#fef3c7' },
  'พระเปรียญธรรม': { color: '#0f766e', bg: '#ccfbf1' },
};
const getRankStyle = (rank) => {
  for (const key of Object.keys(SANGHA_RANKS)) {
    if (rank && rank.includes(key)) return SANGHA_RANKS[key];
  }
  return { color: '#64748b', bg: '#f1f5f9' };
};

// ─── Section Header ──────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0 0.75rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
    <div style={{ color: '#d97706' }}>{icon}</div>
    <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#374151' }}>{title}</span>
  </div>
);

const InfoRow = ({ label, value }) => {
  if (!value || String(value).trim() === '') return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.45rem 0', borderBottom: '1px solid #f8fafc', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', width: '110px', flexShrink: 0, paddingTop: '1px' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: '500', lineHeight: 1.4 }}>{value}</span>
    </div>
  );
};

// ─── Full Detail Modal ───────────────────────────────────────────
function MonkModal({ monk, onClose }) {
  const [tab, setTab] = useState('info');
  if (!monk) return null;

  const age = calcAge(monk.birthDate);
  const phansa = calcPhansa(monk.ordinationDate);
  const rankStyle = getRankStyle(monk.sanghaRank);

  const timeline = (monk.timeline || '').split(';').filter(Boolean).map(e => {
    const [year, ...rest] = e.split(':');
    return { year: year?.trim(), detail: rest.join(':').trim() };
  }).filter(t => t.year && t.detail);

  const publications = (monk.publications || '').split(';').filter(Boolean).map(p => p.trim()).filter(Boolean);
  const positions = (monk.positions || '').split(';').filter(Boolean).map(p => p.trim()).filter(Boolean);
  const secular = (monk.secular || '').split(';').filter(Boolean).map(s => s.trim()).filter(Boolean);

  const TABS = [
    { id: 'info', label: '🧑 ข้อมูล' },
    { id: 'edu', label: '📚 การศึกษา' },
    { id: 'history', label: '📅 ประวัติ' },
    { id: 'works', label: '✍️ ผลงาน' },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.4,0.64,1)' }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.65rem 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#e2e8f0' }} />
        </div>

        {/* Hero Header */}
        <div style={{ background: 'linear-gradient(135deg, #78350f, #d97706 60%, #fbbf24)', padding: '1.25rem 1rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={15} />
          </button>
          {monk.image && monk.image.trim() !== '' ? (
            <img src={monk.image} alt={monk.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.85)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0 }}>
              <User size={36} color="white" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {monk.royalTitle && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginBottom: '2px' }}>{monk.royalTitle}</div>}
            <div style={{ fontSize: '1.05rem', color: 'white', fontWeight: '800', lineHeight: 1.25 }}>{monk.name}</div>
            {monk.fullName && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{monk.fullName}</div>}
            {monk.sanghaRank && (
              <div style={{ display: 'inline-block', marginTop: '5px', background: rankStyle.bg, color: rankStyle.color, fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
                {monk.sanghaRank}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '0.7rem 0.25rem', fontSize: '0.7rem', fontWeight: tab === t.id ? '800' : '600', color: tab === t.id ? '#d97706' : '#94a3b8', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #d97706' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 1.25rem 2rem' }}>

          {/* TAB: ข้อมูลทั่วไป */}
          {tab === 'info' && (
            <>
              <SectionHeader icon={<User size={14} />} title="ข้อมูลส่วนตัว" />
              <InfoRow label="ราชทินนาม" value={monk.royalTitle} />
              <InfoRow label="ชื่อ-นามสกุล" value={monk.fullName} />
              <InfoRow label="ฉายา" value={monk.dharmaName} />
              <InfoRow label="วันเกิด" value={monk.birthDate ? `${monk.birthDate}${age ? ` (อายุ ${age} ปี)` : ''}` : null} />
              <InfoRow label="วันอุปสมบท" value={monk.ordinationDate ? `${monk.ordinationDate}${phansa ? ` (${phansa} พรรษา)` : ''}` : null} />
              <InfoRow label="สมณศักดิ์" value={monk.sanghaRank} />
              <InfoRow label="ตำแหน่ง" value={monk.title} />

              <SectionHeader icon={<FileText size={14} />} title="ข้อมูล/ใบสุทธิ" />
              <InfoRow label="สังกัดวัด" value={monk.temple} />
              <InfoRow label="นิกาย" value={monk.nikaya} />
              <InfoRow label="เลขที่ใบสุทธิ" value={monk.certNumber} />
              {monk.docUrl && monk.docUrl.trim() !== '' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a href={monk.docUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#2563eb', fontWeight: '700', textDecoration: 'none', background: '#eff6ff', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
                    <FileText size={13} /> ดูเอกสาร/ใบสุทธิ
                  </a>
                </div>
              )}

              {positions.length > 0 && (
                <>
                  <SectionHeader icon={<Award size={14} />} title="ตำแหน่งการปกครอง" />
                  {positions.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.35rem 0' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.82rem', color: '#1e293b' }}>{p}</span>
                    </div>
                  ))}
                </>
              )}
              <InfoRow label="หน้าที่" value={monk.duty} />
              <InfoRow label="หมายเหตุ" value={monk.note} />
            </>
          )}

          {/* TAB: การศึกษา */}
          {tab === 'edu' && (
            <>
              <SectionHeader icon={<BookOpen size={14} />} title="การศึกษาทางธรรม" />
              <InfoRow label="นักธรรม" value={monk.naktham} />
              <InfoRow label="เปรียญธรรม" value={monk.pali ? `ป.ธ. ${monk.pali}` : null} />

              {secular.length > 0 && (
                <>
                  <SectionHeader icon={<BookOpen size={14} />} title="การศึกษาทางโลก" />
                  {secular.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.35rem 0', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: '6px' }} />
                      <span style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.4 }}>{s}</span>
                    </div>
                  ))}
                </>
              )}
              {!monk.naktham && !monk.pali && secular.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', marginTop: '2rem' }}>🙏 ยังไม่มีข้อมูลการศึกษา</p>
              )}
            </>
          )}

          {/* TAB: ประวัติ Timeline */}
          {tab === 'history' && (
            <>
              <SectionHeader icon={<Clock size={14} />} title="ประวัติ (Timeline)" />
              {timeline.length > 0 ? (
                <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                  <div style={{ position: 'absolute', left: '0', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, #fbbf24, #e2e8f0)' }} />
                  {timeline.map((t, i) => (
                    <div key={i} style={{ position: 'relative', paddingLeft: '1.25rem', paddingBottom: '1.1rem' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24', border: '2px solid white', boxShadow: '0 0 0 2px #fbbf24' }} />
                      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#d97706', marginBottom: '2px' }}>พ.ศ. {t.year}</div>
                      <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4 }}>{t.detail}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', marginTop: '2rem' }}>🙏 ยังไม่มีข้อมูลประวัติ</p>
              )}
            </>
          )}

          {/* TAB: ผลงาน */}
          {tab === 'works' && (
            <>
              <SectionHeader icon={<Star size={14} />} title="ผลงานทางวิชาการ" />
              {publications.length > 0 ? publications.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: '700', color: '#d97706' }}>{i + 1}</div>
                  <span style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.5, paddingTop: '4px' }}>{p}</span>
                </div>
              )) : (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', marginTop: '2rem' }}>🙏 ยังไม่มีข้อมูลผลงาน</p>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(80px);opacity:0 } to { transform:translateY(0);opacity:1 } }
      `}</style>
    </div>
  );
}

// ─── Monk Card ───────────────────────────────────────────────────
function MonkCard({ monk, size = 'md', borderColor = '#f59e0b' }) {
  const [open, setOpen] = useState(false);
  const av = size === 'lg' ? 72 : size === 'md' ? 52 : 40;
  const ns = { lg: '1rem', md: '0.82rem', sm: '0.72rem' };
  const ts = { lg: '0.78rem', md: '0.68rem', sm: '0.62rem' };
  const pd = { lg: '1.1rem 0.85rem', md: '0.8rem 0.5rem', sm: '0.65rem 0.35rem' };

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ background: 'white', borderRadius: '16px', textAlign: 'center', padding: pd[size], borderTop: `3px solid ${borderColor}`, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', position: 'relative', userSelect: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.11)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
      >
        <div style={{ position: 'absolute', top: '5px', right: '7px', fontSize: '0.5rem', color: '#cbd5e1', fontWeight: '700' }}>TAP</div>
        {monk.image && monk.image.trim() !== '' ? (
          <img src={monk.image} alt={monk.name} style={{ width: `${av}px`, height: `${av}px`, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${borderColor}` }} />
        ) : (
          <div style={{ width: `${av}px`, height: `${av}px`, borderRadius: '50%', background: `${borderColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${borderColor}` }}>
            <User size={av * 0.45} color={borderColor} />
          </div>
        )}
        {monk.title && <div style={{ fontSize: ts[size], color: '#d97706', fontWeight: '700', lineHeight: 1.2 }}>{monk.title}</div>}
        <div style={{ fontSize: ns[size], color: '#1e293b', fontWeight: '700', lineHeight: 1.25 }}>{monk.name}</div>
        {monk.sanghaRank && (() => { const rs = getRankStyle(monk.sanghaRank); return <div style={{ fontSize: '0.55rem', color: rs.color, background: rs.bg, padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>{monk.sanghaRank}</div>; })()}
      </div>
      {open && <MonkModal monk={monk} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function SanghaChart() {
  const [data, setData] = useState({ abbot: null, viceAbbots: [], assistants: [], monks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true, header: true,
      complete: (r) => {
        const rows = r.data.filter(row => row.role && row.name);
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

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
      <Loader2 size={32} color="#eab308" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>กำลังโหลดข้อมูลคณะสงฆ์...</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );

  const Line = () => (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0' }}>
      <div style={{ width: '2px', height: '1.75rem', background: 'linear-gradient(to bottom, #fbbf24, #e2e8f0)' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem', marginBottom: '0.25rem' }}>
        <Users size={22} color="#d97706" />
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>ผังคณะสงฆ์วัดหลวงพ่อสดฯ</h2>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', margin: '-0.2rem 0 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
        <span>👆</span> กดที่การ์ดเพื่อดูข้อมูลรายละเอียด
      </p>

      {data.abbot && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 18%' }}>
          <MonkCard monk={data.abbot} size="lg" borderColor="#ca8a04" />
        </div>
      )}

      {data.viceAbbots.length > 0 && (
        <><Line />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', padding: '0 0.1rem' }}>
            {data.viceAbbots.map((m, i) => <div key={i} style={{ flex: '1 1 calc(50% - 0.275rem)' }}><MonkCard monk={m} size="md" borderColor="#f59e0b" /></div>)}
          </div>
        </>
      )}

      {data.assistants.length > 0 && (
        <><Line />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem', padding: '0 0.1rem' }}>
            {data.assistants.map((m, i) => <MonkCard key={i} monk={m} size="sm" borderColor="#fbbf24" />)}
          </div>
        </>
      )}

      {data.monks.length > 0 && (
        <><Line />
          <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef9c3)', borderRadius: '18px', padding: '1rem 0.85rem', border: '1px solid #fde68a' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#92400e' }}>พระภิกษุสามเณร</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309' }}>ทั้งหมด {data.monks.length} รูป</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem' }}>
              {data.monks.map((m, i) => <MonkCard key={i} monk={m} size="sm" borderColor="#fcd34d" />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
