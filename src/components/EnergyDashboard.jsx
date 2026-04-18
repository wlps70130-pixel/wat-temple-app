import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [graphFilter, setGraphFilter] = useState('day'); // 'day', 'week', 'month', 'year'
  const [peakRatio, setPeakRatio] = useState(40); // Default 40% On-Peak
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const HISTORY_URL = "https://script.google.com/macros/s/AKfycbzFA-Kj3b9MwwFoFrfdF06XWRvbkj4suHmS9gv616XqnoG1_o6W8LvGlKUeRwSwWFZBgw/exec";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(HISTORY_URL);
        const data = await res.json();
        
        const grouped = {};
        data.forEach(item => {
           // Extract "HH:mm" from "dd/MM/yyyy HH:mm:ss"
           const timeMatch = item.timestamp.match(/(\d{2}:\d{2}):\d{2}$/);
           const timeLabel = timeMatch ? timeMatch[1] : item.timestamp;
           
           if (!grouped[timeLabel]) {
             grouped[timeLabel] = { time: timeLabel, totalKw: 0 };
           }
           grouped[timeLabel].totalKw += parseFloat(item.totalKw || 0);
        });
        
        const chartData = Object.values(grouped);
        // Limit to latest 96 points (24 hours if 15min intervals)
        setHistoricalData(chartData.slice(-96));
      } catch(e) {
        console.error("Fetch history error", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

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
    const defaultPhase = { v: '0.0', a: '0.0', kw: '0.00', pf: '0.00', kvar: '0.00', kwh: '0.00' };
    const parsed = {
      isOnline: false,
      totalKw: '0.00',
      totalKwh: '0.00',
      totalKvar: '0.00',
      frequency: '0',
      temperature: '0.0',
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

    // Phase A
    parsed.phases.A.v = (findCode('voltagea') / 10).toFixed(1);
    parsed.phases.A.a = (findCode('currenta') / 1000).toFixed(2);
    parsed.phases.A.kw = (findCode('activepowera') / 1000).toFixed(3);
    parsed.phases.A.pf = (findCode('powerfactora') / 100).toFixed(2);
    parsed.phases.A.kvar = (findCode('reactivepowera') / 1000).toFixed(3);
    parsed.phases.A.kwh = (findCode('energyconsumeda') / 100).toFixed(2);
    
    // Phase B
    parsed.phases.B.v = (findCode('voltageb') / 10).toFixed(1);
    parsed.phases.B.a = (findCode('currentb') / 1000).toFixed(2);
    parsed.phases.B.kw = (findCode('activepowerb') / 1000).toFixed(3);
    parsed.phases.B.pf = (findCode('powerfactorb') / 100).toFixed(2);
    parsed.phases.B.kvar = (findCode('reactivepowerb') / 1000).toFixed(3);
    parsed.phases.B.kwh = (findCode('energyconsumedb') / 100).toFixed(2);
    
    // Phase C
    parsed.phases.C.v = (findCode('voltagec') / 10).toFixed(1);
    parsed.phases.C.a = (findCode('currentc') / 1000).toFixed(2);
    parsed.phases.C.kw = (findCode('activepowerc') / 1000).toFixed(3);
    parsed.phases.C.pf = (findCode('powerfactorc') / 100).toFixed(2);
    parsed.phases.C.kvar = (findCode('reactivepowerc') / 1000).toFixed(3);
    parsed.phases.C.kwh = (findCode('energyconsumedc') / 100).toFixed(2);

    // Totals & Environmental
    parsed.totalKw = (findCode('activepower') / 1000).toFixed(3);
    parsed.totalKwh = (findCode('totalenergyconsumed') / 100).toFixed(2);
    parsed.totalKvar = (findCode('reactivepower') / 1000).toFixed(3);
    parsed.frequency = findCode('frequency'); // Tuya usually sends raw 50 for 50Hz
    parsed.temperature = (findCode('temperature') / 10).toFixed(1);
    
    return parsed;
  };

  const theme = isDarkMode ? {
    bg: '#0f172a',
    cardBg: '#1e293b',
    textMain: '#f8fafc',
    textSub: '#94a3b8',
    border: '#334155',
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  } : {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    textMain: '#0f172a',
    textSub: '#64748b',
    border: '#e2e8f0',
    primary: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626'
  };

  const AmrGraph = ({ filter }) => {
    if (isLoadingHistory) {
      return (
        <div style={{ width: '100%', height: '200px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: `1px dashed ${theme.border}` }}>
          <div style={{ color: theme.textSub, fontSize: '0.9rem' }}>⏳ กำลังโหลดข้อมูลย้อนหลังจาก Google Sheets...</div>
        </div>
      );
    }
    
    if (historicalData.length === 0) {
      return (
        <div style={{ width: '100%', height: '200px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: `1px dashed ${theme.border}` }}>
          <div style={{ textAlign: 'center', color: theme.textSub }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📊</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>กำลังเริ่มเก็บสถิติ</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>ข้อมูลกราฟจะปรากฏขึ้นหลังจากการบันทึกรอบถัดไป (15 นาที)</div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height: 250, marginTop: '1.5rem', marginLeft: '-15px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
            <XAxis dataKey="time" stroke={theme.textSub} fontSize={11} tickMargin={10} minTickGap={30} />
            <YAxis stroke={theme.textSub} fontSize={11} tickFormatter={(val) => `${val}kW`} width={50} />
            <Tooltip 
              contentStyle={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textMain, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: theme.primary, fontWeight: 'bold' }}
              labelStyle={{ color: theme.textSub, marginBottom: '0.25rem', fontSize: '0.85rem' }}
            />
            <Line 
              type="monotone" 
              dataKey="totalKw" 
              name="กำลังไฟรวม (kW)" 
              stroke={theme.primary} 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6, fill: theme.primary, stroke: theme.cardBg, strokeWidth: 2 }} 
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDashboard = () => {
    let globalKw = 0;
    let globalKwh = 0;
    
    BUILDINGS.forEach(b => {
      if (buildingData[b.id]?.raw) {
        const pd = parseData(buildingData[b.id].raw);
        if (pd.isOnline) {
          globalKw += parseFloat(pd.totalKw);
          globalKwh += parseFloat(pd.totalKwh);
        }
      }
    });

    // PEA TOU Calculation (Type 6.2 Non-profit Low Voltage)
    const PEA_RATES = {
      onPeak: 4.3888,
      offPeak: 2.6468,
      ft: 0.3972,
      service: 312.24,
      vat: 0.07
    };

    const onPeakKwh = globalKwh * (peakRatio / 100);
    const offPeakKwh = globalKwh * (1 - (peakRatio / 100));
    
    const onPeakCost = onPeakKwh * PEA_RATES.onPeak;
    const offPeakCost = offPeakKwh * PEA_RATES.offPeak;
    const ftCost = globalKwh * PEA_RATES.ft;
    const totalBeforeVat = onPeakCost + offPeakCost + ftCost + (globalKwh > 0 ? PEA_RATES.service : 0);
    const vatAmount = totalBeforeVat * PEA_RATES.vat;
    const totalCost = totalBeforeVat + vatAmount;

    const getTouStatus = (date) => {
      const day = date.getDay();
      const hour = date.getHours();
      const isWeekday = day >= 1 && day <= 5;
      const isPeakHour = hour >= 9 && hour < 22;
      return (isWeekday && isPeakHour) ? 'ON_PEAK' : 'OFF_PEAK';
    };

    const touStatus = getTouStatus(currentTime);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>ภาพรวมพลังงาน</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textSub }}>วัดหลวงพ่อสดธรรมกายาราม</p>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textMain, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>
            {isDarkMode ? '🌙' : '☀'}
          </button>
        </div>

        {/* Master Summary Card */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textSub }}>หน่วยไฟสะสมทั้งหมด</p>
              <h2 style={{ margin: '0.25rem 0', fontSize: '2rem', color: theme.primary }}>{globalKwh.toLocaleString(undefined, {maximumFractionDigits:0})} <span style={{fontSize:'1rem'}}>kWh</span></h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textSub }}>ประมาณการค่าไฟ (TOU)</p>
              <h2 style={{ margin: '0.25rem 0', fontSize: '1.5rem', color: theme.textMain }}>{totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{fontSize:'1rem'}}>฿</span></h2>
            </div>
          </div>
          
          {/* TOU DETAILS */}
          <div style={{ marginTop: '1rem', padding: '1rem', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', fontSize: '0.85rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>สถานะเวลาปัจจุบัน: <strong style={{ color: touStatus === 'ON_PEAK' ? theme.danger : theme.success }}>{touStatus === 'ON_PEAK' ? '🔴 On-Peak (4.3888 ฿/หน่วย)' : '🟢 Off-Peak (2.6468 ฿/หน่วย)'}</strong></span>
                <span style={{ color: theme.textSub }}>{currentTime.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.</span>
             </div>
             
             <div style={{ borderTop: `1px dashed ${theme.border}`, margin: '0.5rem 0' }}></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: theme.textSub }}>สัดส่วนการใช้ไฟ On-Peak โดยประมาณ:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="range" min="0" max="100" value={peakRatio} onChange={e => setPeakRatio(e.target.value)} style={{ width: '80px', accentColor: theme.primary }}/>
                  <span style={{ color: theme.textMain, fontWeight: 'bold', width: '35px', textAlign: 'right' }}>{peakRatio}%</span>
                </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: theme.textSub, marginTop: '0.75rem' }}>
                <div>On-Peak ({peakRatio}%): {onPeakKwh.toLocaleString('th-TH', {maximumFractionDigits:1})} หน่วย<br/><span style={{color: theme.textMain}}>{onPeakCost.toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})} ฿</span></div>
                <div>Off-Peak ({100-peakRatio}%): {offPeakKwh.toLocaleString('th-TH', {maximumFractionDigits:1})} หน่วย<br/><span style={{color: theme.textMain}}>{offPeakCost.toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})} ฿</span></div>
                <div>ค่า Ft (0.3972 ฿/หน่วย):<br/><span style={{color: theme.textMain}}>{ftCost.toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})} ฿</span></div>
                <div>ค่าบริการรายเดือน (PEA):<br/><span style={{color: theme.textMain}}>{(globalKwh > 0 ? PEA_RATES.service : 0).toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})} ฿</span></div>
             </div>
             <div style={{ textAlign: 'right', marginTop: '0.75rem', color: theme.textMain, fontWeight: 'bold', borderTop: `1px dashed ${theme.border}`, paddingTop: '0.5rem' }}>
                รวมภาษีมูลค่าเพิ่ม 7% = {vatAmount.toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})} ฿
             </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: theme.textSub }}>กำลังไฟฟ้าปัจจุบัน (Real-time)</span>
            <div style={{ textAlign: 'right' }}>
               <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textMain }}>{globalKw.toFixed(2)} kW</span>
               <div style={{ fontSize: '0.75rem', color: touStatus === 'ON_PEAK' ? theme.danger : theme.success }}>
                  คิดเป็นค่าไฟประมาณ { (globalKw * (touStatus === 'ON_PEAK' ? PEA_RATES.onPeak : PEA_RATES.offPeak)).toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2}) } ฿/ชม.
               </div>
            </div>
          </div>
        </div>

        {/* Graph Section */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain }}>สถิติการใช้งาน</h3>
          </div>
          
          {/* Time Filter Tabs */}
          <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            {['day', 'week', 'month', 'year'].map(filter => {
              const labels = { 'day':'วัน', 'week':'สัปดาห์', 'month':'เดือน', 'year':'ปี' };
              const isActive = graphFilter === filter;
              return (
                <div key={filter} onClick={() => setGraphFilter(filter)} style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0', borderRadius: '6px', fontSize: '0.85rem', fontWeight: isActive ? 'bold' : 'normal', cursor: 'pointer', background: isActive ? theme.cardBg : 'transparent', color: isActive ? theme.textMain : theme.textSub, boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                  {labels[filter]}
                </div>
              );
            })}
          </div>

          <AmrGraph filter={graphFilter} />
        </div>

        {/* Prominent Building List */}
        <div>
          <h3 style={{ margin: '1rem 0 0.75rem 0', fontSize: '1.2rem', color: theme.textMain }}>รายการจุดตรวจวัด ({BUILDINGS.length} จุด)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {BUILDINGS.map(b => {
              const hasDevice = !!b.deviceId;
              const data = buildingData[b.id];
              const parsed = parseData(data?.raw);
              
              return (
                <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ background: theme.cardBg, borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: hasDevice ? (parsed.isOnline ? theme.success : theme.danger) : theme.border }}></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain, fontWeight: '500' }}>{b.name}</h4>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: theme.textSub }}>
                        {hasDevice ? (parsed.isOnline ? 'เชื่อมต่อแล้ว' : 'ออฟไลน์') : 'รอการติดตั้งอุปกรณ์'}
                      </p>
                    </div>
                  </div>
                  {hasDevice && parsed.isOnline && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme.textMain }}>{parsed.totalKw} <span style={{fontSize:'0.75rem', fontWeight:'normal', color:theme.textSub}}>kW</span></div>
                      <div style={{ fontSize: '0.85rem', color: theme.primary }}>{parsed.totalKwh} <span style={{fontSize:'0.75rem', color:theme.textSub}}>kWh</span></div>
                    </div>
                  )}
                  {!hasDevice && (
                    <div style={{ color: theme.border, fontSize: '1.2rem' }}>➔</div>
                  )}
                </div>
              );
            })}
          </div>
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
        <button onClick={() => setActiveTab('overview')} style={{ background: 'transparent', border: 'none', color: theme.primary, fontSize: '1rem', padding: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          ← ย้อนกลับ
        </button>

        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
               <h2 style={{ margin: 0, color: theme.textMain, fontSize: '1.5rem' }}>{bldg.name}</h2>
               <p style={{ margin: '0.25rem 0 0 0', color: theme.textSub, fontSize: '0.9rem' }}>ข้อมูลเชิงลึก 3 เฟส (100% Tuya Data)</p>
             </div>
             {hasDevice && parsed.isOnline ? (
               <span style={{ background: 'rgba(16,185,129,0.1)', color: theme.success, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>Online</span>
             ) : (
               <span style={{ background: 'rgba(239,68,68,0.1)', color: theme.danger, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>Offline</span>
             )}
           </div>

           {!hasDevice ? (
             <div style={{ textAlign: 'center', padding: '3rem 1rem', color: theme.textSub }}>
               <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🚧</p>
               <p style={{ margin: 0 }}>จุดนี้อยู่ระหว่างรอการติดตั้งสมาร์ทมิเตอร์</p>
             </div>
           ) : (
             <>
               {/* Totals Section */}
               <h3 style={{ margin: '1.5rem 0 1rem 0', fontSize: '1.1rem', color: theme.textMain, borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem' }}>ภาพรวมทางไฟฟ้า (Totals)</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.85rem', color: theme.textSub }}>กำลังไฟรวม (Active Power)</div>
                   <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.textMain }}>{parsed.totalKw} <span style={{fontSize:'0.85rem', fontWeight:'normal'}}>kW</span></div>
                 </div>
                 <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.85rem', color: theme.textSub }}>หน่วยไฟสะสม (Total Energy)</div>
                   <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.primary }}>{parsed.totalKwh} <span style={{fontSize:'0.85rem', fontWeight:'normal'}}>kWh</span></div>
                 </div>
                 <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.85rem', color: theme.textSub }}>กำลังไฟฟ้ารีแอกทีฟรวม</div>
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textMain }}>{parsed.totalKvar} <span style={{fontSize:'0.85rem', fontWeight:'normal'}}>kVar</span></div>
                 </div>
                 <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.85rem', color: theme.textSub }}>ความถี่ / อุณหภูมิ</div>
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.textMain }}>{parsed.frequency} <span style={{fontSize:'0.85rem', fontWeight:'normal'}}>Hz</span> / {parsed.temperature} <span style={{fontSize:'0.85rem', fontWeight:'normal'}}>°C</span></div>
                 </div>
               </div>

               {/* 3 Phase Detailed Section */}
               <h3 style={{ margin: '2rem 0 1rem 0', fontSize: '1.1rem', color: theme.textMain, borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem' }}>รายละเอียดแยกเฟส (Phases)</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {[
                   { id: 'A', name: 'เฟส A (L1)', data: parsed.phases.A, color: '#ef4444' },
                   { id: 'B', name: 'เฟส B (L2)', data: parsed.phases.B, color: '#f59e0b' },
                   { id: 'C', name: 'เฟส C (L3)', data: parsed.phases.C, color: '#3b82f6' }
                 ].map(p => (
                   <div key={p.id} style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '1rem', borderLeft: `4px solid ${p.color}` }}>
                     <div style={{ fontWeight: 'bold', color: theme.textMain, fontSize: '1rem', marginBottom: '0.75rem' }}>{p.name}</div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                       <div><div style={{fontSize:'0.75rem', color:theme.textSub}}>แรงดัน (V)</div><div style={{fontSize:'1.1rem', color:theme.textMain}}>{p.data.v}</div></div>
                       <div><div style={{fontSize:'0.75rem', color:theme.textSub}}>กระแส (A)</div><div style={{fontSize:'1.1rem', color:theme.textMain}}>{p.data.a}</div></div>
                       <div><div style={{fontSize:'0.75rem', color:theme.textSub}}>กำลังไฟ (kW)</div><div style={{fontSize:'1.1rem', color:theme.textMain}}>{p.data.kw}</div></div>
                       <div><div style={{fontSize:'0.75rem', color:theme.textSub}}>PF</div><div style={{fontSize:'1.1rem', color:theme.textMain}}>{p.data.pf}</div></div>
                       <div><div style={{fontSize:'0.75rem', color:theme.textSub}}>Reactive (kVar)</div><div style={{fontSize:'1.1rem', color:theme.textMain}}>{p.data.kvar}</div></div>
                       <div><div style={{fontSize:'0.75rem', color:theme.textSub}}>สะสม (kWh)</div><div style={{fontSize:'1.1rem', color:theme.textMain}}>{p.data.kwh}</div></div>
                     </div>
                   </div>
                 ))}
               </div>
             </>
           )}
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
      fontFamily: "'Prompt', sans-serif",
      color: theme.textMain,
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: 'background 0.3s ease'
    }}>
      {activeTab === 'overview' ? renderDashboard() : renderDetail()}
    </div>
  );
}
