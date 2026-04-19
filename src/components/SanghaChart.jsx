import React, { useState, useEffect } from 'react';
import { User, Users, Loader2, X, BookOpen, Award, Calendar, FileText, Clock, Star, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

// แผนกงานทั้งหมด (hardcoded ชื่อ แต่สมาชิกดึงจาก Sheet)
const DEPARTMENTS = [
  { id:'dept-province', name:'งานเจ้าคณะจังหวัดราชบุรี', emoji:'🏛️', color:'#7c3aed', bg:'#ede9fe' },
  { id:'dept-naktham',  name:'แผนกนักธรรม',               emoji:'📖', color:'#1d4ed8', bg:'#dbeafe' },
  { id:'dept-pali',     name:'แผนกบาลี',                  emoji:'📜', color:'#0f766e', bg:'#ccfbf1' },
  { id:'dept-media',    name:'แผนกสื่อและประชาสัมพันธ์', emoji:'📡', color:'#0ea5e9', bg:'#e0f2fe' },
  { id:'dept-maint',    name:'แผนกซ่อมบำรุง',             emoji:'🔧', color:'#b45309', bg:'#fef3c7' },
  { id:'dept-vipass',   name:'แผนกวิปัสสนาจารย์',        emoji:'🧘', color:'#16a34a', bg:'#dcfce7' },
  { id:'dept-sound',    name:'แผนกเครื่องเสียง',          emoji:'🎙️', color:'#dc2626', bg:'#fee2e2' },
  { id:'dept-kitchen',  name:'แผนกโรงครัว',               emoji:'🍲', color:'#d97706', bg:'#fef3c7' },
];

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/11hBRfyMG6g2qhhSSPceu1_LvmBTrp0aOkmjculEM-r0/export?format=csv';

const calcAge = (d) => { if (!d) return null; const [,, y] = d.split('/').map(Number); if (!y) return null; return new Date().getFullYear() - (y > 2400 ? y - 543 : y); };
const calcPhansa = (d) => { if (!d) return null; const [,, y] = d.split('/').map(Number); if (!y) return null; return new Date().getFullYear() - (y > 2400 ? y - 543 : y); };

const getRankStyle = (rank) => {
  if (!rank) return { color: '#64748b', bg: '#f1f5f9' };
  if (rank.includes('สมเด็จ')) return { color: '#7c3aed', bg: '#ede9fe' };
  if (rank.includes('พระราชาคณะ')) return { color: '#1d4ed8', bg: '#dbeafe' };
  if (rank.includes('พระครูสัญญาบัตร')) return { color: '#92400e', bg: '#fef3c7' };
  if (rank.includes('พระครู')) return { color: '#b45309', bg: '#fefce8' };
  if (rank.includes('เปรียญ')) return { color: '#0f766e', bg: '#ccfbf1' };
  return { color: '#64748b', bg: '#f1f5f9' };
};

// ─── Image Avatar Component (แก้ปัญหารูปไม่ขึ้นบนบางเครื่อง/Safari) ───
function MonkAvatar({ src, alt, size, borderColor, style, bg }) {
  const [imgError, setImgError] = useState(false);

  const getOptimizedUrl = (url) => {
    if (!url) return '';
    const s = url.trim();
    // ถ้าเป็น Google Drive URL ให้แปลงเป็น Thumbnail API เพื่อลดปัญหา Cookie/Cross-Origin บนมือถือ
    const match = s.match(/id=([a-zA-Z0-9_-]+)/) || s.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && s.includes('drive.google.com')) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400-h400`;
    }
    return s;
  };

  // ถ้ารูปโหลดพัง หรือไม่มีรูป ให้แสดงไอคอนแทน
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

// ─── Modal ──────────────────────────────────────────────────────
function MonkModal({ monk, onClose }) {
  const [tab, setTab] = useState('info');
  if (!monk) return null;
  const age = calcAge(monk.birthDate);
  const phansa = calcPhansa(monk.ordinationDate);
  const rs = getRankStyle(monk.sanghaRank);
  const timeline = (monk.timeline || '').split(';').filter(Boolean).map(e => { const [y, ...r] = e.split(':'); return { year: y?.trim(), detail: r.join(':').trim() }; }).filter(t => t.year && t.detail);
  const publications = (monk.publications || '').split(';').filter(Boolean).map(p => p.trim()).filter(Boolean);
  const positions = (monk.positions || '').split(';').filter(Boolean).map(p => p.trim()).filter(Boolean);
  const secular = (monk.secular || '').split(';').filter(Boolean).map(s => s.trim()).filter(Boolean);
  const IR = ({ label, value }) => !value || !String(value).trim() ? null : (
    <div style={{ display:'flex', gap:'0.5rem', padding:'0.45rem 0', borderBottom:'1px solid #f8fafc', alignItems:'flex-start' }}>
      <span style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:'700', width:'108px', flexShrink:0, paddingTop:'1px' }}>{label}</span>
      <span style={{ fontSize:'0.82rem', color:'#1e293b', fontWeight:'500', lineHeight:1.4 }}>{value}</span>
    </div>
  );
  const SH = ({ icon, title }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', margin:'1.1rem 0 0.65rem', borderBottom:'2px solid #f1f5f9', paddingBottom:'0.4rem' }}>
      <span style={{ color:'#d97706' }}>{icon}</span>
      <span style={{ fontWeight:'800', fontSize:'0.82rem', color:'#374151' }}>{title}</span>
    </div>
  );
  const TABS = [{ id:'info', label:'🧑 ข้อมูล' }, { id:'edu', label:'📚 การศึกษา' }, { id:'history', label:'📅 ประวัติ' }, { id:'works', label:'✍️ ผลงาน' }];
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'24px 24px 0 0', width:'100%', maxWidth:'480px', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'slideUp .28s cubic-bezier(.34,1.4,.64,1)' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'0.6rem 0 0' }}><div style={{ width:'36px', height:'4px', borderRadius:'2px', background:'#e2e8f0' }} /></div>
        <div style={{ background:'linear-gradient(135deg,#78350f,#d97706 60%,#fbbf24)', padding:'1.1rem 1rem 1rem', display:'flex', alignItems:'center', gap:'1rem', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:'0.7rem', right:'0.7rem', background:'rgba(255,255,255,0.2)', border:'none', cursor:'pointer', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}><X size={15} /></button>
          <MonkAvatar 
            src={monk.image} 
            alt={monk.name} 
            size={76} 
            borderColor="white"
            bg="rgba(255,255,255,0.15)"
            style={{ width:'76px', height:'76px', borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.85)', flexShrink:0 }} 
          />
          <div style={{ flex:1, minWidth:0 }}>
            {monk.royalTitle && <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.85)', fontWeight:'700', marginBottom:'2px' }}>{monk.royalTitle}</div>}
            <div style={{ fontSize:'1.05rem', color:'white', fontWeight:'800', lineHeight:1.2 }}>{monk.name}</div>
            {monk.fullName && <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.75)', marginTop:'2px' }}>{monk.fullName}</div>}
            {monk.sanghaRank && <div style={{ display:'inline-block', marginTop:'5px', background:rs.bg, color:rs.color, fontSize:'0.62rem', fontWeight:'700', padding:'2px 7px', borderRadius:'20px' }}>{monk.sanghaRank}</div>}
          </div>
        </div>
        <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9', background:'#fafafa' }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'0.65rem 0.1rem', fontSize:'0.68rem', fontWeight:tab===t.id?'800':'600', color:tab===t.id?'#d97706':'#94a3b8', background:'none', border:'none', borderBottom:tab===t.id?'2px solid #d97706':'2px solid transparent', cursor:'pointer' }}>{t.label}</button>)}
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'0 1.1rem 2rem' }}>
          {tab === 'info' && (<>
            <SH icon={<User size={13}/>} title="ข้อมูลส่วนตัว" />
            <IR label="ราชทินนาม" value={monk.royalTitle} /><IR label="ชื่อ-นามสกุล" value={monk.fullName} /><IR label="ฉายา" value={monk.dharmaName} />
            <IR label="วันเกิด" value={monk.birthDate ? `${monk.birthDate}${age?` (อายุ ${age} ปี)`:''}` : null} />
            <IR label="วันอุปสมบท" value={monk.ordinationDate ? `${monk.ordinationDate}${phansa?` (${phansa} พรรษา)`:''}` : null} />
            <IR label="สมณศักดิ์" value={monk.sanghaRank} /><IR label="ตำแหน่ง" value={monk.title} />
            <SH icon={<FileText size={13}/>} title="ข้อมูล/ใบสุทธิ" />
            <IR label="สังกัดวัด" value={monk.temple} /><IR label="นิกาย" value={monk.nikaya} /><IR label="เลขที่ใบสุทธิ" value={monk.certNumber} />
            {monk.docUrl?.trim() && <div style={{ marginTop:'0.5rem' }}><a href={monk.docUrl} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', fontSize:'0.75rem', color:'#2563eb', fontWeight:'700', textDecoration:'none', background:'#eff6ff', padding:'0.35rem 0.75rem', borderRadius:'10px' }}><FileText size={12}/> ดูเอกสาร/ใบสุทธิ</a></div>}
            {positions.length > 0 && (<><SH icon={<Award size={13}/>} title="ตำแหน่งการปกครอง" />{positions.map((p,i) => <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.3rem 0' }}><div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#d97706', flexShrink:0 }}/><span style={{ fontSize:'0.82rem', color:'#1e293b' }}>{p}</span></div>)}</>)}
            <IR label="หน้าที่" value={monk.duty} /><IR label="หมายเหตุ" value={monk.note} />
          </>)}
          {tab === 'edu' && (<>
            <SH icon={<BookOpen size={13}/>} title="การศึกษาทางธรรม" />
            <IR label="นักธรรม" value={monk.naktham} />
            <IR label="เปรียญธรรม" value={monk.pali ? `ป.ธ. ${monk.pali}` : null} />
            {secular.length > 0 && (<><SH icon={<BookOpen size={13}/>} title="การศึกษาทางโลก" />{secular.map((s,i) => <div key={i} style={{ display:'flex', gap:'0.5rem', padding:'0.35rem 0', borderBottom:'1px solid #f8fafc' }}><div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#2563eb', flexShrink:0, marginTop:'6px' }}/><span style={{ fontSize:'0.82rem', color:'#1e293b', lineHeight:1.4 }}>{s}</span></div>)}</>)}
            {!monk.naktham && !monk.pali && secular.length===0 && <p style={{ color:'#94a3b8', fontSize:'0.82rem', textAlign:'center', marginTop:'2rem' }}>🙏 ยังไม่มีข้อมูลการศึกษา</p>}
          </>)}
          {tab === 'history' && (<>
            <SH icon={<Clock size={13}/>} title="ประวัติ (Timeline)" />
            {timeline.length > 0 ? <div style={{ position:'relative', paddingLeft:'1rem' }}>
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'2px', background:'linear-gradient(to bottom,#fbbf24,#e2e8f0)' }}/>
              {timeline.map((t,i) => <div key={i} style={{ position:'relative', paddingLeft:'1.25rem', paddingBottom:'1rem' }}>
                <div style={{ position:'absolute', left:'-5px', top:'3px', width:'12px', height:'12px', borderRadius:'50%', background:'#fbbf24', border:'2px solid white', boxShadow:'0 0 0 2px #fbbf24' }}/>
                <div style={{ fontSize:'0.68rem', fontWeight:'800', color:'#d97706', marginBottom:'2px' }}>พ.ศ. {t.year}</div>
                <div style={{ fontSize:'0.82rem', color:'#374151', lineHeight:1.4 }}>{t.detail}</div>
              </div>)}
            </div> : <p style={{ color:'#94a3b8', fontSize:'0.82rem', textAlign:'center', marginTop:'2rem' }}>🙏 ยังไม่มีข้อมูลประวัติ</p>}
          </>)}
          {tab === 'works' && (<>
            <SH icon={<Star size={13}/>} title="ผลงานทางวิชาการ" />
            {publications.length > 0 ? publications.map((p,i) => <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', padding:'0.6rem 0', borderBottom:'1px solid #f1f5f9' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'8px', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.72rem', fontWeight:'800', color:'#d97706' }}>{i+1}</div>
              <span style={{ fontSize:'0.82rem', color:'#1e293b', lineHeight:1.5, paddingTop:'3px' }}>{p}</span>
            </div>) : <p style={{ color:'#94a3b8', fontSize:'0.82rem', textAlign:'center', marginTop:'2rem' }}>🙏 ยังไม่มีข้อมูลผลงาน</p>}
          </>)}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

// ─── Monk Card ───────────────────────────────────────────────────
function MonkCard({ monk, avatarSize = 60, nameFontSize = '0.88rem', titleFontSize = '0.72rem', borderColor = '#f59e0b', showRank = false, showTitle = true }) {
  const [open, setOpen] = useState(false);
  const rs = getRankStyle(monk.sanghaRank);
  return (
    <>
      <div onClick={() => setOpen(true)} style={{ background:'white', borderRadius:'18px', textAlign:'center', padding:'1rem 0.6rem 0.85rem', borderTop:`3px solid ${borderColor}`, boxShadow:'0 2px 12px rgba(0,0,0,0.07)', cursor:'pointer', transition:'all 0.18s', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem', position:'relative', userSelect:'none', width:'100%', boxSizing:'border-box' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 24px rgba(0,0,0,0.13)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'; }}>
        <div style={{ position:'absolute', top:'6px', right:'8px', fontSize:'0.5rem', color:'#d1d5db', fontWeight:'700', letterSpacing:'0.5px' }}>TAP</div>
        <MonkAvatar 
          src={monk.image} 
          alt={monk.name} 
          size={avatarSize} 
          borderColor={borderColor}
          style={{ width:`${avatarSize}px`, height:`${avatarSize}px`, borderRadius:'50%', objectFit:'cover', border:`2.5px solid ${borderColor}`, boxShadow:'0 3px 10px rgba(0,0,0,0.12)' }}
        />
        {showTitle && monk.title && <div style={{ fontSize:titleFontSize, color:'#b45309', fontWeight:'800', lineHeight:1.2, marginTop:'2px' }}>{monk.title}</div>}
        <div style={{ fontSize:nameFontSize, color:'#1e293b', fontWeight:'800', lineHeight:1.25, textAlign:'center' }}>{monk.name}</div>
        {showRank && monk.sanghaRank && <div style={{ fontSize:'0.55rem', color:rs.color, background:rs.bg, padding:'1px 7px', borderRadius:'20px', fontWeight:'700', marginTop:'1px' }}>{monk.sanghaRank}</div>}
      </div>
      {open && <MonkModal monk={monk} onClose={() => setOpen(false)}/>}
    </>
  );
}

// ─── Org Chart Tree Lines ────────────────────────────────────────
const VLine = ({ height = 28 }) => <div style={{ display:'flex', justifyContent:'center' }}><div style={{ width:'2px', height:`${height}px`, background:'linear-gradient(to bottom,#fbbf24,#fed7aa)' }}/></div>;
const HBranch = ({ count }) => {
  if (count <= 1) return null;
  return (
    <div style={{ display:'flex', justifyContent:'center', position:'relative', height:'20px', margin:'-4px 0' }}>
      <div style={{ position:'absolute', left:'25%', right:'25%', height:'2px', background:'#fed7aa', top:'10px' }}/>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ flex:1, display:'flex', justifyContent:'center' }}>
          <div style={{ width:'2px', height:'10px', background:'#fed7aa', marginTop:'10px' }}/>
        </div>
      ))}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────
export default function SanghaChart() {
  const [data, setData] = useState({ abbot: null, viceAbbots: [], assistants: [], monks: [], allRows: [] });
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState(null);

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
      <Loader2 size={32} color="#eab308" style={{ animation:'spin 1s linear infinite' }}/>
      <p style={{ color:'#94a3b8', fontSize:'0.9rem' }}>กำลังโหลดข้อมูลคณะสงฆ์...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', padding:'0 0.25rem' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
        <Users size={22} color="#d97706"/>
        <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:'800', color:'#1e293b' }}>ผังคณะสงฆ์วัดหลวงพ่อสดฯ</h2>
      </div>
      <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#94a3b8', margin:'0 0 0.75rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.25rem' }}>
        <span>👆</span> กดที่การ์ดเพื่อดูข้อมูลรายละเอียด
      </p>

      {/* Level 1: Abbot — center, wide */}
      {data.abbot && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ textAlign:'center', marginBottom:'0.75rem' }}>
            <div style={{ fontSize:'1.05rem', fontWeight:'800', color:'#b45309', background:'#fef3c7', display:'inline-block', padding:'4px 18px', borderRadius:'20px', boxShadow:'0 2px 8px rgba(251,191,36,0.2)' }}>เจ้าอาวาส</div>
          </div>
          <div style={{ width:'60%', maxWidth:'220px' }}>
            <MonkCard monk={data.abbot} avatarSize={72} nameFontSize="0.95rem" borderColor="#ca8a04" showRank showTitle={false} />
          </div>
        </div>
      )}

      {/* Level 2: Vice Abbots */}
      {data.viceAbbots.length > 0 && (
        <>
          <VLine height={24}/>
          <div style={{ textAlign:'center', marginBottom:'0.75rem' }}>
            <div style={{ fontSize:'0.95rem', fontWeight:'800', color:'#b45309', background:'#fef3c7', display:'inline-block', padding:'4px 16px', borderRadius:'20px', boxShadow:'0 2px 8px rgba(251,191,36,0.15)' }}>รองเจ้าอาวาส</div>
          </div>
          {data.viceAbbots.length > 1 && <HBranch count={data.viceAbbots.length}/>}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(data.viceAbbots.length, 2)}, 1fr)`, gap:'0.65rem' }}>
            {data.viceAbbots.map((m, i) => <MonkCard key={i} monk={m} avatarSize={60} nameFontSize="0.85rem" borderColor="#f59e0b" showRank showTitle={false}/>)}
          </div>
        </>
      )}

      {/* Level 3: Assistants */}
      {data.assistants.length > 0 && (
        <>
          <VLine height={24}/>
          <div style={{ textAlign:'center', marginBottom:'0.75rem' }}>
            <div style={{ fontSize:'0.85rem', fontWeight:'800', color:'#d97706', background:'#fef3c7', display:'inline-block', padding:'3px 14px', borderRadius:'20px', boxShadow:'0 2px 8px rgba(251,191,36,0.1)' }}>ผู้ช่วยเจ้าอาวาส</div>
          </div>
          {data.assistants.length > 1 && <HBranch count={Math.min(data.assistants.length, 3)}/>}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(data.assistants.length, 3)}, 1fr)`, gap:'0.55rem' }}>
            {data.assistants.map((m, i) => <MonkCard key={i} monk={m} avatarSize={50} nameFontSize="0.78rem" borderColor="#fbbf24" showTitle={false}/>)}
          </div>
        </>
      )}

      {/* Level 4: Monks */}
      {data.monks.length > 0 && (
        <>
          <VLine height={24}/>
          <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:'20px', padding:'1.1rem 0.85rem 1.25rem', border:'1px solid #fde68a' }}>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <div style={{ fontSize:'1rem', fontWeight:'800', color:'#92400e' }}>🧡 พระภิกษุสามเณร</div>
              <div style={{ fontSize:'0.75rem', color:'#b45309', marginTop:'2px' }}>ทั้งหมด {data.monks.length} รูป</div>
            </div>
            <div className="sangha-monks-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.6rem' }}>
              {data.monks.map((m, i) => <MonkCard key={i} monk={m} avatarSize={46} nameFontSize="0.75rem" borderColor="#fcd34d" showTitle={false}/>)}
            </div>
          </div>
        </>
      )}

      {!data.abbot && !data.viceAbbots.length && !data.assistants.length && !data.monks.length && (
        <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#94a3b8' }}>
          <Users size={48} color="#fde68a" style={{ margin:'0 auto 1rem' }}/>
          <p style={{ fontSize:'0.9rem' }}>ยังไม่มีข้อมูลในระบบ</p>
        </div>
      )}

      {/* ─── แผนกงาน ─── */}
      <div style={{ marginTop:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.85rem' }}>
          <div style={{ width:'3px', height:'18px', background:'#d97706', borderRadius:'2px' }}/>
          <h3 style={{ margin:0, fontSize:'1rem', fontWeight:'800', color:'#1e293b' }}>แผนกงาน</h3>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0.6rem' }}>
          {DEPARTMENTS.map(dept => {
            const members = data.allRows.filter(r => (r.deptId||'').split(';').map(s=>s.trim()).includes(dept.id));
            return (
              <button key={dept.id} onClick={() => setActiveDept(dept)}
                style={{ background:'white', border:`1.5px solid ${dept.bg}`, borderRadius:'14px', padding:'0.75rem 0.65rem', cursor:'pointer', textAlign:'left', transition:'all 0.18s', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 6px 20px ${dept.color}30`}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ fontSize:'1.6rem', lineHeight:1 }}>{dept.emoji}</div>
                  <ChevronRight size={14} color={dept.color} style={{ marginTop:'2px' }}/>
                </div>
                <div style={{ fontSize:'0.78rem', fontWeight:'800', color:'#1e293b', marginTop:'0.4rem', lineHeight:1.3 }}>{dept.name}</div>
                <div style={{ marginTop:'0.3rem', display:'inline-block', background:dept.bg, color:dept.color, fontSize:'0.62rem', fontWeight:'700', padding:'1px 7px', borderRadius:'20px' }}>
                  {members.length > 0 ? `${members.length} รูป` : 'ยังไม่มีข้อมูล'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Dept Modal ─── */}
      {activeDept && (() => {
        const members = data.allRows.filter(r => (r.deptId||'').split(';').map(s=>s.trim()).includes(activeDept.id));
        return (
          <div onClick={() => setActiveDept(null)} style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(5px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .2s' }}>
            <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'24px 24px 0 0', width:'100%', maxWidth:'480px', maxHeight:'80vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'slideUp .25s cubic-bezier(.34,1.4,.64,1)' }}>
              <div style={{ display:'flex', justifyContent:'center', padding:'0.55rem 0 0' }}><div style={{ width:'36px', height:'4px', borderRadius:'2px', background:'#e2e8f0' }}/></div>
              <div style={{ padding:'1rem 1.1rem 0.75rem', display:'flex', alignItems:'center', gap:'0.75rem', borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:activeDept.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{activeDept.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:'800', fontSize:'0.95rem', color:'#1e293b' }}>{activeDept.name}</div>
                  <div style={{ fontSize:'0.72rem', color:activeDept.color, fontWeight:'700', marginTop:'2px' }}>{members.length > 0 ? `${members.length} รูป` : 'ยังไม่มีข้อมูล'}</div>
                </div>
                <button onClick={() => setActiveDept(null)} style={{ background:'#f1f5f9', border:'none', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color="#64748b"/></button>
              </div>
              <div style={{ overflowY:'auto', padding:'0.75rem 1.1rem 2rem', flex:1 }}>
                {members.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'2.5rem 0', color:'#94a3b8' }}>
                    <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{activeDept.emoji}</div>
                    <p style={{ fontSize:'0.85rem' }}>ยังไม่มีข้อมูลสมาชิกในแผนกนี้</p>
                    <p style={{ fontSize:'0.72rem', marginTop:'0.25rem' }}>เพิ่มคอลัมน์ deptId ใน Google Sheets</p>
                  </div>
                ) : members.map((m, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0', borderBottom:'1px solid #f8fafc' }}>
                    <MonkAvatar 
                      src={m.image} 
                      alt={m.name} 
                      size={40} 
                      borderColor={activeDept.color}
                      bg={activeDept.bg}
                      style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover', border:`2px solid ${activeDept.color}`, flexShrink:0 }}
                    />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:'700', fontSize:'0.85rem', color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</div>
                      <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:'1px' }}>{m.title || m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
