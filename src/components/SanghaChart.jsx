import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, Share, Grid as GridIcon } from 'lucide-react';
import Papa from 'papaparse';
import { SHEET_URL } from '../api/config';
import { getRankStyle } from '../utils/rankUtils';
import MonkAvatar from './MonkAvatar';

// ─── Modal ────────────────────────────────────────────────────────
function MonkModal({ monk, onClose }) {
  if (!monk) return null;
  const rs = getRankStyle(monk.sanghaRank);
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'white', borderRadius:'24px', width:'100%', maxWidth:'360px', padding:'2rem 1.5rem', position:'relative', textAlign:'center', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'#f1f5f9', border:'none', width:'32px', height:'32px', borderRadius:'50%', fontSize:'1.2rem', cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        <div style={{ width: '110px', height: '110px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f59e0b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <MonkAvatar src={monk.image} alt={monk.name} size={110} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }}/>
        </div>
        <h3 style={{ margin:'0 0 0.25rem', fontSize:'1.2rem', color:'#1e293b', fontWeight:'800' }}>{monk.name}</h3>
        <p style={{ margin:'0 0 0.5rem', color:'#f59e0b', fontWeight:'700', fontSize:'0.95rem' }}>{monk.title || monk.role}</p>
        {monk.sanghaRank && <div style={{ display:'inline-block', background:rs.bg, color:rs.color, padding:'4px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'700', marginBottom:'1rem' }}>{monk.sanghaRank}</div>}
        <div style={{ background:'#f8fafc', borderRadius:'16px', padding:'1rem', textAlign:'left', marginTop:'0.5rem' }}>
          <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:'0.25rem' }}>ข้อมูลเพิ่มเติม</div>
          <div style={{ fontSize:'0.9rem', color:'#334155' }}>ฝ่าย: {monk.department || '-'}</div>
          {monk.education && <div style={{ fontSize:'0.9rem', color:'#334155', marginTop:'0.25rem' }}>วุฒิการศึกษา: {monk.education}</div>}
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
        const rows = r.data.filter(row => row.role && row.name);
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
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '80px', fontFamily: '"Inter", "Prompt", sans-serif', marginLeft: '-1rem', marginRight: '-1rem' }}>
      
      {/* Top App Bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.25rem', background:'transparent', position:'sticky', top:0, zIndex:10 }}>
        <ChevronLeft size={24} color="#3b82f6" style={{ cursor: 'pointer' }} />
        <h1 style={{ margin:0, fontSize:'1.1rem', fontWeight:'700', color:'#1e293b' }}>Org Analytics</h1>
        <div style={{ display:'flex', gap:'1rem' }}>
          <GridIcon size={22} color="#3b82f6" style={{ cursor: 'pointer' }} />
          <Share size={22} color="#3b82f6" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ padding: '0.5rem 1.25rem 1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Leadership Card */}
          <div 
            onClick={() => abbot && setSelectedMonk(abbot)}
            style={{ background: 'white', borderRadius: '24px', padding: '1.5rem 1.25rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ width: '100%', textAlign: 'left', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '1.25rem' }}>LEADERSHIP</div>
            {abbot ? (
              <>
                <div style={{ width: '100px', height: '100px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)' }}>
                   <MonkAvatar src={abbot.image} alt={abbot.name} size={100} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }} />
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginTop: '1.25rem' }}>เจ้าอาวาส</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', textAlign:'center', lineHeight:1.2, height:'32px', overflow:'hidden' }}>{abbot.name}</div>
              </>
            ) : (
              <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{color:'#94a3b8'}}>N/A</p></div>
            )}
            <div style={{ width: '100%', background: '#fffbeb', padding: '0.85rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#b45309', marginTop: 'auto', alignSelf: 'stretch', marginLeft: '-1.25rem', marginRight: '-1.25rem', width: 'calc(100% + 2.5rem)' }}>
              Chief Executive
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Deputy Card */}
            <div 
              onClick={() => viceAbbot && setSelectedMonk(viceAbbot)}
              style={{ background: '#1c1c1e', borderRadius: '24px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.1)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#636366', letterSpacing: '1.5px', marginBottom: '1rem' }}>DEPUTY</div>
              {viceAbbot ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                    <MonkAvatar src={viceAbbot.image} alt={viceAbbot.name} size={52} style={{ width: '100%', height: '100%', objectFit: 'cover', border: 'none' }} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>รองเจ้าอาวาส</div>
                    <div style={{ fontSize: '0.65rem', color: '#a1a1aa', marginTop: '0.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{viceAbbot.name}</div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{color:'#636366'}}>N/A</p></div>
              )}
            </div>

            {/* Total Strength Card */}
            <div style={{ background: '#14b8a6', borderRadius: '24px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px -2px rgba(20, 184, 166, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: '#ccfbf1', fontWeight: '600' }}>Total Strength</div>
              <div style={{ fontSize: '2.8rem', color: 'white', fontWeight: '800', lineHeight: 1.1, marginTop:'0.25rem' }}>{totalStrength}</div>
              <Users size={22} color="rgba(255,255,255,0.7)" style={{ marginTop: '0.5rem' }} />
            </div>
          </div>
        </div>

        {/* Dept Heads Card */}
        <div style={{ background: '#5b58ef', borderRadius: '24px', padding: '1.25rem', boxShadow: '0 10px 15px -3px rgba(91, 88, 239, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c7d2fe', letterSpacing: '1.5px' }}>DEPT. HEADS</div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>
              {data.assistants.length} DIVISIONS
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
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white', letterSpacing: '1px' }}>MONKS & NOVICES</div>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>
              พระภิกษุสามเณร
            </div>
          </div>
          
          {/* Dot Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.65rem', marginBottom: '2rem' }}>
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
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Full Community Visualization</div>
            {/* Mock toggles */}
            <div style={{ display: 'flex' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', marginLeft: '-6px' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', marginLeft: '-6px' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', marginLeft: '-6px' }} />
            </div>
          </div>
        </div>

        {/* Bottom Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Support */}
          <div style={{ background: '#ffe4f2', borderRadius: '24px', padding: '1.25rem' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#e11d48', letterSpacing: '1.5px', marginBottom: '1.25rem' }}>SUPPORT</div>
             <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'1.5rem' }}>
               <div style={{ width: '80%', height: '6px', background: '#e11d48', borderRadius: '4px' }} />
               <div style={{ width: '50%', height: '6px', background: '#e11d48', borderRadius: '4px' }} />
               <div style={{ width: '90%', height: '6px', background: '#e11d48', borderRadius: '4px' }} />
             </div>
             <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#be123c' }}>Administration</div>
          </div>
          {/* Trend */}
          <div style={{ background: '#3b82f6', borderRadius: '24px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#bfdbfe', letterSpacing: '1.5px', marginBottom: '1.5rem' }}>TREND</div>
             <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'40px', marginBottom:'0.75rem', position:'relative', zIndex:2 }}>
                <div style={{ width:'12px', height:'30%', background:'rgba(255,255,255,0.4)', borderRadius:'3px' }}/>
                <div style={{ width:'12px', height:'50%', background:'rgba(255,255,255,0.6)', borderRadius:'3px' }}/>
                <div style={{ width:'12px', height:'80%', background:'rgba(255,255,255,0.8)', borderRadius:'3px' }}/>
                <div style={{ width:'12px', height:'60%', background:'white', borderRadius:'3px' }}/>
                <div style={{ width:'12px', height:'100%', background:'white', borderRadius:'3px' }}/>
             </div>
             <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600', position:'relative', zIndex:2 }}>Monthly Growth +12%</div>
             
             {/* Wave overlay background */}
             <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60%', background:'linear-gradient(to top, rgba(30,58,138,0.3), transparent)', pointerEvents:'none', zIndex:1 }}/>
          </div>
        </div>

      </div>

      {selectedMonk && <MonkModal monk={selectedMonk} onClose={() => setSelectedMonk(null)} />}
    </div>
  );
}
