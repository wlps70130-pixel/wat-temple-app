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
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

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

  // Theme definitions based on user's reference images
  const theme = isDarkMode ? {
    bg: '#141824',
    card: '#1e2532',
    textMain: '#ffffff',
    textSub: '#9ca3af',
    border: '#2e3846',
    primary: '#3b82f6',
    iconBg: '#2a3441',
    shadow: 'none'
  } : {
    bg: '#f3f6f9',
    card: '#ffffff',
    textMain: '#1e293b',
    textSub: '#64748b',
    border: '#e2e8f0',
    primary: '#3b82f6',
    iconBg: '#f1f5f9',
    shadow: '0 4px 15px rgba(0,0,0,0.03)'
  };

  const styles = {
    container: {
      background: theme.bg,
      minHeight: '100vh',
      margin: '-1rem',
      padding: '1.5rem 1rem 4rem 1rem',
      fontFamily: "'Inter', 'Prompt', sans-serif",
      color: theme.textMain,
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: 'all 0.3s ease'
    },
    card: {
      background: theme.card,
      borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
      marginBottom: '1rem',
      transition: 'all 0.3s ease'
    },
    button: {
      background: theme.iconBg, border: `1px solid ${theme.border}`, color: theme.textMain, borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
    }
  };

  const Donut = ({ value, label, subLabel, color }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '160px', height: '160px', borderRadius: '50%',
          background: `conic-gradient(${color} 0%, ${color} 75%, ${theme.border} 75%, ${theme.border} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '130px', height: '130px', borderRadius: '50%', background: theme.card,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
             <span style={{ fontSize: '1.8rem', fontWeight: '800', color: theme.textMain, lineHeight: 1 }}>{value}</span>
             <span style={{ fontSize: '0.8rem', fontWeight: '700', color: theme.textSub, marginTop: '0.25rem' }}>{label}</span>
             {subLabel && <span style={{ fontSize: '0.65rem', color: theme.primary }}>{subLabel}</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderEnergyOverview = () => {
    let globalKw = 0;
    let globalKwh = 0;
    let onlineCount = 0;
    let installedCount = 0;
    
    BUILDINGS.forEach(b => {
      if (b.deviceId) installedCount++;
      if (buildingData[b.id]?.raw) {
        const pd = parseData(buildingData[b.id].raw);
        if (pd.isOnline) {
          globalKw += parseFloat(pd.totalKw);
          globalKwh += parseFloat(pd.totalKwh);
          onlineCount++;
        }
      }
    });

    const AVG_RATE = 4.20; 
    const estCost = (globalKwh * AVG_RATE).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Section matching the reference layout */}
        <div style={{ ...styles.card, display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div style={{ flex: 1 }}>
              <Donut value={globalKwh.toLocaleString()} label="kWh" subLabel="Total Yield" color="#3b82f6" />
           </div>
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: theme.primary, width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>💰</div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme.textMain }}>{estCost} <span style={{fontSize:'0.7rem', color:theme.textSub}}>THB</span></div>
                  <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Est. Total Cost</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#10b981', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>⚡</div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme.textMain }}>{globalKw.toFixed(2)} <span style={{fontSize:'0.7rem', color:theme.textSub}}>kW</span></div>
                  <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Current Power</div>
                </div>
              </div>
           </div>
        </div>

        {/* 3 Square Cards matching reference */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
           <div style={{ ...styles.card, marginBottom: 0, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '1.5rem' }}>🏢</span>
             <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{BUILDINGS.length}</span>
             <span style={{ fontSize: '0.7rem', color: theme.textSub }}>Site(s)</span>
           </div>
           <div style={{ ...styles.card, marginBottom: 0, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '1.5rem' }}>🟢</span>
             <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{onlineCount}</span>
             <span style={{ fontSize: '0.7rem', color: theme.textSub }}>Device online</span>
           </div>
           <div style={{ ...styles.card, marginBottom: 0, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '1.5rem' }}>⚪</span>
             <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{installedCount - onlineCount}</span>
             <span style={{ fontSize: '0.7rem', color: theme.textSub }}>Device offline</span>
           </div>
        </div>

        {/* TOU Info Card as a horizontal bar like "Coal Saved" in reference */}
        <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ background: isPeak ? '#f59e0b' : '#3b82f6', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}>
               {isPeak ? '☀' : '🌙'}
             </div>
             <span style={{ color: theme.textMain, fontWeight: '600', fontSize: '0.9rem' }}>TOU Rate ({isPeak ? 'On-Peak' : 'Off-Peak'})</span>
           </div>
           <span style={{ fontWeight: 'bold', color: theme.textMain, fontSize: '1.1rem' }}>{isPeak ? '5.7982' : '2.6369'} <span style={{fontSize:'0.7rem', color:theme.textSub, fontWeight:'normal'}}>THB</span></span>
        </div>

        <h4 style={{ margin: '1rem 0 0.5rem 0', color: theme.textMain, fontSize: '1rem' }}>Device List</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {BUILDINGS.map(b => {
            const hasDevice = !!b.deviceId;
            const data = buildingData[b.id];
            const parsed = parseData(data?.raw);
            
            return (
              <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ ...styles.card, marginBottom: 0, padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '8px', background: theme.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: hasDevice && parsed.isOnline ? '#10b981' : theme.textSub, fontWeight: 'bold', fontSize: '1.2rem' }}>
                     {hasDevice && parsed.isOnline ? '⚡' : '🏢'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: theme.textMain }}>{b.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textSub, marginTop: '0.1rem' }}>
                      {hasDevice ? (parsed.isOnline ? `${parsed.totalKwh} kWh / ${parsed.totalKw} kW` : 'Offline') : 'รอติดตั้งอุปกรณ์'}
                    </p>
                  </div>
                </div>
                <div style={{ color: theme.border }}>➔</div>
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

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setActiveTab('overview')} style={{ background: 'transparent', border: 'none', color: theme.primary, fontSize: '1rem', fontWeight: 'bold', padding: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          ← Back to Overview
        </button>
        
        <div style={styles.card}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
               <h2 style={{ margin: 0, color: theme.textMain, fontSize: '1.4rem' }}>{bldg.name}</h2>
               <p style={{ margin: '0.25rem 0 0 0', color: theme.textSub, fontSize: '0.85rem' }}>3-Phase Smart Meter</p>
             </div>
             {hasDevice && parsed.isOnline ? (
               <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Online</span>
             ) : (
               <span style={{ background: theme.iconBg, color: theme.textSub, padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Offline</span>
             )}
           </div>

           {!hasDevice ? (
             <div style={{ textAlign: 'center', padding: '3rem 1rem', color: theme.textSub }}>
               <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🚧</p>
               <p style={{ margin: 0 }}>อยู่ระหว่างรอติดตั้งอุปกรณ์</p>
             </div>
           ) : (
             <>
               <div style={{ marginTop: '1.5rem' }}>
                 <Donut value={parsed.totalKwh} label="kWh" subLabel="Total Yield" color="#10b981" />
               </div>

               <h4 style={{ margin: '1.5rem 0 1rem 0', color: theme.textMain, fontSize: '1rem' }}>Real-time 3 Phase</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {[
                   { id: 'A', name: 'Phase L1', data: parsed.phases.A, color: '#ef4444' },
                   { id: 'B', name: 'Phase L2', data: parsed.phases.B, color: '#f59e0b' },
                   { id: 'C', name: 'Phase L3', data: parsed.phases.C, color: '#3b82f6' }
                 ].map(p => (
                   <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: theme.iconBg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }}></div>
                       <span style={{ fontWeight: 'bold', color: theme.textMain, fontSize: '0.85rem' }}>{p.name}</span>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem', textAlign: 'right' }}>
                       <div style={{ width: '45px' }}><span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.textMain }}>{p.data.v}</span> <span style={{ fontSize:'0.65rem', color:theme.textSub}}>V</span></div>
                       <div style={{ width: '45px' }}><span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.textMain }}>{p.data.a}</span> <span style={{ fontSize:'0.65rem', color:theme.textSub}}>A</span></div>
                       <div style={{ width: '60px' }}><span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#10b981' }}>{p.data.kw}</span> <span style={{ fontSize:'0.65rem', color:theme.textSub}}>kW</span></div>
                     </div>
                   </div>
                 ))}
               </div>

               <button onClick={() => setShowDebug(!showDebug)} style={{ background: theme.iconBg, border: 'none', color: theme.textSub, padding: '0.75rem', borderRadius: '12px', fontSize: '0.75rem', width: '100%', marginTop: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                 {showDebug ? 'Hide API Data' : 'View Raw API Data'}
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
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {appModule === 'energy' ? '📊 Energy' : '💡 Control'}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={styles.button}>
            {isDarkMode ? '☀' : '🌙'}
          </button>
          <button onClick={handleRefresh} disabled={isRefreshing} style={styles.button}>
            <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }}>↻</span>
          </button>
        </div>
      </div>

      {/* Module Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: theme.iconBg, padding: '0.35rem', borderRadius: '12px', marginBottom: '1.5rem', border: `1px solid ${theme.border}` }}>
        <div onClick={() => setAppModule('energy')} style={{ background: appModule === 'energy' ? theme.card : 'transparent', color: appModule === 'energy' ? theme.primary : theme.textSub, boxShadow: appModule === 'energy' ? theme.shadow : 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1, textAlign: 'center', transition: 'all 0.3s', fontSize: '0.85rem' }}>
          Monitor
        </div>
        <div onClick={() => setAppModule('lighting')} style={{ background: appModule === 'lighting' ? theme.card : 'transparent', color: appModule === 'lighting' ? theme.primary : theme.textSub, boxShadow: appModule === 'lighting' ? theme.shadow : 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1, textAlign: 'center', transition: 'all 0.3s', fontSize: '0.85rem' }}>
          Control
        </div>
      </div>

      {appModule === 'energy' ? (
         activeTab === 'overview' ? renderEnergyOverview() : renderEnergyDetail()
      ) : (
         <div style={styles.card}>
           <div style={{ textAlign: 'center', padding: '3rem 1rem', color: theme.textSub }}>
             <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🔌</p>
             <h3 style={{ margin: '0 0 0.5rem 0', color: theme.textMain }}>Smart Control</h3>
             <p style={{ margin: 0, fontSize: '0.85rem' }}>เตรียมเชื่อมต่อระบบสวิตช์ Tuya เร็วๆ นี้</p>
           </div>
         </div>
      )}
    </div>
  );
}
