import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, Share, Grid as GridIcon, User } from 'lucide-react';
import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/11hBRfyMG6g2qhhSSPceu1_LvmBTrp0aOkmjculEM-r0/export?format=csv';

const getRankStyle = (rank) => {
  if (!rank) return { color: '#64748b', bg: '#f1f5f9' };
  if (rank.includes('สมเด็จ')) return { color: '#7c3aed', bg: '#ede9fe' };
  if (rank.includes('พระราชาคณะ')) return { color: '#1d4ed8', bg: '#dbeafe' };
  if (rank.includes('พระครูสัญญาบัตร')) return { color: '#92400e', bg: '#fef3c7' };
  if (rank.includes('พระครู')) return { color: '#b45309', bg: '#fefce8' };
  if (rank.includes('เปรียญ')) return { color: '#0f766e', bg: '#ccfbf1' };
  return { color: '#64748b', bg: '#f1f5f9' };
};

export function MonkAvatar({ src, alt, size = 60, borderColor = '#e2e8f0', bg, style = {} }) {
  const [imgError, setImgError] = useState(false);
  const getOptimizedUrl = (url) => {
    if (!url) return null;
    const s = url.trim();
    const match = s.match(/id=([a-zA-Z0-9_-]+)/) || s.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && s.includes('drive.google.com')) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400-h400`;
    }
    return s;
  };

  if (!src || !src.trim() || imgError) {
    return (
      <div style={{ ...style, background: bg || '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', border: style.border || `2.5px solid ${borderColor}`, boxShadow: style.boxShadow }}>
        <User size={size * 0.45} color={borderColor === 'white' ? 'white' : '#94a3b8'}/>
      </div>
    );
  }

  const finalSrc = getOptimizedUrl(src);
  return (
    <img 
      src={finalSrc && finalSrc.startsWith('http://') ? finalSrc.replace('http://', 'https://') : finalSrc} 
      alt={alt || "รูปพระภิกษุ"} 
      loading="lazy"
      decoding="async"
      style={style} 
      onError={(e) => { 
        e.currentTarget.onerror = null; 
        e.currentTarget.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E";
        setImgError(true); 
      }} 
    />
  );
}

// ─── Modal ────────────────────────────────────────────────────────
function MonkModal({ monk, onClose }) {
  if (!monk) return null;
  const rs = getRankStyle(monk.sanghaRank);
  const displayName = monk.fullName || monk.name;
  const displayTitle = monk.royalTitle || monk.title || monk.name;
  const positionsStr = (monk.positions || '').replace(/;/g, '\n');
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'white', borderRadius:'24px', width:'100%', maxWidth:'360px', padding:'2rem 1.5rem', position:'relative', textAlign:'center', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'#f1f5f9', border:'none', width:'32px', height:'32px', borderRadius:'50%', fontSize:'1.2rem', cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        <div style={{ width: '110px', height: '110px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f59e0b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <MonkAvatar src={monk.image} alt={displayName} size={110} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }}/>
        </div>
        <h3 style={{ margin:'0 0 0.25rem', fontSize:'1.1rem', color:'#1e293b', fontWeight:'800' }}>{displayName}</h3>
        {monk.royalTitle && <p style={{ margin:'0 0 0.25rem', color:'#7c3aed', fontWeight:'700', fontSize:'0.9rem' }}>{monk.royalTitle}</p>}
        {monk.dharmaName && <p style={{ margin:'0 0 0.5rem', color:'#64748b', fontSize:'0.85rem' }}>ฉายา: {monk.dharmaName}</p>}
        {monk.sanghaRank && <div style={{ display:'inline-block', background:rs.bg, color:rs.color, padding:'4px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'700', marginBottom:'1rem' }}>{monk.sanghaRank}</div>}
        
        <div style={{ background:'#f8fafc', borderRadius:'16px', padding:'1rem', textAlign:'left', marginTop:'0.5rem' }}>
          {positionsStr && <div style={{ fontSize:'0.85rem', color:'#334155', marginBottom:'0.5rem', whiteSpace:'pre-line' }}><strong>ตำแหน่ง:</strong> {positionsStr}</div>}
          {monk.duty && <div style={{ fontSize:'0.85rem', color:'#334155', marginBottom:'0.25rem' }}><strong>หน้าที่:</strong> {monk.duty}</div>}
          {monk.nikaya && <div style={{ fontSize:'0.85rem', color:'#334155', marginBottom:'0.25rem' }}><strong>นิกาย:</strong> {monk.nikaya}</div>}
          {monk.temple && <div style={{ fontSize:'0.85rem', color:'#334155', marginBottom:'0.25rem' }}><strong>วัด:</strong> {monk.temple}</div>}
          {(monk.naktham || monk.pali || monk.secular) && (
            <div style={{ borderTop:'1px dashed #e2e8f0', marginTop:'0.5rem', paddingTop:'0.5rem' }}>
              <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.25rem', fontWeight:'600' }}>การศึกษา</div>
              {monk.naktham && <div style={{ fontSize:'0.85rem', color:'#334155' }}>นักธรรม: {monk.naktham}</div>}
              {monk.pali && <div style={{ fontSize:'0.85rem', color:'#334155' }}>เปรียญธรรม: ป.ธ. {monk.pali}</div>}
              {monk.secular && <div style={{ fontSize:'0.85rem', color:'#334155' }}>สามัญ: {monk.secular}</div>}
            </div>
          )}
          {monk.birthDate && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:'0.5rem' }}>วันเกิด: {monk.birthDate}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function SanghaChart() {
  const [data, setData] = useState({ abbot: null, viceAbbots: [], assistants: [], monks: [], allRows: [] });
  const [loading, setLoading] = useState(true);
  const [selectedMonk, setSelectedMonk] = useState(null);

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true, header: true,
      complete: (r) => {
        const rows = r.data.filter(row => row.role && (row.name || row.fullName));
        setData({
          abbot: rows.find(r => r.role==='abbot')||null,
          viceAbbots: rows.filter(r => r.role==='viceAbbot'),
          assistants: rows.filter(r => r.role==='assistant'),
          monks: rows.filter(r => r.role==='monk'),
          allRows: rows,
        });
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'300px', gap:'1rem' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <p style={{ color:'#94a3b8', fontSize:'0.9rem' }}>กำลังโหลดข้อมูลบุคลากร...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalStrength = data.allRows.length;
  const abbot = data.abbot;
  const viceAbbot = data.viceAbbots[0];

  const cardStyle = {
    background: 'white', borderRadius: '16px', padding: '1.25rem',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  };

  // Person row component
  const PersonRow = ({ monk, label, showBorder = true }) => (
    <div 
      onClick={() => setSelectedMonk(monk)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: showBorder ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #e2e8f0' }}>
        <MonkAvatar src={monk.image} alt={monk.fullName || monk.name} size={44} style={{ width:'100%', height:'100%', objectFit:'cover', border:'none' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{monk.fullName || monk.name}</div>
        {label && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{label}</div>}
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '1.2rem', flexShrink: 0 }}>›</div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: '"Prompt", "Inter", sans-serif', marginLeft: 'calc(-1 * var(--content-pad))', marginRight: 'calc(-1 * var(--content-pad))' }}>
      <div style={{ padding: '1.25rem var(--content-pad)', display:'flex', flexDirection:'column', gap:'1rem' }}>

        {/* ── Page Title ── */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', borderRadius: '16px', padding: '1.25rem 1.5rem', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>บุคลากร (Personnel)</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.8 }}>สำนักปฏิบัติธรรมประจำจังหวัดราชบุรี แห่งที่ ๑</p>
        </div>

        {/* ── Abbot Hero Card (Dark) ── */}
        {abbot && (
          <div 
            onClick={() => setSelectedMonk(abbot)}
            style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <div style={{ width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid #6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              <MonkAvatar src={abbot.image} alt={abbot.name} size={100} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }} />
            </div>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.15rem', fontWeight: '800' }}>{abbot.royalTitle || abbot.fullName || abbot.name}</h2>
            {abbot.sanghaRank && (
              <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', marginTop: '0.5rem' }}>{abbot.sanghaRank}</div>
            )}
            {abbot.positions && (
              <p style={{ margin: '0.75rem 0 0', color: '#94a3b8', fontSize: '0.75rem', lineHeight: 1.5 }}>
                {abbot.positions.replace(/;/g, ' · ')}
              </p>
            )}
            {(abbot.pali || abbot.secular) && (
              <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.7rem' }}>
                {abbot.pali ? `ป.ธ. ${abbot.pali}` : ''}{abbot.pali && abbot.secular ? ' | ' : ''}{abbot.secular || ''}
              </p>
            )}
          </div>
        )}

        {/* ── Total Count ── */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
          <Users size={24} color="#6366f1" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>รวมบุคลากรทั้งสิ้น</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>{totalStrength}</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>รูป</span>
            </div>
          </div>
        </div>

        {/* ── Section: Org Structure ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🏛️</span>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>โครงสร้างการบริหารงาน</h3>
        </div>

        {/* ── Vice Abbot ── */}
        {viceAbbot && (
          <div style={cardStyle}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6366f1', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>รองเจ้าอาวาส (VICE ABBOT)</div>
            <PersonRow monk={viceAbbot} label={viceAbbot.sanghaRank || 'รองเจ้าอาวาส'} showBorder={false} />
          </div>
        )}

        {/* ── Assistant Abbots ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6366f1', letterSpacing: '0.5px' }}>ผู้ช่วยเจ้าอาวาส (ASSISTANT ABBOTS)</div>
            <div style={{ background: '#ede9fe', color: '#6366f1', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>{data.assistants.length}</div>
          </div>
          {data.assistants.map((ast, i) => (
            <PersonRow key={i} monk={ast} label={ast.sanghaRank || ast.duty || 'ผู้ช่วยเจ้าอาวาส'} showBorder={i < data.assistants.length - 1} />
          ))}
        </div>

        {/* ── Monks & Novices ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#f59e0b', letterSpacing: '0.5px' }}>พระภิกษุสามเณร (MONKS & NOVICES)</div>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>{data.monks.length}</div>
          </div>
          
          {/* Grid of small avatar circles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '0.5rem' }}>
            {data.monks.map((monk, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedMonk(monk)}
                style={{ aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f1f5f9', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
              >
                <MonkAvatar src={monk.image} alt={monk.fullName || monk.name} size={44} style={{ width:'100%', height:'100%', objectFit:'cover', border:'none' }} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {selectedMonk && <MonkModal monk={selectedMonk} onClose={() => setSelectedMonk(null)} />}
    </div>
  );
}
