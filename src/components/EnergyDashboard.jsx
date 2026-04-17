import React, { useState, useEffect } from 'react';

const BUILDINGS = [
  { id: 'somdej', name: 'ศาลาสมเด็จฯ', deviceId: 'a326a888ee9e0e5c67pwni' },
  { id: 'multipurpose', name: 'ศาลาพระประจำวัน', deviceId: 'a3a95d6030b8bc9a02idhq' },
  { id: 'kuti1', name: 'กุฏิ 1 (เจ้าอาวาส)', deviceId: '' },
  { id: 'kuti2', name: 'กุฏิ 2', deviceId: '' },
  { id: 'dining', name: 'หอฉัน', deviceId: '' },
  { id: 'temple', name: 'พระอุโบสถ', deviceId: '' }
];

export default function EnergyDashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState(BUILDINGS[0].id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [rawApiData, setRawApiData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  const fetchRealData = async (deviceId) => {
    if (!deviceId) {
      setApiError("ไม่พบรหัสอุปกรณ์ (Device ID)");
      setRawApiData(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/tuya?deviceId=${deviceId}`);
      const apiData = await response.json();
      
      if (apiData.success) {
        setRawApiData(apiData.result);
        setApiError(null);
      } else {
        setRawApiData(null);
        setApiError(apiData.error || "Unknown API Error");
      }
    } catch (error) {
      setRawApiData(null);
      setApiError(error.message);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const activeBldg = BUILDINGS.find(b => b.id === selectedBuilding);
    await fetchRealData(activeBldg?.deviceId);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuilding]);

  // Parsing Logic (Very Defensive)
  const parseData = (raw) => {
    // Default Empty State
    const defaultPhase = { v: '0.0', a: '0.0', kw: '0.00' };
    const parsed = {
      isOnline: false,
      totalKw: '0.00',
      forwardKwh: '0.0',
      reverseKwh: '0.0',
      phases: {
        A: { ...defaultPhase },
        B: { ...defaultPhase },
        C: { ...defaultPhase }
      }
    };

    if (!raw) return parsed;
    
    parsed.isOnline = true; // We successfully hit the Tuya API and got a result object

    const statusArray = raw.status || [];
    if (statusArray.length === 0) {
      parsed.isOnline = false;
      return parsed;
    }

    // Try to extract values by common Tuya codes (va, ia, pa)
    const findCode = (prefix) => {
       const item = statusArray.find(s => String(s.code).toLowerCase() === prefix);
       if (item && item.value !== undefined) {
         // Tuya usually sends values scaled by 10 or 1000
         const val = Number(item.value);
         return isNaN(val) ? 0 : val;
       }
       return 0;
    };

    // Very naive decoding attempt. Real logic will be updated once debug data is seen.
    parsed.phases.A.v = (findCode('va') / 10).toFixed(1);
    parsed.phases.A.a = (findCode('ia') / 1000).toFixed(1);
    parsed.phases.A.kw = (findCode('pa') / 1000).toFixed(2);
    
    parsed.phases.B.v = (findCode('vb') / 10).toFixed(1);
    parsed.phases.B.a = (findCode('ib') / 1000).toFixed(1);
    parsed.phases.B.kw = (findCode('pb') / 1000).toFixed(2);
    
    parsed.phases.C.v = (findCode('vc') / 10).toFixed(1);
    parsed.phases.C.a = (findCode('ic') / 1000).toFixed(1);
    parsed.phases.C.kw = (findCode('pc') / 1000).toFixed(2);

    parsed.totalKw = (findCode('pt') / 1000).toFixed(2);
    parsed.forwardKwh = (findCode('forward_energy_total') / 100).toFixed(1);
    
    return parsed;
  };

  const parsedData = parseData(rawApiData);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: '#020617', minHeight: '100vh', color: '#f8fafc', margin: '-1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            📡 Energy Monitor
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Real-time SCADA Dashboard</p>
        </div>
        <button onClick={handleRefresh} disabled={isRefreshing} style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }}>🔄</span>
        </button>
      </div>

      {/* Selector & Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.5rem', alignItems: 'center' }}>
           <select 
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}
            >
              {BUILDINGS.map(b => <option key={b.id} value={b.id} style={{color: '#000'}}>{b.name}</option>)}
            </select>
        </div>
        
        {/* Status Badge */}
        {apiError ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(153, 27, 27, 0.2)', color: '#fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(153, 27, 27, 0.5)', fontSize: '0.85rem' }}>
            ⚠️ Offline (API Error หรือ สัญญาณขาดหาย)
          </div>
        ) : !parsedData.isOnline && rawApiData ? (
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(153, 27, 27, 0.2)', color: '#fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(153, 27, 27, 0.5)', fontSize: '0.85rem' }}>
            🔌 อุปกรณ์ Offline (ตรวจสอบปลั๊กไฟหรืออินเทอร์เน็ต)
          </div>
        ) : rawApiData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 95, 70, 0.2)', color: '#6ee7b7', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(6, 95, 70, 0.5)', fontSize: '0.85rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            Online & Receiving Data
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>⏳ กำลังเชื่อมต่อระบบ...</div>
        )}
      </div>

      {/* Main Stats (Only show if no error) */}
      {!apiError && parsedData.isOnline && (
        <>
          <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
             <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Active Power (กำลังไฟฟ้ารวม)</p>
             <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
               <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#e2e8f0', lineHeight: 1 }}>{parsedData.totalKw}</span>
               <span style={{ color: '#64748b', fontWeight: 'bold' }}>kW</span>
             </div>
             
             <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid #334155', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>Forward Energy (หน่วยไฟที่ใช้)</p>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8' }}>{parsedData.forwardKwh} <span style={{fontSize:'0.75rem', color:'#64748b'}}>kWh</span></p>
                </div>
             </div>
          </div>

          {/* 3 Phase Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {[
              { id: 'A', name: 'Phase L1', color: '#ef4444', data: parsedData.phases.A },
              { id: 'B', name: 'Phase L2', color: '#f59e0b', data: parsedData.phases.B },
              { id: 'C', name: 'Phase L3', color: '#3b82f6', data: parsedData.phases.C }
            ].map(phase => (
              <div key={phase.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                 <div style={{ background: `rgba(${phase.id==='A'?'239,68,68':phase.id==='B'?'245,158,11':'59,130,246'}, 0.1)`, borderBottom: '1px solid #1e293b', padding: '0.5rem 1rem', color: phase.color, fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   ⚡ {phase.name}
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #1e293b' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Voltage</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{phase.data.v}</span>
                      <span style={{ fontSize: '0.65rem', color: '#475569' }}>V</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #1e293b' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Current</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{phase.data.a}</span>
                      <span style={{ fontSize: '0.65rem', color: '#475569' }}>A</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Power</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{phase.data.kw}</span>
                      <span style={{ fontSize: '0.65rem', color: '#475569' }}>kW</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Debug Tools */}
      <div style={{ marginTop: '2rem', borderTop: '1px dashed #334155', paddingTop: '1rem' }}>
        <button onClick={() => setShowDebug(!showDebug)} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
          🛠️ {showDebug ? 'ซ่อนข้อมูลดิบ' : 'แสดงข้อมูลดิบจาก Tuya (สำหรับตั้งค่า)'}
        </button>
        {showDebug && (
          <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginTop: '1rem', overflowX: 'auto', border: '1px solid #1e293b' }}>
            <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0 0 1rem 0' }}>{apiError && JSON.stringify(apiError)}</p>
            <pre style={{ margin: 0, color: '#34d399', fontSize: '0.65rem', userSelect: 'text', WebkitUserSelect: 'text' }}>{JSON.stringify(rawApiData, null, 2)}</pre>
          </div>
        )}
      </div>

    </div>
  );
}
