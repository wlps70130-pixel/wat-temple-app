import React, { useState } from 'react';

const BUILDINGS = [
  { id: 'somdej', name: 'ศาลาสมเด็จฯ', deviceId: 'ใส่_VIRTUAL_ID_ที่นี่_เช่น_vff123xx' },
  { id: 'multipurpose', name: 'ศาลาเอนกประสงค์', deviceId: '' },
  { id: 'kuti1', name: 'กุฏิ 1 (เจ้าอาวาส)', deviceId: '' },
  { id: 'kuti2', name: 'กุฏิ 2', deviceId: '' },
  { id: 'dining', name: 'หอฉัน', deviceId: '' },
  { id: 'temple', name: 'พระอุโบสถ', deviceId: '' }
  // เพิ่มอาคารเรื่อยๆ แค่ระบุชื่อ และตั้ง deviceId ให้ตรงตัวเครื่อง
];

// Mock data generator (Simulating Tuya 3-Phase Meter + Huawei Solar)
const generateMockData = () => {
  // Simulate active solar generation (Reverse Energy)
  const isSunny = new Date().getHours() > 7 && new Date().getHours() < 17;
  const solarGenKw = isSunny ? (Math.random() * 8 + 2).toFixed(2) : 0.00;
  
  return {
    timestamp: new Date().toLocaleTimeString('th-TH'),
    overall: {
      forwardKwh: (Math.random() * 50000 + 10000).toFixed(1),  // พลังงานที่ซื้อจากการไฟฟ้า
      reverseKwh: (Math.random() * 15000 + 5000).toFixed(1),   // พลังงานที่โซลาร์ผลิตย้อนแสง
      totalKw: (Math.random() * 15 + 5 - solarGenKw).toFixed(2)  // กำลังไฟสุทธิ (การใช้ - โซลาร์)
    },
    phases: [
      {
        id: 'A',
        label: 'Phase A (L1)',
        color: '#b45309', // Brown standard L1
        voltage: (220 + Math.random() * 5).toFixed(1),
        current: (Math.random() * 30 + 10).toFixed(1),
        activePower: (Math.random() * 5 + 2).toFixed(2),
        reactivePower: (Math.random() * 1).toFixed(2),
        pf: (Math.random() * 0.1 + 0.9).toFixed(2),
        freq: (49.9 + Math.random() * 0.2).toFixed(2)
      },
      {
        id: 'B',
        label: 'Phase B (L2)',
        color: '#1f2937', // Black standard L2
        voltage: (220 + Math.random() * 5).toFixed(1),
        current: (Math.random() * 30 + 10).toFixed(1),
        activePower: (Math.random() * 5 + 2).toFixed(2),
        reactivePower: (Math.random() * 1).toFixed(2),
        pf: (Math.random() * 0.1 + 0.9).toFixed(2),
        freq: (49.9 + Math.random() * 0.2).toFixed(2)
      },
      {
        id: 'C',
        label: 'Phase C (L3)',
        color: '#4b5563', // Grey standard L3
        voltage: (220 + Math.random() * 5).toFixed(1),
        current: (Math.random() * 30 + 10).toFixed(1),
        activePower: (Math.random() * 5 + 2).toFixed(2),
        reactivePower: (Math.random() * 1).toFixed(2),
        pf: (Math.random() * 0.1 + 0.9).toFixed(2),
        freq: (49.9 + Math.random() * 0.2).toFixed(2)
      }
    ]
  };
};

export default function EnergyDashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState(BUILDINGS[0].id);
  const [data, setData] = useState(generateMockData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApiMode, setIsApiMode] = useState(false);
  const [rawApiData, setRawApiData] = useState(null);

  const fetchRealData = async (deviceId) => {
    try {
      const response = await fetch(`/api/tuya?deviceId=${deviceId}`);
      const apiData = await response.json();
      
      if (apiData.success) {
        console.log("Tuya Real Data Received:", apiData.result);
        setIsApiMode(true);
        setRawApiData(apiData.result);
        // เดี๋ยวเราจะเขียนระบบแปลผลข้อมูล (Parse) ในสเตปถัดไป 
        // เมื่อเห็นหน้าตาข้อมูลดิบ (Raw JSON) ว่ารุ่นที่คุณใช้ส่งค่าออกมาชื่ออะไรบ้าง
        // ชั่วคราวตอนนี้ให้โชว์ Mock ไปก่อน
      } else {
        console.warn("Failed or Local Mode:", apiData);
        setIsApiMode(false);
        setRawApiData(null);
        setData(generateMockData());
      }
    } catch (error) {
      console.error("Vercel Serverless Error (running local vite):", error);
      setIsApiMode(false);
      setData(generateMockData()); // Fallback to mock
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const activeBldg = BUILDINGS.find(b => b.id === selectedBuilding);
    
    if (activeBldg && activeBldg.deviceId) {
      await fetchRealData(activeBldg.deviceId);
    } else {
      setIsApiMode(false);
      setRawApiData(null);
      setData(generateMockData());
    }
    
    // Fake mini-delay for smooth animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // ดึงข้อมูลใหม่ทุกครั้งที่เปลี่ยนตึก
  React.useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuilding]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem', paddingBottom: '2rem' }}>
      
      <h2 className="section-title" style={{ paddingLeft: '0.5rem', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚡</span>
        Tuya Energy Pro
      </h2>
      <p style={{ textAlign: 'center', color: isApiMode ? '#10b981' : 'var(--text-muted)', fontSize: '0.85rem', marginTop: '-1rem' }}>
        {isApiMode ? "เชื่อมต่อ API ของจริงสำเร็จ 🟢" : "ระบบติดตามพลังงานไฟฟ้า 3 เฟส & Solar Cell"}
      </p>

      {/* Temporary Raw Data Display */}
      {isApiMode && rawApiData && (
        <div style={{ background: '#1e293b', color: '#10b981', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', marginTop: '1rem' }}>
          <p style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>⚠️ ถ่ายรูปหรือคัดลอกข้อมูลด้านล่างนี้ส่งให้ผม เพื่อให้ผมเขียนโค้ดแสดงผลได้ถูกต้องครับ:</p>
          <pre>{JSON.stringify(rawApiData, null, 2)}</pre>
        </div>
      )}

      {/* Building Selector (Dropdown for 20+ buildings) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(255,255,255,0.8)', 
        padding: '0.5rem 1rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🏢</span>
        <select 
          value={selectedBuilding}
          onChange={(e) => {
            setSelectedBuilding(e.target.value);
            handleRefresh();
          }}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--primary-dark)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer'
          }}
        >
          {BUILDINGS.map(bldg => (
            <option key={bldg.id} value={bldg.id}>{bldg.name}</option>
          ))}
        </select>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>▼</span>
      </div>

      {/* Total Overview Cards (Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        
        {/* Card 1: Forward & Reverse Energy */}
        <div className="glass glass-card" style={{ 
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white', border: 'none', padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📈</span>
              <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>สรุปพลังงาน (หน่วยเทียบตั๋ว)</span>
            </div>
            <button onClick={handleRefresh} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}>
              <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }}>🔄</span>
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>การไฟฟ้า (Forward kWh)</p>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                 <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f87171' }}>{data.overall.forwardKwh}</span>
               </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>โซลาร์ผลิต (Reverse kWh)</p>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                 <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#34d399' }}>{data.overall.reverseKwh}</span>
               </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>รวมกำลังไฟสุทธิ ณ ปัจจุบัน (Total Active Power)</p>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                   <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#facc15' }}>{data.overall.totalKw}</span>
                   <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>kW</span>
                 </div>
               </div>
          </div>
        </div>
      </div>

      {/* 3-Phase Details */}
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', paddingLeft: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>📊</span> 
        เจาะลึก 3 เฟส (Tuya Parameters)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.phases.map((phase) => (
          <div key={phase.id} className="glass glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Phase Header */}
            <div style={{ background: phase.color, padding: '0.5rem 1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', letterSpacing: '1px' }}>{phase.label}</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>🟢 Online</span>
            </div>
            
            {/* Extended Multi-parameter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '1rem', gap: '1rem 0.5rem' }}>
              
              {/* Row 1 */}
              <div style={{ textAlign: 'center', paddingRight: '0.5rem', borderRight: '1px dashed rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>แรงดัน (Voltage)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2563eb' }}>{phase.voltage}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>V</span>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', paddingRight: '0.5rem', borderRight: '1px dashed rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>กระแส (Current)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#d97706' }}>{phase.current}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>A</span>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>กำลังจริง (Active P)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669' }}>{phase.activePower}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kW</span>
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ textAlign: 'center', paddingRight: '0.5rem', borderRight: '1px dashed rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>กำลังแฝง (Reactive)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#dc2626' }}>{phase.reactivePower}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>kVAR</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', paddingRight: '0.5rem', borderRight: '1px dashed rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>ค่า PF</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#6366f1' }}>{phase.pf}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>ความถี่ (Freq)</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#8b5cf6' }}>{phase.freq}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hz</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>
        อัปเดตข้อมูลล่าสุด: {data.timestamp}
      </div>
    </div>
  );
}
