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
  const [activeTab, setActiveTab] = useState('overview'); 
  const [buildingData, setBuildingData] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  useEffect(() => {
    const promises = BUILDINGS.filter(b => b.deviceId).map(b => fetchRealData(b.id, b.deviceId));
    Promise.all(promises);
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

  // Exact theme from reference
  const theme = isDarkMode ? {
    bg: '#181b26',
    cardBg: '#212635',
    textMain: '#ffffff',
    textSub: '#8a94a6',
    border: 'none',
    shadow: '0 4px 20px rgba(0,0,0,0.2)',
    chartBg: '#2a3143',
    pillBg: '#2a3143',
    blueText: '#4ea8ff'
  } : {
    bg: '#f2f6f9',
    cardBg: '#ffffff',
    textMain: '#1c212d',
    textSub: '#8a94a6',
    border: 'none',
    shadow: '0 8px 24px rgba(149, 157, 165, 0.08)',
    chartBg: '#f2f6f9',
    pillBg: '#f2f6f9',
    blueText: '#3b82f6'
  };

  const DonutChart = ({ value, unit, label }) => {
    const radius = 70;
    const stroke = 14;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (0.8 * circumference); // 80% full

    return (
      <div style={{ position: 'relative', width: radius*2, height: radius*2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ea8ff" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <circle
            stroke={theme.chartBg}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#grad)"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <span style={{ fontSize: '0.7rem', color: theme.textSub, marginBottom: '-2px' }}>{unit}</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain, letterSpacing: '-0.5px' }}>{value}</span>
          <span style={{ fontSize: '0.65rem', color: theme.blueText, marginTop: '-2px' }}>{label}</span>
        </div>
      </div>
    );
  };

  const MockGraph = () => (
    <div style={{ width: '100%', height: '120px', position: 'relative', marginTop: '1rem' }}>
      <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Grid lines */}
        {[10, 20, 30].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={isDarkMode ? '#2a3143' : '#f1f5f9'} strokeWidth="0.5" />
        ))}
        {/* Area fill */}
        <path d="M0,35 Q15,20 30,30 T60,15 T100,5 L100,40 L0,40 Z" fill={isDarkMode ? 'rgba(78, 168, 255, 0.1)' : 'rgba(59, 130, 246, 0.05)'} />
        {/* Line */}
        <path d="M0,35 Q15,20 30,30 T60,15 T100,5" fill="none" stroke={theme.blueText} strokeWidth="2.5" strokeLinecap="round" />
        {/* Dot */}
        <circle cx="100" cy="5" r="2.5" fill="#fff" stroke={theme.blueText} strokeWidth="1.5" />
      </svg>
      {/* Tooltip mockup */}
      <div style={{ position: 'absolute', right: 0, top: '-10px', background: theme.blueText, color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
        Today
      </div>
      {/* X Axis */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: theme.textSub, marginTop: '4px' }}>
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
      </div>
    </div>
  );

  const renderDashboard = () => {
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

    const estCost = (globalKwh * 4.20).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Header toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: theme.cardBg, border: 'none', color: theme.textMain, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadow, cursor: 'pointer', fontSize: '1.2rem' }}>
            {isDarkMode ? '🌙' : '☀'}
          </button>
        </div>

        {/* 1. TOP HUGE CARD */}
        <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: theme.shadow, marginBottom: '0.75rem' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <DonutChart value={globalKwh.toLocaleString(undefined, {maximumFractionDigits:0})} unit="kWh" label="Total Yield" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#3b82f6', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>📅</div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textMain, lineHeight: 1 }}>{estCost} <span style={{fontSize:'0.7rem', fontWeight:'normal', color:theme.textSub}}>THB</span></div>
                <div style={{ fontSize: '0.75rem', color: theme.textSub, marginTop: '2px' }}>Est. Cost</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#10b981', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>🏠</div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textMain, lineHeight: 1 }}>{globalKw.toFixed(2)} <span style={{fontSize:'0.7rem', fontWeight:'normal', color:theme.textSub}}>kW</span></div>
                <div style={{ fontSize: '0.75rem', color: theme.textSub, marginTop: '2px' }}>Current Power</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TWO HORIZONTAL CARDS */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ background: theme.pillBg, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMain }}>⚡</div>
             <div>
               <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Capacity</div>
               <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.textMain }}>{BUILDINGS.length * 50} <span style={{fontSize:'0.6rem', color:theme.textSub}}>kWp</span></div>
             </div>
          </div>
          <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ background: theme.pillBg, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMain }}>⏱</div>
             <div>
               <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Current Time</div>
               <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.textMain }}>{new Date().toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</div>
             </div>
          </div>
        </div>

        {/* 3. MAIN GRAPH CARD */}
        <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', boxShadow: theme.shadow, marginBottom: '0.75rem' }}>
           <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: theme.pillBg, width: 40, height: 40, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.blueText, fontWeight: 'bold', fontSize: '1.2rem' }}>
                Tu
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textMain }}>Energy Trend</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSub }}>Usage over time</div>
              </div>
           </div>
           <MockGraph />
        </div>

        {/* 4. THREE VERTICAL CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
           <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.25rem 0.5rem', textAlign: 'center', boxShadow: theme.shadow }}>
             <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
             <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{BUILDINGS.length}</div>
             <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Site(s)</div>
           </div>
           <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.25rem 0.5rem', textAlign: 'center', boxShadow: theme.shadow }}>
             <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔋</div>
             <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{onlineCount}</div>
             <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Device online</div>
           </div>
           <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.25rem 0.5rem', textAlign: 'center', boxShadow: theme.shadow }}>
             <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🪫</div>
             <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{installedCount - onlineCount}</div>
             <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Device offline</div>
           </div>
        </div>

        {/* 5. HORIZONTAL STRIPS (Using TOU logic here) */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme.shadow, marginBottom: '0.75rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ background: '#3b82f6', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>☀</div>
             <span style={{ color: theme.textMain, fontSize: '0.9rem' }}>On-Peak Rate</span>
           </div>
           <span style={{ fontWeight: 'bold', color: theme.textMain, fontSize: '1.1rem' }}>5.79 <span style={{fontSize:'0.7rem', fontWeight:'normal', color:theme.textSub}}>THB</span></span>
        </div>

        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme.shadow, marginBottom: '1.5rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ background: '#f59e0b', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>🌙</div>
             <span style={{ color: theme.textMain, fontSize: '0.9rem' }}>Off-Peak Rate</span>
           </div>
           <span style={{ fontWeight: 'bold', color: theme.textMain, fontSize: '1.1rem' }}>2.63 <span style={{fontSize:'0.7rem', fontWeight:'normal', color:theme.textSub}}>THB</span></span>
        </div>

        {/* Detailed Buildings List mapped exactly like strips */}
        <h4 style={{ margin: '0 0 1rem 0', color: theme.textMain, fontSize: '1rem' }}>Active Sites</h4>
        {BUILDINGS.filter(b => b.deviceId).map(b => {
          const data = buildingData[b.id];
          const parsed = parseData(data?.raw);
          return (
            <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme.shadow, marginBottom: '0.75rem', cursor: 'pointer' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <div style={{ background: parsed.isOnline ? '#10b981' : theme.pillBg, width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: parsed.isOnline ? '#fff' : theme.textSub, fontSize: '1rem' }}>
                   {parsed.isOnline ? '⚡' : '🏢'}
                 </div>
                 <div>
                   <div style={{ color: theme.textMain, fontSize: '0.9rem', fontWeight: 'bold' }}>{b.name}</div>
                   <div style={{ color: theme.textSub, fontSize: '0.7rem' }}>{parsed.isOnline ? 'Online' : 'Offline'}</div>
                 </div>
               </div>
               {parsed.isOnline && (
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontWeight: 'bold', color: theme.textMain, fontSize: '1rem' }}>{parsed.totalKw} <span style={{fontSize:'0.6rem', fontWeight:'normal', color:theme.textSub}}>kW</span></div>
                   <div style={{ fontWeight: 'bold', color: theme.blueText, fontSize: '0.8rem' }}>{parsed.totalKwh} <span style={{fontSize:'0.6rem', fontWeight:'normal', color:theme.textSub}}>kWh</span></div>
                 </div>
               )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetail = () => {
    const bldg = BUILDINGS.find(b => b.id === activeTab);
    const data = buildingData[bldg.id];
    const parsed = parseData(data?.raw);

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setActiveTab('overview')} style={{ background: 'transparent', border: 'none', color: theme.blueText, fontSize: '1rem', fontWeight: 'bold', padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          ← Back
        </button>

        <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', boxShadow: theme.shadow, marginBottom: '1rem' }}>
           <h2 style={{ margin: '0 0 0.5rem 0', color: theme.textMain, fontSize: '1.4rem' }}>{bldg.name}</h2>
           <p style={{ margin: '0 0 1.5rem 0', color: theme.textSub, fontSize: '0.85rem' }}>3-Phase Real-time Monitor</p>

           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
             <DonutChart value={parsed.totalKwh} unit="kWh" label="Total Yield" />
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
             {[
               { id: 'A', name: 'L1', data: parsed.phases.A, color: '#ef4444' },
               { id: 'B', name: 'L2', data: parsed.phases.B, color: '#f59e0b' },
               { id: 'C', name: 'L3', data: parsed.phases.C, color: '#3b82f6' }
             ].map(p => (
               <div key={p.id} style={{ background: theme.pillBg, borderRadius: '12px', padding: '1rem 0.5rem', textAlign: 'center' }}>
                 <div style={{ color: p.color, fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{p.name}</div>
                 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.textMain }}>{p.data.v} <span style={{fontSize:'0.6rem', color:theme.textSub}}>V</span></div>
                 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.textMain }}>{p.data.a} <span style={{fontSize:'0.6rem', color:theme.textSub}}>A</span></div>
                 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.textMain }}>{p.data.kw} <span style={{fontSize:'0.6rem', color:theme.textSub}}>kW</span></div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: theme.bg,
      minHeight: '100vh',
      margin: '-1rem',
      padding: '1.5rem 1rem 4rem 1rem',
      fontFamily: "'Inter', 'Prompt', sans-serif",
      color: theme.textMain,
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: 'all 0.3s ease'
    }}>
      {activeTab === 'overview' ? renderDashboard() : renderDetail()}
    </div>
  );
}
