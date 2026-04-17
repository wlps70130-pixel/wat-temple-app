import React, { useState, useEffect } from 'react';

const BUILDINGS = [
  { id: 'somdej', name: 'ศาลาสมเด็จฯ', deviceId: 'a326a888ee9e0e5c67pwni' },
  { id: 'multipurpose', name: 'ศาลาพระประจำวัน', deviceId: 'a3a95d6030b8bc9a02idhq' },
  { id: 'b1', name: 'อาคาร 1', deviceId: '' },
  { id: 'b2', name: 'อาคาร 2', deviceId: '' },
  { id: 'b3', name: 'อาคาร 3', deviceId: '' },
  { id: 'b4', name: 'อาคาร 4', deviceId: '' },
  { id: 'b5', name: 'อาคาร 5', deviceId: '' },
  { id: 'b6', name: 'อาคาร 6', deviceId: '' },
  { id: 'b7', name: 'อาคาร 7', deviceId: '' },
  { id: 'foundation', name: 'สำนักงานมูลนิธิ', deviceId: '' },
  { id: 'ubosot', name: 'พระอุโบสถ', deviceId: '' },
  { id: 'guesthouse', name: 'เรือนรับรองหลวงป๋า', deviceId: '' },
  { id: 'shop', name: 'ร้านค้าสวัสดิการ', deviceId: '' },
  { id: 'v_sodh', name: 'วิหารหลวงพ่อสด', deviceId: '' },
  { id: 'v_pathom', name: 'วิหารพระปฐมบรมศาสดา', deviceId: '' },
  { id: 'chedi', name: 'พระมหาเจดีย์สมเด็จฯ', deviceId: '' },
  { id: 'training', name: 'ศาลาอบรมธรรม', deviceId: '' },
  { id: 'kuti_abbot', name: 'กุฏิเจ้าอาวาส', deviceId: '' },
  { id: 'v_water', name: 'วิหารกลางน้ำ', deviceId: '' }
];

export default function EnergyDashboard() {
  const [appModule, setAppModule] = useState('energy'); 
  const [activeTab, setActiveTab] = useState('overview'); 
  const [buildingData, setBuildingData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const checkIsPeak = (date) => {
    const day = date.getDay();
    const hour = date.getHours();
    return (day >= 1 && day <= 5) && (hour >= 9 && hour < 22);
  };
  const isPeak = checkIsPeak(currentTime);

  const fetchRealData = async (bldgId, deviceId) => {
    if (!deviceId) return;
    try {
      const response = await fetch(`/api/tuya?deviceId=${deviceId}`);
      const apiData = await response.json();
      setBuildingData(prev => ({
        ...prev,
        [bldgId]: {
          raw: apiData.success ? apiData.result : null,
          error: apiData.success ? null : (apiData.error || "Unknown API Error")
        }
      }));
    } catch (error) {
      setBuildingData(prev => ({
        ...prev,
        [bldgId]: { raw: null, error: error.message }
      }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (appModule === 'energy') {
      const promises = BUILDINGS.filter(b => b.deviceId).map(b => fetchRealData(b.id, b.deviceId));
      await Promise.all(promises);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appModule]);

  const parseData = (raw) => {
    const defaultPhase = { v: '0.0', a: '0.0', kw: '0.00' };
    const parsed = {
      isOnline: false,
      totalKw: '0.00',
      totalKwh: '0.00',
      phases: { A: { ...defaultPhase }, B: { ...defaultPhase }, C: { ...defaultPhase } }
    };

    if (!raw) return parsed;
    parsed.isOnline = true;

    const statusArray = raw.status || [];
    if (statusArray.length === 0) {
      parsed.isOnline = false;
      return parsed;
    }

    const findCode = (prefix) => {
       const item = statusArray.find(s => String(s.code).toLowerCase() === prefix);
       if (item && item.value !== undefined) {
         const val = Number(item.value);
         return isNaN(val) ? 0 : val;
       }
       return 0;
    };

    parsed.phases.A.v = (findCode('voltagea') / 10).toFixed(1);
    parsed.phases.A.a = (findCode('currenta') / 1000).toFixed(2);
    parsed.phases.A.kw = (findCode('activepowera') / 1000).toFixed(3);
    
    parsed.phases.B.v = (findCode('voltageb') / 10).toFixed(1);
    parsed.phases.B.a = (findCode('currentb') / 1000).toFixed(2);
    parsed.phases.B.kw = (findCode('activepowerb') / 1000).toFixed(3);
    
    parsed.phases.C.v = (findCode('voltagec') / 10).toFixed(1);
    parsed.phases.C.a = (findCode('currentc') / 1000).toFixed(2);
    parsed.phases.C.kw = (findCode('activepowerc') / 1000).toFixed(3);

    parsed.totalKw = (findCode('activepower') / 1000).toFixed(3);
    parsed.totalKwh = (findCode('totalenergyconsumed') / 100).toFixed(2);
    
    return parsed;
  };

  // Modern Mobile App Styling
  const styles = {
    container: {
      background: 'linear-gradient(160deg, #3b82f6 0%, #10b981 100%)',
      minHeight: '100vh',
      margin: '-1rem',
      padding: '1.5rem 1rem 4rem 1rem',
      fontFamily: "'Inter', 'Prompt', sans-serif",
      color: '#fff',
      overflowX: 'hidden',
      overflowY: 'auto'
    },
    card: {
      background: '#ffffff',
      color: '#1e293b',
      borderRadius: '24px',
      padding: '1.5rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '1rem'
    },
    miniCard: {
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1rem',
      border: '1px solid #e2e8f0'
    },
    button: {
      background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '12px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(5px)'
    },
    pill: {
      background: '#fff', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block'
    }
  };

  const Donut = ({ value, label, subLabel, color }) => {
    // Determine gradient stop (dummy value around 65% for visual effect)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
        <div style={{
          width: '180px', height: '180px', borderRadius: '50%',
          background: `conic-gradient(${color} 0%, ${color} 65%, #e2e8f0 65%, #e2e8f0 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '140px', height: '140px', borderRadius: '50%', background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
             <span style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{value}</span>
             <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', marginTop: '0.25rem' }}>{label}</span>
             {subLabel && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{subLabel}</span>}
          </div>
        </div>
      </div>
    );
  };

  const Sparkline = () => (
    <svg viewBox="0 0 100 30" style={{ width: '100%', height: '50px', overflow: 'visible', marginTop: '1rem' }}>
      <path d="M0,25 Q10,15 20,20 T40,10 T60,15 T80,5 T100,10" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M0,25 Q10,15 20,20 T40,10 T60,15 T80,5 T100,10 L100,30 L0,30 Z" fill="rgba(16, 185, 129, 0.1)" />
      <circle cx="80" cy="5" r="3" fill="#1e293b" />
      <text x="80" y="-2" fontSize="6" fill="#1e293b" textAnchor="middle" fontWeight="bold">Peak</text>
    </svg>
  );

  const renderEnergyOverview = () => {
    let globalKw = 0;
    let globalKwh = 0;
    let onlineCount = 0;
    
    BUILDINGS.forEach(b => {
      if (buildingData[b.id]?.raw) {
        const pd = parseData(buildingData[b.id].raw);
        if (pd.isOnline) {
          globalKw += parseFloat(pd.totalKw);
          globalKwh += parseFloat(pd.totalKwh);
          onlineCount++;
        }
      }
    });

    const AVG_RATE = 4.20; // Blended rate to prevent bouncing totals
    const estCost = (globalKwh * AVG_RATE).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={styles.pill}>Active 2027 System</span>
        </div>
        
        {/* Main Donut Card */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>ปริมาณใช้ไฟรวม</h3>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>
              ออนไลน์ {onlineCount}/{BUILDINGS.length}
            </span>
          </div>
          
          <Donut value={globalKwh.toLocaleString()} label="kWh" subLabel="สะสมทั้งหมด" color="#3b82f6" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
             <div style={{ textAlign: 'center' }}>
               <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>กำลังไฟฟ้า</p>
               <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#3b82f6' }}>{globalKw.toFixed(2)} <span style={{fontSize:'0.75rem'}}>kW</span></p>
             </div>
             <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
               <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>ค่าไฟเฉลี่ย (4.20฿/u)</p>
               <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>{estCost} <span style={{fontSize:'0.75rem'}}>฿</span></p>
             </div>
          </div>
        </div>

        {/* TOU Info Card */}
        <div style={styles.card}>
           <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>เรทราคา TOU (Time of Use)</h4>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
             <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{color:'#f59e0b'}}>☀</span> On-Peak (09:00 - 22:00)</span>
             <span style={{ fontWeight: 'bold', color: '#0f172a' }}>5.7982 ฿</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
             <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{color:'#3b82f6'}}>🌙</span> Off-Peak (22:00 - 09:00)</span>
             <span style={{ fontWeight: 'bold', color: '#0f172a' }}>2.6369 ฿</span>
           </div>
           <div style={{ background: isPeak ? '#fef3c7' : '#e0f2fe', color: isPeak ? '#92400e' : '#075985', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold', border: `1px solid ${isPeak ? '#fde68a' : '#bae6fd'}` }}>
              📌 ขณะนี้ใช้เรท: {isPeak ? 'On-Peak (5.79 ฿)' : 'Off-Peak (2.63 ฿)'}
           </div>
        </div>

        <h4 style={{ margin: '0.5rem 0', color: '#fff', fontSize: '1.1rem' }}>ข้อมูลรายอาคาร</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {BUILDINGS.map(b => {
            const hasDevice = !!b.deviceId;
            const data = buildingData[b.id];
            const parsed = parseData(data?.raw);
            
            return (
              <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ background: '#fff', borderRadius: '20px', padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 45, height: 45, borderRadius: '12px', background: hasDevice && parsed.isOnline ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hasDevice && parsed.isOnline ? '#0ea5e9' : '#94a3b8', fontWeight: 'bold', fontSize: '1.2rem' }}>
                     {hasDevice && parsed.isOnline ? '⚡' : '🏢'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{b.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                      {hasDevice ? (parsed.isOnline ? `${parsed.totalKwh} kWh / ${parsed.totalKw} kW` : 'Offline') : 'รอติดตั้ง'}
                    </p>
                  </div>
                </div>
                <div style={{ color: '#cbd5e1' }}>➔</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEnergyDetail = () => {
    const bldg = BUILDINGS.find(b => b.id === activeTab);
    const data = buildingData[bldg.id];
    const parsed = parseData(data?.raw);
    const hasDevice = !!bldg.deviceId;
    
    const AVG_RATE = 4.20;
    const estCost = (parsed.totalKwh * AVG_RATE).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setActiveTab('overview')} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 'bold', padding: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          ← กลับไปหน้าหลัก
        </button>
        
        <div style={styles.card}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
               <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>{bldg.name}</h2>
               <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>มิเตอร์หลัก 3 เฟส</p>
             </div>
             {hasDevice && parsed.isOnline ? (
               <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Online</span>
             ) : (
               <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Offline</span>
             )}
           </div>

           {!hasDevice ? (
             <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
               <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🚧</p>
               <p style={{ margin: 0 }}>จุดนี้อยู่ระหว่างรอติดตั้งอุปกรณ์</p>
             </div>
           ) : (
             <>
               <Donut value={parsed.totalKwh} label="kWh" subLabel="หน่วยไฟสะสม" color="#10b981" />
               
               <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                 <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>ค่าไฟประมาณการ (เรทเฉลี่ย 4.20 ฿)</p>
                 <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.8rem', color: '#f59e0b', textAlign: 'center' }}>
                   {estCost} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>฿</span>
                 </h3>
               </div>

               <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>แนวโน้มการใช้ไฟ (Usage History)</h4>
               <div style={styles.miniCard}>
                  <Sparkline />
               </div>

               <h4 style={{ margin: '1.5rem 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>ข้อมูล 3 เฟส (Real-time)</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 {[
                   { id: 'A', name: 'Phase L1', data: parsed.phases.A, color: '#ef4444' },
                   { id: 'B', name: 'Phase L2', data: parsed.phases.B, color: '#f59e0b' },
                   { id: 'C', name: 'Phase L3', data: parsed.phases.C, color: '#3b82f6' }
                 ].map(p => (
                   <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }}></div>
                       <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.85rem' }}>{p.name}</span>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem', textAlign: 'right' }}>
                       <div><span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{p.data.v}</span> <span style={{ fontSize:'0.7rem', color:'#64748b'}}>V</span></div>
                       <div><span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{p.data.a}</span> <span style={{ fontSize:'0.7rem', color:'#64748b'}}>A</span></div>
                       <div style={{ width: '60px' }}><span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#10b981' }}>{p.data.kw}</span> <span style={{ fontSize:'0.7rem', color:'#64748b'}}>kW</span></div>
                     </div>
                   </div>
                 ))}
               </div>

               <button onClick={() => setShowDebug(!showDebug)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', padding: '0.75rem', borderRadius: '12px', fontSize: '0.75rem', width: '100%', marginTop: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                 {showDebug ? 'ซ่อนข้อมูล JSON' : 'ดูข้อมูลดิบจาก API'}
               </button>
               {showDebug && (
                 <pre style={{ background: '#0f172a', color: '#34d399', padding: '1rem', borderRadius: '12px', fontSize: '0.65rem', overflowX: 'auto', marginTop: '0.5rem', userSelect: 'text' }}>
                   {JSON.stringify(data?.raw, null, 2)}
                 </pre>
               )}
             </>
           )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Module Switcher (Root Navigation) */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.35rem', borderRadius: '20px', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
        <div onClick={() => setAppModule('energy')} style={{ background: appModule === 'energy' ? '#fff' : 'transparent', color: appModule === 'energy' ? '#3b82f6' : '#fff', padding: '0.5rem 1rem', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', flex: 1, textAlign: 'center', transition: 'all 0.3s' }}>
          มอนิเตอร์ไฟ
        </div>
        <div onClick={() => setAppModule('lighting')} style={{ background: appModule === 'lighting' ? '#fff' : 'transparent', color: appModule === 'lighting' ? '#10b981' : '#fff', padding: '0.5rem 1rem', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', flex: 1, textAlign: 'center', transition: 'all 0.3s' }}>
          ควบคุมสวิตช์
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>
          {appModule === 'energy' ? 'Dashboard' : 'Smart Control'}
        </h1>
        <button onClick={handleRefresh} disabled={isRefreshing} style={styles.button}>
          <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }}>↻</span>
        </button>
      </div>

      {appModule === 'energy' ? (
         activeTab === 'overview' ? renderEnergyOverview() : renderEnergyDetail()
      ) : (
         <div style={styles.card}>
           <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
             <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🔌</p>
             <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>หมวดควบคุมแสงสว่าง</h3>
             <p style={{ margin: 0, fontSize: '0.85rem' }}>อยู่ระหว่างเตรียมการเชื่อมต่อ API สวิตช์ Tuya</p>
           </div>
         </div>
      )}
    </div>
  );
}
