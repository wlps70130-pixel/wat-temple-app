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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or building ID
  const [buildingData, setBuildingData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Time & TOU
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
    // Fetch data for all buildings that have a device ID
    const promises = BUILDINGS.filter(b => b.deviceId).map(b => fetchRealData(b.id, b.deviceId));
    await Promise.all(promises);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // AI 2027 Styling Objects
  const styles = {
    container: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      margin: '-1rem',
      padding: '1rem',
      fontFamily: "'Inter', 'Prompt', sans-serif",
      color: '#0f172a',
      position: 'relative',
      overflow: 'hidden'
    },
    blob1: { position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(56, 189, 248, 0.2)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 },
    blob2: { position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(52, 211, 153, 0.15)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
      borderRadius: '20px',
      padding: '1.5rem',
      overflow: 'hidden'
    },
    button: {
      background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: '12px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s'
    }
  };

  const renderOverview = () => {
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

    const estCost = (globalKwh * (isPeak ? 5.7982 : 2.6369)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Master AI Card */}
        <div style={{ ...styles.glassCard, background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.7) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
             <div>
               <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600', letterSpacing: '0.5px' }}>MASTER ENERGY AI</p>
               <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(90deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                 วัดหลวงพ่อสดธรรมกายาราม
               </h3>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isPeak ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isPeak ? '#ef4444' : '#10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
               <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPeak ? '#ef4444' : '#10b981' }}></span>
               TOU: {isPeak ? 'On-Peak' : 'Off-Peak'}
             </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>กำลังไฟฟ้าใช้งานรวม</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{globalKw.toFixed(2)}</span>
                <span style={{ fontWeight: '600', color: '#94a3b8' }}>kW</span>
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>ประมาณการค่าไฟ (บาท)</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0ea5e9', lineHeight: 1 }}>{estCost}</span>
                <span style={{ fontWeight: '600', color: '#94a3b8' }}>THB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Building Grid */}
        <h4 style={{ margin: '0.5rem 0 0 0', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
          <span>จุดตรวจสอบ ({onlineCount}/{BUILDINGS.length})</span>
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {BUILDINGS.map(b => {
            const hasDevice = !!b.deviceId;
            const data = buildingData[b.id];
            const parsed = parseData(data?.raw);
            const isErr = !!data?.error;
            
            return (
              <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ ...styles.glassCard, padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', borderLeft: hasDevice && parsed.isOnline ? '4px solid #10b981' : hasDevice && isErr ? '4px solid #ef4444' : '4px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{b.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {hasDevice ? (parsed.isOnline ? `⚡ ${parsed.totalKw} kW | 💰 ${(parsed.totalKwh * (isPeak ? 5.7982 : 2.6369)).toLocaleString('th-TH', {maximumFractionDigits:0})} ฿` : 'รอการส่งข้อมูล...') : '⏳ รอติดตั้งอุปกรณ์'}
                    </p>
                  </div>
                  <div style={{ color: '#cbd5e1' }}>➔</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    const bldg = BUILDINGS.find(b => b.id === activeTab);
    const data = buildingData[bldg.id];
    const parsed = parseData(data?.raw);
    const hasDevice = !!bldg.deviceId;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={() => setActiveTab('overview')} style={{ ...styles.button, width: 'fit-content', border: 'none', background: 'transparent', padding: '0', color: '#3b82f6' }}>
          ← กลับไปหน้าหลัก
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h2 style={{ margin: 0, color: '#0f172a' }}>{bldg.name}</h2>
           {hasDevice ? (
             parsed.isOnline ? <span style={{ background: '#d1fae5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Online</span>
             : <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Offline</span>
           ) : <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Pending</span>}
        </div>

        {!hasDevice && (
          <div style={{ ...styles.glassCard, textAlign: 'center', color: '#64748b', padding: '3rem 1rem' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>🚧</p>
            <p style={{ margin: 0 }}>จุดนี้อยู่ระหว่างรอติดตั้งสมาร์ทมิเตอร์และสวิตช์ควบคุม</p>
          </div>
        )}

        {hasDevice && (
          <>
            <div style={{ ...styles.glassCard }}>
               <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>ค่าไฟประมาณการ (TOU {isPeak ? 'On-Peak' : 'Off-Peak'})</p>
               <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', color: '#0f172a', lineHeight: 1 }}>
                 {(parsed.totalKwh * (isPeak ? 5.7982 : 2.6369)).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span style={{ fontSize: '1rem', color: '#64748b' }}>บาท</span>
               </h3>
               <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>ใช้ไฟสะสม: <strong style={{color:'#334155'}}>{parsed.totalKwh} kWh</strong></p>
            </div>

            {/* Smart Controls */}
            <div style={{ ...styles.glassCard, background: 'rgba(255, 255, 255, 0.9)' }}>
               <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 💡 ระบบควบคุมไฟ (Smart Controls)
               </h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Master Switch</span>
                      <div style={{ width: 40, height: 20, background: '#e2e8f0', borderRadius: '20px', position: 'relative' }}>
                        <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ระบบเปิด-ปิดด้วยตนเอง</span>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#3b82f6' }}>Auto Schedule</span>
                      <div style={{ width: 40, height: 20, background: '#3b82f6', borderRadius: '20px', position: 'relative' }}>
                         <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, right: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>18:00 น. - 06:00 น.</span>
                  </div>
               </div>
            </div>

            {/* 3 Phase Details */}
            <h4 style={{ margin: '0.5rem 0 0 0', color: '#334155' }}>ข้อมูลกระแสไฟฟ้า 3 เฟส</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {[
                { id: 'A', name: 'Phase L1', data: parsed.phases.A, color: '#ef4444' },
                { id: 'B', name: 'Phase L2', data: parsed.phases.B, color: '#f59e0b' },
                { id: 'C', name: 'Phase L3', data: parsed.phases.C, color: '#3b82f6' }
              ].map(p => (
                <div key={p.id} style={{ ...styles.glassCard, padding: '1rem', borderLeft: `4px solid ${p.color}` }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: p.color, marginBottom: '0.5rem' }}>{p.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                     <div>
                       <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Voltage</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{p.data.v} <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>V</span></div>
                     </div>
                     <div>
                       <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Current</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{p.data.a} <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>A</span></div>
                     </div>
                     <div>
                       <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Power</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{p.data.kw} <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>kW</span></div>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setShowDebug(!showDebug)} style={{ background: 'transparent', border: '1px dashed #cbd5e1', color: '#94a3b8', padding: '0.5rem', borderRadius: '12px', fontSize: '0.75rem', width: '100%', marginTop: '1rem' }}>
              {showDebug ? 'ซ่อนข้อมูลดิบ' : '🛠️ แสดงข้อมูลดิบ API'}
            </button>
            {showDebug && (
              <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.65rem', overflowX: 'auto', border: '1px solid #e2e8f0', userSelect: 'text' }}>
                {JSON.stringify(data?.raw, null, 2)}
              </pre>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      
      <div style={styles.content}>
        {/* Top Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>WatTemple <span style={{color: '#0ea5e9'}}>Energy</span></h1>
          <button onClick={handleRefresh} disabled={isRefreshing} style={styles.button}>
            <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }}>↻</span>
          </button>
        </div>

        {activeTab === 'overview' ? renderOverview() : renderDetail()}
      </div>
    </div>
  );
}
