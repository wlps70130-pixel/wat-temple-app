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
      <p style={{ color:'#94a3b8', fontSize:'0.9rem' }}>กำลังโหลดข้อมูล Org Analytics...</p>
    </div>
  );

  const totalStrength = data.allRows.length;
  const abbot = data.abbot;
  const viceAbbot = data.viceAbbots[0]; // Take first for the dashboard card

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '80px', fontFamily: '"Inter", "Prompt", sans-serif', marginLeft: 'calc(-1 * var(--content-pad))', marginRight: 'calc(-1 * var(--content-pad))' }}>
      
      {/* Top spacing instead of App Bar */}
      <div style={{ padding: '1.5rem var(--content-pad) 1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        
        {/* Golden Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #d4af37, #b48e4b)', 
          borderRadius: '32px', 
          padding: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          boxShadow: '0 10px 20px -5px rgba(212, 175, 55, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Mock logo square */}
          <div style={{ width: '64px', height: '64px', background: '#113333', borderRadius: '18px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0, zIndex: 1 }}>
            <span style={{ color:'white', fontSize:'24px' }}>☸️</span>
          </div>
          <div style={{ zIndex: 1 }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '700', textShadow:'0 2px 4px rgba(0,0,0,0.1)' }}>วัดหลวงพ่อสดธรรมกายาราม</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: '500' }}>สำนักปฏิบัติธรรมประจำจังหวัดราชบุรี แห่งที่ ๑</p>
          </div>
        </div>

        {/* Bento Row 1: Leadership & Deputy */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          
          {/* Leadership Card */}
          <div 
            onClick={() => abbot && setSelectedMonk(abbot)}
            style={{ background: 'white', borderRadius: '24px', padding: '1.5rem 1.25rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ width: '100%', textAlign: 'left', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '1.25rem' }}>ระดับบริหาร</div>
            {abbot ? (
              <>
                <div style={{ width: '100%', maxWidth: '100px', aspectRatio: '1/1', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)' }}>
                   <MonkAvatar src={abbot.image} alt={abbot.name} size={100} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }} />
                </div>
                <div style={{ fontSize: 'clamp(0.95rem, 4vw, 1.1rem)', fontWeight: '800', color: '#1e293b', marginTop: '1.25rem', textAlign: 'center' }}>เจ้าอาวาส</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', textAlign:'center', lineHeight:1.2, height:'32px', overflow:'hidden' }}>{abbot.royalTitle || abbot.fullName || abbot.name}</div>
              </>
            ) : (
              <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{color:'#94a3b8'}}>N/A</p></div>
            )}
            <div style={{ width: '100%', background: '#fffbeb', padding: '0.85rem 0.5rem', textAlign: 'center', fontSize: 'clamp(0.65rem, 3vw, 0.75rem)', fontWeight: '800', color: '#b45309', marginTop: 'auto', alignSelf: 'stretch', marginLeft: '-1.25rem', marginRight: '-1.25rem', width: 'calc(100% + 2.5rem)', boxSizing: 'border-box' }}>
              เจ้าสำนักปฏิบัติธรรม
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Deputy Card */}
            <div 
              onClick={() => viceAbbot && setSelectedMonk(viceAbbot)}
              style={{ background: '#1c1c1e', borderRadius: '24px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.1)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#636366', letterSpacing: '1.5px', marginBottom: '1rem' }}>รองเจ้าอาวาส</div>
              {viceAbbot ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '100%', maxWidth: '52px', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                    <MonkAvatar src={viceAbbot.image} alt={viceAbbot.name} size={52} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }} />
                  </div>
                  <div style={{ overflow: 'hidden', flex: '1 1 min-content' }}>
                    <div style={{ fontSize: 'clamp(0.85rem, 3vw, 0.9rem)', fontWeight: '800', color: 'white' }}>รองเจ้าอาวาส</div>
                    <div style={{ fontSize: 'clamp(0.6rem, 2.5vw, 0.65rem)', color: '#a1a1aa', marginTop: '0.1rem', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{viceAbbot.fullName || viceAbbot.name}</div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{color:'#636366'}}>N/A</p></div>
              )}
            </div>

            {/* Total Strength Card */}
            <div style={{ background: '#14b8a6', borderRadius: '24px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px -2px rgba(20, 184, 166, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: '#ccfbf1', fontWeight: '600' }}>รวมบุคลากรทั้งสิ้น</div>
              <div style={{ fontSize: '2.8rem', color: 'white', fontWeight: '800', lineHeight: 1.1, marginTop:'0.25rem' }}>{totalStrength}</div>
              <Users size={22} color="rgba(255,255,255,0.7)" style={{ marginTop: '0.5rem' }} />
            </div>
          </div>
        </div>

        {/* Dept Heads Card */}
        <div style={{ background: '#5b58ef', borderRadius: '24px', padding: '1.25rem', boxShadow: '0 10px 15px -3px rgba(91, 88, 239, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c7d2fe', letterSpacing: '1.5px' }}>ระดับผู้ช่วยเจ้าอาวาส</div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>
              {data.assistants.length} รูป
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {data.assistants.map((ast, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedMonk(ast)}
                style={{ 
                  width: '50px', height: '50px', 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '14px', 
                  flexShrink: 0,
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <MonkAvatar src={ast.image} alt={ast.name} size={50} style={{ width:'100%', height:'100%', objectFit:'cover', border:'none' }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#e0e7ff', marginTop: '0.5rem', fontWeight: '500' }}>บริหารจัดการฝ่ายสงฆ์และสำนักงาน</div>
        </div>

        {/* Monks & Novices Visualizer */}
        <div style={{ background: '#ff6d00', borderRadius: '24px', padding: '1.25rem 1.25rem 1.5rem', boxShadow: '0 10px 15px -3px rgba(255, 109, 0, 0.3)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white', letterSpacing: '1px' }}>พระภิกษุสามเณร</div>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>
              {data.monks.length} รูป
            </div>
          </div>
          
          {/* Dot Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))', gap: '0.65rem', marginBottom: '2rem' }}>
            {data.monks.map((monk, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedMonk(monk)}
                style={{ 
                  aspectRatio: '1/1', 
                  background: 'rgba(255,255,255,0.25)', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              >
                <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>แสดงภาพรวมทั้งหมด</div>
            {/* Mock toggles */}
            <div style={{ display: 'flex' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', marginLeft: '-6px' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', marginLeft: '-6px' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', marginLeft: '-6px' }} />
            </div>
          </div>
        </div>

      </div>

      {selectedMonk && <MonkModal monk={selectedMonk} onClose={() => setSelectedMonk(null)} />}
    </div>
  );
}
