import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const BUILDINGS = [
  { id: 'somdej', name: 'ศาลาสมเด็จฯ', deviceId: 'a326a888ee9e0e5c67pwni' },
  { id: 'multipurpose', name: 'ศาลาพระประจำวัน', deviceId: 'a3a95d6030b8bc9a02idhq' },
  { id: 'solar', name: 'พลังงานโซล่าเซลล์', deviceId: 'e08cfe96bc38', isSolar: true, type: 'shelly' },
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
  const [graphFilter, setGraphFilter] = useState('15min'); // '15min', '30min', '1hour', 'day'
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [rawHistory, setRawHistory] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const HISTORY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=2048515869&single=true&output=csv";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(HISTORY_URL);
        const csvText = await res.text();
        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        
        const parsedData = results.data.map(row => {
          let kw = parseFloat(row['กำลังไฟรวม (kW)'] || 0);
          if (kw < -100 || kw > 1000) kw = 0; 
          
          return {
            timestamp: row['วัน-เวลา'],
            building: row['อาคาร'],
            totalKw: kw,
            touStatus: row['ช่วงเวลา (TOU)']
          };
        }).filter(r => r.timestamp);
        
        setRawHistory(parsedData);
      } catch(e) {
        console.error("Fetch history error", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!rawHistory.length) return;

    const grouped = {};
    rawHistory.forEach(item => {
      if (!item.timestamp || typeof item.timestamp !== 'string') return;
      
      let datePart = "";
      let hourPart = "";
      let minPart = 0;

      if (item.timestamp.includes('T')) {
        // Handle "2026-04-18T19:35:19.000Z" (Sheet date conversion bug)
        const match = item.timestamp.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):/);
        if (match) {
          datePart = `${match[3]}/${match[2]}`;
          hourPart = match[4];
          minPart = parseInt(match[5], 10);
        }
      } else {
        // Handle "18/04/2026 19:35:19"
        const match = item.timestamp.match(/(\d{2}\/\d{2})\/\d{4} (\d{2}):(\d{2}):/);
        if (match) {
          datePart = match[1];
          hourPart = match[2];
          minPart = parseInt(match[3], 10);
        }
      }

      if (!datePart || !hourPart) return; // Skip invalid or garbage rows
      
      let timeLabel = "";
      if (graphFilter === '15min') {
        timeLabel = `${hourPart}:${minPart.toString().padStart(2, '0')}`;
      } else if (graphFilter === '30min') {
        minPart = minPart < 30 ? "00" : "30";
        timeLabel = `${hourPart}:${minPart}`;
      } else if (graphFilter === '1hour') {
        timeLabel = `${hourPart}:00`;
      } else if (graphFilter === 'day') {
        timeLabel = datePart;
      }
      
      const fullLabel = graphFilter === 'day' ? timeLabel : `${datePart} ${timeLabel}`;
      
      if (!grouped[fullLabel]) {
        grouped[fullLabel] = { displayTime: timeLabel, sumKwLoad: 0, countLoad: 0, sumKwSolar: 0, countSolar: 0 };
      }
      
      if (item.building === 'พลังงานโซล่าเซลล์') {
        grouped[fullLabel].sumKwSolar += parseFloat(item.totalKw || 0);
        grouped[fullLabel].countSolar += 1;
      } else {
        grouped[fullLabel].sumKwLoad += parseFloat(item.totalKw || 0);
        grouped[fullLabel].countLoad += 1;
      }
    });

    const activeLoadDevices = BUILDINGS.filter(b => b.deviceId && !b.isSolar).length || 1;
    const activeSolarDevices = BUILDINGS.filter(b => b.deviceId && b.isSolar).length || 1;

    const chartData = Object.values(grouped).map(g => {
      const timestampsCountLoad = g.countLoad / activeLoadDevices;
      const avgKwLoad = timestampsCountLoad > 0 ? (g.sumKwLoad / timestampsCountLoad) : 0;
      
      const timestampsCountSolar = g.countSolar / activeSolarDevices;
      const avgKwSolar = timestampsCountSolar > 0 ? (g.sumKwSolar / timestampsCountSolar) : 0;
      
      return {
        time: g.displayTime,
        totalKw: parseFloat(avgKwLoad.toFixed(2)),
        solarKw: parseFloat(avgKwSolar.toFixed(2))
      };
    });

    let pointsToKeep = 96;
    if (graphFilter === '30min') pointsToKeep = 48;
    if (graphFilter === '1hour') pointsToKeep = 24;
    if (graphFilter === 'day') pointsToKeep = 7;
    
    setHistoricalData(chartData.slice(-pointsToKeep));
  }, [rawHistory, graphFilter]);

  const fetchRealData = async (bldgId, deviceId, type) => {
    if (!deviceId) return;
    try {
      const url = type === 'shelly' ? `/api/shelly?deviceId=${deviceId}` : `/api/tuya?deviceId=${deviceId}`;
      const response = await fetch(url);
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
    const promises = BUILDINGS.filter(b => b.deviceId).map(b => fetchRealData(b.id, b.deviceId, b.type));
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
    border: 'rgba(255,255,255,0.05)',
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    shadow: '0 8px 20px rgba(0,0,0,0.4)'
  } : {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    textMain: '#0f172a',
    textSub: '#64748b',
    border: 'rgba(0,0,0,0.04)',
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    shadow: '0 8px 24px rgba(0,0,0,0.04)'
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
          <BarChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
            <XAxis dataKey="time" stroke={theme.textSub} fontSize={11} tickMargin={10} minTickGap={30} />
            <YAxis stroke={theme.textSub} fontSize={11} tickFormatter={(val) => `${val}kW`} width={50} />
            <Tooltip 
              contentStyle={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textMain, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: theme.primary, fontWeight: 'bold' }}
              labelStyle={{ color: theme.textSub, marginBottom: '0.25rem', fontSize: '0.85rem' }}
              cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
            />
            <Bar 
              dataKey="totalKw" 
              name="กำลังไฟใช้จริงรวม (kW)" 
              fill={theme.primary} 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar 
              dataKey="solarKw" 
              name="โซล่าเซลล์ผลิตได้ (kW)" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDashboard = () => {
    let globalKw = 0;
    let globalKwh = 0;
    let solarKw = 0;
    let solarKwh = 0;
    
    BUILDINGS.forEach(b => {
      if (buildingData[b.id]?.raw) {
        const pd = parseData(buildingData[b.id].raw);
        if (pd.isOnline) {
          if (!b.isSolar) {
            globalKw += parseFloat(pd.totalKw);
            globalKwh += parseFloat(pd.totalKwh);
          } else {
            solarKw += parseFloat(pd.totalKw);
            solarKwh += parseFloat(pd.totalKwh);
          }
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

    // Calculate REAL ratio from history
    let historyOnPeak = 0;
    let historyOffPeak = 0;
    rawHistory.forEach(r => {
      if (r.touStatus === 'ON_PEAK') historyOnPeak += r.totalKw;
      else if (r.touStatus === 'OFF_PEAK') historyOffPeak += r.totalKw;
    });
    
    let realPeakRatio = 40; // Default if no data
    if (historyOnPeak + historyOffPeak > 0) {
      realPeakRatio = (historyOnPeak / (historyOnPeak + historyOffPeak)) * 100;
    }

    const onPeakKwh = globalKwh * (realPeakRatio / 100);
    const offPeakKwh = globalKwh * (1 - (realPeakRatio / 100));
    
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

    const activeDevicesCount = BUILDINGS.filter(b => b.deviceId && buildingData[b.id]?.raw && parseData(buildingData[b.id].raw).isOnline).length;
    const totalDevicesCount = BUILDINGS.filter(b => b.deviceId).length;
    const allOnline = activeDevicesCount > 0 && activeDevicesCount === totalDevicesCount;

    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const currentMonth = months[currentTime.getMonth()];
    const currentYear = currentTime.getFullYear() + 543;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fade-in 0.4s ease-out' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: theme.textMain, letterSpacing: '-0.5px' }}>Dashboard</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textMain, borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', boxShadow: theme.shadow }}>
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Dark Banner */}
        <div style={{ background: isDarkMode ? '#18181b' : '#27272a', borderRadius: '24px', padding: '1.75rem 1.5rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: theme.shadow }}>
           <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <div style={{ width: '70%' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.3', letterSpacing: '0.5px' }}>
                   <span style={{color: '#a3e635'}}>SUSTAINABLE</span> SUN<br/>ENERGY MONITORING<br/><span style={{opacity: 0.6, fontSize: '0.9rem'}}>DASHBOARD</span>
                </h2>
                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>System Status: </div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: allOnline ? '#a3e635' : '#ef4444' }}>{allOnline ? 'ALL ONLINE' : 'SOME OFFLINE'}</div>
                </div>
              </div>
              
              <div style={{ marginTop: '1.25rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fcd34d', fontWeight: 'bold', fontSize: '0.85rem' }}>
                       ✨ ประมาณการค่าไฟ (TOU)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                       เดือน {currentMonth} {currentYear}
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* On-Peak */}
                    <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: '600' }}>🔴 On-Peak</span>
                       <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f87171' }}>{onPeakCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })} <span style={{fontSize:'0.75rem'}}>฿</span></span>
                    </div>
                    {/* Off-Peak */}
                    <div style={{ flex: 1, background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: '600' }}>🟢 Off-Peak</span>
                       <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#4ade80' }}>{offPeakCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })} <span style={{fontSize:'0.75rem'}}>฿</span></span>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>รวมค่าบริการ/Ft/ภาษี</span>
                    <div style={{ background: 'white', color: '#0f172a', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                       รวม {totalCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ฿
                    </div>
                 </div>
              </div>
           </div>
           {/* House Image / Icon */}
           <div style={{ position: 'absolute', right: '-15px', top: '15px', fontSize: '6.5rem', opacity: 0.95, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
              🏡
           </div>
        </div>

        {/* Two Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           {/* Card 1: Solar Power */}
           <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <div style={{ fontSize: '0.95rem', fontWeight: '800', color: theme.textMain }}>Solar Yield</div>
                 <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: 'bold' }}>↗</div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '2.2rem', fontWeight: '800', color: theme.textMain, letterSpacing: '-1px' }}>
                 {solarKw.toFixed(2)} <span style={{fontSize: '1rem', color: theme.textSub, fontWeight: '600'}}>kW</span>
              </div>
              {/* Mini visual - green bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '50px', marginTop: 'auto', paddingTop: '1rem' }}>
                 {[40, 70, 30, 80, 50, 100, 60].map((h, i) => (
                   <div key={i} style={{ flex: 1, background: i === 5 ? '#84cc16' : (isDarkMode ? '#334155' : '#e2e8f0'), height: `${h}%`, borderRadius: '4px' }}></div>
                 ))}
              </div>
           </div>

           {/* Card 2: Load Power */}
           <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <div style={{ fontSize: '0.95rem', fontWeight: '800', color: theme.textMain }}>Building Load</div>
                 <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: 'bold' }}>↗</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: '1rem' }}>
                 {/* CSS Circle */}
                 <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(${touStatus === 'ON_PEAK' ? '#ef4444' : '#84cc16'} ${Math.min((globalKw/200)*100, 100)}%, ${isDarkMode ? '#334155' : '#e2e8f0'} 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.cardBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ fontSize: '1.3rem', fontWeight: '800', color: theme.textMain, lineHeight: '1' }}>{globalKw.toFixed(1)}</div>
                       <div style={{ fontSize: '0.65rem', color: theme.textSub, fontWeight: '600', marginTop: '2px' }}>kW</div>
                    </div>
                 </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', fontWeight: '800', color: theme.textMain }}>
                 {touStatus === 'ON_PEAK' ? '🔴 On-Peak' : '🟢 Off-Peak'}
              </div>
           </div>
        </div>

        {/* Graph Section */}
        <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain, fontWeight: '700' }}>สถิติการใช้งาน</h3>
          </div>
          
          {/* Time Filter Tabs */}
          <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
            {['15min', '30min', '1hour', 'day'].map(filter => {
              const labels = { '15min':'15 นาที', '30min':'30 นาที', '1hour':'1 ชั่วโมง', 'day':'รายวัน' };
              const isActive = graphFilter === filter;
              return (
                <div key={filter} onClick={() => setGraphFilter(filter)} style={{ flex: 1, textAlign: 'center', padding: '0.5rem 0', borderRadius: '10px', fontSize: '0.85rem', fontWeight: isActive ? '700' : '500', cursor: 'pointer', background: isActive ? theme.cardBg : 'transparent', color: isActive ? theme.textMain : theme.textSub, boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                  {labels[filter]}
                </div>
              );
            })}
          </div>

          <AmrGraph filter={graphFilter} />
        </div>

        {/* List of Panels */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: theme.textMain, fontWeight: '800' }}>Panels</h3>
            <span style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: '500' }}>Total {BUILDINGS.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {BUILDINGS.map(b => {
              const hasDevice = !!b.deviceId;
              const data = buildingData[b.id];
              const parsed = parseData(data?.raw);
              const isSolar = b.isSolar;
              
              let statusText = 'Pending';
              let statusColor = theme.warning;
              if (hasDevice) {
                statusText = parsed.isOnline ? 'Active' : 'Offline';
                statusColor = parsed.isOnline ? theme.success : theme.danger;
              }
              
              return (
                <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ background: theme.cardBg, borderRadius: '20px', padding: '1.1rem 1.25rem', cursor: 'pointer', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.1s' }}>
                  
                  {/* Icon */}
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isSolar ? (isDarkMode ? '#451a03' : '#fef3c7') : (isDarkMode ? '#1e293b' : '#f1f5f9'), border: `1px solid ${isSolar ? '#fde68a' : theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                    {isSolar ? '☀️' : '🏢'}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ margin: 0, fontSize: '1.05rem', color: theme.textMain, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </div>
                    <div style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: theme.textSub, fontWeight: '500' }}>
                      Power {hasDevice && parsed.isOnline ? parsed.totalKw : '0.00'} kW
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: statusColor, marginBottom: '0.2rem' }}>
                      {statusText}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: theme.textMain, fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <span style={{ color: theme.warning }}>⚡</span> {hasDevice && parsed.isOnline ? parsed.totalKwh : '--'} <span style={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: '600' }}>kwh</span>
                    </div>
                  </div>
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

    if (bldg.isSolar) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fade-in 0.3s ease-out' }}>
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .solar-ring {
              background: conic-gradient(#84cc16 80%, ${isDarkMode ? '#334155' : '#e2e8f0'} 0);
            }
          `}</style>
          
          {/* Top Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            <button onClick={() => setActiveTab('overview')} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textMain, width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: theme.shadow, flexShrink: 0, fontSize: '1.2rem' }}>
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, color: theme.textMain, fontSize: '1.2rem', fontWeight: '800' }}>Solar Dashboard</h2>
            </div>
          </div>

          {/* Dark Banner */}
          <div style={{ background: isDarkMode ? '#18181b' : '#27272a', borderRadius: '24px', padding: '1.75rem 1.5rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: theme.shadow }}>
             <div style={{ position: 'relative', zIndex: 1, width: '65%' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.3', letterSpacing: '0.5px' }}>
                   <span style={{color: '#a3e635'}}>SUSTAINABLE</span> SUN<br/>ENERGY MONITORING<br/><span style={{opacity: 0.6, fontSize: '0.9rem'}}>DASHBOARD</span>
                </h2>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>System Status: </div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: parsed.isOnline ? '#a3e635' : '#ef4444' }}>{parsed.isOnline ? 'ACTIVE' : 'OFFLINE'}</div>
                </div>
             </div>
             {/* House Image / Icon */}
             <div style={{ position: 'absolute', right: '-15px', bottom: '-20px', fontSize: '7rem', opacity: 0.95, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
                🏡
             </div>
          </div>

          {/* Two Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             {/* Card 1: Power */}
             <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <div style={{ fontSize: '0.95rem', fontWeight: '800', color: theme.textMain }}>Current Power</div>
                   <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: 'bold' }}>↗</div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '2.2rem', fontWeight: '800', color: theme.textMain, letterSpacing: '-1px' }}>
                   {parsed.totalKw} <span style={{fontSize: '1rem', color: theme.textSub, fontWeight: '600'}}>kW</span>
                </div>
                {/* Mini visual - green bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '50px', marginTop: 'auto', paddingTop: '1rem' }}>
                   {[40, 70, 30, 80, 50, 100, 60].map((h, i) => (
                     <div key={i} style={{ flex: 1, background: i === 5 ? '#84cc16' : (isDarkMode ? '#334155' : '#e2e8f0'), height: `${h}%`, borderRadius: '4px' }}></div>
                   ))}
                </div>
             </div>

             {/* Card 2: Energy & Status Ring */}
             <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <div style={{ fontSize: '0.95rem', fontWeight: '800', color: theme.textMain }}>Yield Status</div>
                   <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: 'bold' }}>↗</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: '1rem' }}>
                   {/* CSS Circle */}
                   <div className="solar-ring" style={{ width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.cardBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.textMain, lineHeight: '1' }}>{parsed.isOnline ? '98%' : '0%'}</div>
                         <div style={{ fontSize: '0.65rem', color: theme.textSub, fontWeight: '600', marginTop: '2px' }}>Efficiency</div>
                      </div>
                   </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>
                   {parsed.totalKwh} <span style={{fontSize: '0.8rem', color: theme.textSub}}>kWh</span>
                </div>
             </div>
          </div>

          {/* Phases List */}
          <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: theme.textMain }}>Inverter Phases</div>
                <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: 'bold' }}>↗</div>
             </div>
             
             {!hasDevice || !parsed.isOnline ? (
               <div style={{ textAlign: 'center', padding: '2rem 0', color: theme.textSub, fontSize: '0.9rem', fontWeight: '500' }}>
                 Waiting for inverter connection...
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { name: 'L1', data: parsed.phases.A },
                    { name: 'L2', data: parsed.phases.B },
                    { name: 'L3', data: parsed.phases.C }
                  ].map(p => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontWeight: '800', color: theme.textMain, fontSize: '1.1rem' }}>{p.name}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontSize: '0.8rem', color: theme.textSub, fontWeight: '600' }}>{p.data.v}V</span>
                           <span style={{ fontSize: '0.8rem', color: theme.textSub, fontWeight: '600' }}>{p.data.a}A</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontWeight: '800', color: '#84cc16', fontSize: '1.2rem' }}>{p.data.kw} <span style={{fontSize:'0.8rem', color:theme.textSub}}>kW</span></div>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fade-in 0.3s ease-out' }}>
        <style>{`
          @keyframes pulse-dot {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Top Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button onClick={() => setActiveTab('overview')} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textMain, width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: theme.shadow, flexShrink: 0, fontSize: '1.2rem' }}>
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, color: bldg.isSolar ? '#d97706' : theme.textMain, fontSize: '1.4rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.5px' }}>
              {bldg.isSolar ? '☀️ ' : ''}{bldg.name}
            </h2>
            <p style={{ margin: 0, color: theme.textSub, fontSize: '0.85rem', fontWeight: '500' }}>Real-time Phase Data</p>
          </div>
          {hasDevice && parsed.isOnline ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: theme.success, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.success, animation: 'pulse-dot 2s infinite' }}></div>
              ONLINE
            </div>
          ) : hasDevice ? (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: theme.danger, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>OFFLINE</div>
          ) : null}
        </div>

        {!hasDevice ? (
           <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '4rem 1rem', textAlign: 'center', border: `1px dashed ${theme.border}` }}>
             <div style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', opacity: 0.3 }}>⚡</div>
             <p style={{ margin: 0, fontWeight: '700', color: theme.textMain, fontSize: '1.2rem' }}>รอการติดตั้งอุปกรณ์</p>
             <p style={{ margin: '0.5rem 0 0 0', color: theme.textSub, fontSize: '0.9rem' }}>ระบบจะแสดงผลทันทีเมื่อมีการเชื่อมต่อสำเร็จ</p>
           </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                 <div style={{ fontSize: '0.85rem', color: theme.textSub, fontWeight: '600', marginBottom: '0.4rem' }}>Total Power</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: '800', color: theme.primary, lineHeight: '1.1' }}>{parsed.totalKw} <span style={{fontSize:'1rem', color:theme.textSub, fontWeight:'600'}}>kW</span></div>
               </div>
               <div style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                 <div style={{ fontSize: '0.85rem', color: theme.textSub, fontWeight: '600', marginBottom: '0.4rem' }}>Total Energy</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: '800', color: theme.success, lineHeight: '1.1' }}>{parsed.totalKwh} <span style={{fontSize:'1rem', color:theme.textSub, fontWeight:'600'}}>kWh</span></div>
               </div>
            </div>

            {/* Environmental / Extra */}
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ flex: 1, background: theme.cardBg, borderRadius: '20px', padding: '1rem 1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.85rem', color: theme.textSub, fontWeight: '600' }}>Frequency</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>{parsed.frequency} <span style={{fontSize:'0.8rem', color:theme.textSub}}>Hz</span></span>
               </div>
               <div style={{ flex: 1, background: theme.cardBg, borderRadius: '20px', padding: '1rem 1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.85rem', color: theme.textSub, fontWeight: '600' }}>Temp</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>{parsed.temperature} <span style={{fontSize:'0.8rem', color:theme.textSub}}>°C</span></span>
               </div>
            </div>

            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', color: theme.textMain, fontWeight: '800', padding: '0 0.5rem' }}>Phases</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { id: 'A', name: 'Phase A', label: 'L1', data: parsed.phases.A, color: '#ef4444', icon: '🔴' },
                { id: 'B', name: 'Phase B', label: 'L2', data: parsed.phases.B, color: '#f59e0b', icon: '🟡' },
                { id: 'C', name: 'Phase C', label: 'L3', data: parsed.phases.C, color: '#3b82f6', icon: '🔵' }
              ].map(p => (
                <div key={p.id} style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, position: 'relative', overflow: 'hidden' }}>
                   {/* Background subtle color hint */}
                   <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: \`radial-gradient(circle, \${p.color} 0%, transparent 70%)\`, opacity: isDarkMode ? 0.15 : 0.05, transform: 'translate(30%, -30%)' }}></div>
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                       <strong style={{ color: theme.textMain, fontSize: '1.2rem', fontWeight: '800' }}>{p.name}</strong>
                     </div>
                     <div style={{ fontSize: '0.85rem', color: p.color, fontWeight: '800', background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '0.3rem 0.8rem', borderRadius: '10px' }}>{p.label}</div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                     <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                       <div style={{ fontSize: '0.8rem', color: theme.textSub, fontWeight: '600' }}>Voltage</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: '800', color: theme.textMain, marginTop: '0.2rem' }}>{p.data.v}<span style={{fontSize:'0.75rem', fontWeight:'600', marginLeft:'2px', color:theme.textSub}}>V</span></div>
                     </div>
                     <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                       <div style={{ fontSize: '0.8rem', color: theme.textSub, fontWeight: '600' }}>Current</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: '800', color: theme.textMain, marginTop: '0.2rem' }}>{p.data.a}<span style={{fontSize:'0.75rem', fontWeight:'600', marginLeft:'2px', color:theme.textSub}}>A</span></div>
                     </div>
                     <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '16px', border: \`1px solid \${p.color}40\` }}>
                       <div style={{ fontSize: '0.8rem', color: theme.textSub, fontWeight: '600' }}>Power</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: '800', color: p.color, marginTop: '0.2rem' }}>{p.data.kw}<span style={{fontSize:'0.75rem', fontWeight:'600', marginLeft:'2px'}}>kW</span></div>
                     </div>
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: \`1px dashed \${theme.border}\`, fontSize: '0.85rem', color: theme.textSub, position: 'relative', zIndex: 1, fontWeight: '500' }}>
                     <div>PF: <strong style={{color: theme.textMain}}>{p.data.pf}</strong></div>
                     <div>kVar: <strong style={{color: theme.textMain}}>{p.data.kvar}</strong></div>
                     <div><strong style={{color: theme.textMain, fontSize:'0.9rem'}}>{p.data.kwh}</strong> <span style={{fontSize:'0.75rem'}}>kWh</span></div>
                   </div>
                </div>
              ))}
            </div>
          </>
        )}
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
