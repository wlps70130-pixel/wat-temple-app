import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const BUILDINGS = [
  { id: 'somdej', name: 'ศาลาสมเด็จฯ', deviceId: 'a3415610e1bc4a9df14lsa' },
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

export default function EnergyDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [buildingData, setBuildingData] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [graphFilter, setGraphFilter] = useState('15min'); // '15min', '30min', '1hour', 'day'
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [rawHistory, setRawHistory] = useState([]);
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
          // กรองสัญญาณ sensor ผิดปกติ (Tuya บางครั้งส่ง -6600 หมายถึง offline)
          if (kw < -500 || kw > 1000) kw = 0;
          
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

  const historicalData = useMemo(() => {
    if (!rawHistory.length) return [];

    const grouped = {};
    rawHistory.forEach(item => {
      if (!item.timestamp || typeof item.timestamp !== 'string') return;
      
      let datePart = "";
      let hourPart = "";
      let minPart = 0;

      if (item.timestamp.includes('T')) {
        const match = item.timestamp.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):/);
        if (match) {
          datePart = `${match[3]}/${match[2]}`;
          hourPart = match[4];
          minPart = parseInt(match[5], 10);
        }
      } else {
        const match = item.timestamp.match(/(\d{2}\/\d{2})\/\d{4} (\d{2}):(\d{2}):/);
        if (match) {
          datePart = match[1];
          hourPart = match[2];
          minPart = parseInt(match[3], 10);
        }
      }

      if (!datePart || !hourPart) return;
      
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
        grouped[fullLabel] = { displayTime: timeLabel, fullTime: fullLabel, buildings: {} };
      }
      
      const bName = item.building;
      if (!grouped[fullLabel].buildings[bName]) {
        grouped[fullLabel].buildings[bName] = { sum: 0, count: 0, isSolar: bName === 'พลังงานโซล่าเซลล์' };
      }
      
      grouped[fullLabel].buildings[bName].sum += parseFloat(item.totalKw || 0);
      grouped[fullLabel].buildings[bName].count += 1;
    });

    const chartData = Object.values(grouped).map(g => {
      let valLoad = 0;
      let valSolar = 0;

      if (graphFilter === 'day') {
        // For daily filter, show total energy (kWh)
        // Energy = sum of (power * 0.25) across all readings
        Object.values(g.buildings).forEach(b => {
          if (b.isSolar) valSolar += b.sum * 0.25;
          else valLoad += b.sum * 0.25;
        });
      } else {
        // For other filters, show average power (kW)
        // Average power = Sum of average power of each building
        Object.values(g.buildings).forEach(b => {
          const avgPower = b.count > 0 ? (b.sum / b.count) : 0;
          if (b.isSolar) valSolar += avgPower;
          else valLoad += avgPower;
        });
      }
      
      return {
        time: g.displayTime,
        fullTime: g.fullTime,
        totalKw: parseFloat(valLoad.toFixed(2)),
        solarKw: parseFloat(valSolar.toFixed(2))
      };
    });

    let pointsToKeep = 96;
    if (graphFilter === '30min') pointsToKeep = 48;
    if (graphFilter === '1hour') pointsToKeep = 24;
    if (graphFilter === 'day') pointsToKeep = 7;
    
    return chartData.slice(-pointsToKeep);
  }, [rawHistory, graphFilter]);

  const parsedBuildingData = useMemo(() => {
    const result = {};
    BUILDINGS.forEach(b => {
      if (buildingData[b.id]?.raw) {
        result[b.id] = parseData(buildingData[b.id].raw);
      } else {
        result[b.id] = parseData(null);
      }
    });
    return result;
  }, [buildingData]);

  const fetchRealData = async (bldgId, deviceId, type, retry = 3) => {
    if (!deviceId) return;
    
    const url = type === 'shelly' ? `/api/shelly?deviceId=${deviceId}` : `/api/tuya?deviceId=${deviceId}`;
    
    for (let i = 0; i < retry; i++) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const apiData = await response.json();
        
        setBuildingData(prev => ({
          ...prev,
          [bldgId]: {
            raw: apiData.success ? apiData.result : null,
            error: apiData.success ? null : (apiData.error || "Unknown API Error"),
            lastUpdate: new Date()
          }
        }));
        return; // Success, exit retry loop
      } catch (error) {
        if (i === retry - 1) {
          // All retries failed
          setBuildingData(prev => ({
            ...prev,
            [bldgId]: { raw: null, error: error.message, lastAttempt: new Date() }
          }));
        }
        // Exponential backoff wait before next retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  useEffect(() => {
    const fetchAll = () => {
      BUILDINGS.filter(b => b.deviceId).forEach(b => fetchRealData(b.id, b.deviceId, b.type));
    };
    
    fetchAll(); // Fetch immediately on mount
    const interval = setInterval(fetchAll, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

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

    const isDaily = filter === 'day';
    const unit = isDaily ? 'kWh' : 'kW';
    const nameTotal = isDaily ? 'พลังงานใช้จริงรวม (kWh)' : 'กำลังไฟใช้จริงรวม (kW)';
    const nameSolar = isDaily ? 'พลังงานโซล่าเซลล์ (kWh)' : 'โซล่าเซลล์ผลิตได้ (kW)';

    return (
      <div style={{ width: '100%', height: 250, marginTop: '1.5rem', marginLeft: '-15px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
            <XAxis dataKey="time" stroke={theme.textSub} fontSize={11} tickMargin={10} minTickGap={30} />
            <YAxis stroke={theme.textSub} fontSize={11} tickFormatter={(val) => `${val}${unit}`} width={50} />
            <Tooltip 
              contentStyle={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textMain, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: theme.primary, fontWeight: 'bold' }}
              labelStyle={{ color: theme.textSub, marginBottom: '0.25rem', fontSize: '0.85rem' }}
              cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
            />
            <Bar 
              dataKey="totalKw" 
              name={nameTotal} 
              fill={theme.primary} 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar 
              dataKey="solarKw" 
              name={nameSolar} 
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
      if (b.deviceId) {
        const pd = parsedBuildingData[b.id];
        if (pd?.isOnline) {
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

    // PEA TOU Rates (Type 6.2 - Non-profit, Low Voltage) อัปเดต 2568
    const PEA_RATES = {
      onPeak: 4.3888,   // บาท/หน่วย
      offPeak: 2.6468,  // บาท/หน่วย
      ft: 0.3972,       // ค่า Ft
      service: 312.24,  // ค่าบริการรายเดือน
      vat: 0.07
    };

    // วันหยุดราชการไทยปี ค.ศ. 2026 (พ.ศ. 2569) - Off-Peak ทั้งวัน
    const THAI_HOLIDAYS_2568 = new Set([
      // ปี ค.ศ. 2026 (พ.ศ. 2569)
      '2026-01-01', // วันขึ้นปีใหม่
      '2026-02-02', // วันมาฆบูชา
      '2026-04-06', // วันจักรี
      '2026-04-13', // วันสงกรานต์
      '2026-04-14', // วันสงกรานต์
      '2026-04-15', // วันสงกรานต์
      '2026-05-01', // วันแรงงานแห่งชาติ
      '2026-05-11', // วันพืชมงคล
      '2026-05-12', // วันวิสาขบูชา
      '2026-06-03', // วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี
      '2026-07-28', // วันเฉลิมพระชนมพรรษา ร.10
      '2026-07-29', // ชดเชยหรือวันหยุดพิเศษ
      '2026-08-12', // วันแม่แห่งชาติ
      '2026-10-13', // วันคล้ายวันสวรรคต ร.9
      '2026-10-23', // วันปิยมหาราช
      '2026-12-05', // วันพ่อแห่งชาติ
      '2026-12-10', // วันรัฐธรรมนูญ
      '2026-12-31', // วันสิ้นปี
    ]);

    // ฟังก์ชัน TOU ที่ถูกต้อง - ใช้เวลาท้องถิ่นไทย (ไม่ใช้ UTC)
    const getTouStatus = (date) => {
      // สร้าง YYYY-MM-DD จากเวลาท้องถิ่น (ไม่ใช้ toISOString ซึ่งเป็น UTC)
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const day = date.getDay(); // 0=อาทิตย์, 6=เสาร์
      const totalMins = date.getHours() * 60 + date.getMinutes();
      const isWeekday = day >= 1 && day <= 5;
      const isHoliday = THAI_HOLIDAYS_2568.has(dateStr);
      const isPeakHour = totalMins >= 9 * 60 && totalMins < 22 * 60;
      return (isWeekday && !isHoliday && isPeakHour) ? 'ON_PEAK' : 'OFF_PEAK';
    };

    const touStatus = getTouStatus(currentTime);

    // คำนวณ kWh รายเดือน: parse timestamp ทั้ง ISO และ DD/MM/YYYY format
    const currentMonthNum = currentTime.getMonth() + 1;
    const currentYearNum = currentTime.getFullYear();
    let monthlyOnPeakKwh = 0;
    let monthlyOffPeakKwh = 0;
    const INTERVAL_HOURS = 0.25; // บันทึกทุก 15 นาที

    rawHistory.forEach(r => {
      if (!r.timestamp) return;
      // กรองโซล่าเซลล์และข้อมูลที่ไม่ใช่อาคาร
      const bldg = String(r.building || '').trim();
      if (bldg === 'พลังงานโซล่าเซลล์' || bldg === '') return;

      let tsMonth = 0, tsYear = 0;
      const ts = String(r.timestamp).trim();
      if (ts.includes('T')) {
        tsYear = parseInt(ts.slice(0, 4), 10);
        tsMonth = parseInt(ts.slice(5, 7), 10);
      } else if (ts.includes('/')) {
        const parts = ts.split(' ')[0].split('/');
        // รูปแบบ DD/MM/YYYY
        if (parts.length === 3) { tsMonth = parseInt(parts[1], 10); tsYear = parseInt(parts[2], 10); }
      }

      // currentYearNum คือปี ค.ศ. เช่น 2026 ซึ่งตรงกับข้อมูลใน Google Sheets
      if (tsYear !== currentYearNum || tsMonth !== currentMonthNum) return;

      const kwh = parseFloat(r.totalKw || 0) * INTERVAL_HOURS;
      if (kwh <= 0) return;

      const tou = String(r.touStatus || '').trim().toUpperCase();
      if (tou === 'ON_PEAK') monthlyOnPeakKwh += kwh;
      else if (tou === 'OFF_PEAK') monthlyOffPeakKwh += kwh;
    });

    // Fallback: ถ้ายังไม่มีข้อมูล ประมาณจาก kW ปัจจุบัน
    const isEstimated = monthlyOnPeakKwh + monthlyOffPeakKwh === 0;
    if (isEstimated && globalKw > 0) {
      const daysElapsed = Math.max(currentTime.getDate(), 1);
      const estimatedKwh = globalKw * 13 * daysElapsed;
      monthlyOnPeakKwh = estimatedKwh * 0.55;
      monthlyOffPeakKwh = estimatedKwh * 0.45;
    }

    const totalMonthlyKwh = monthlyOnPeakKwh + monthlyOffPeakKwh;
    const onPeakCost = monthlyOnPeakKwh * PEA_RATES.onPeak;
    const offPeakCost = monthlyOffPeakKwh * PEA_RATES.offPeak;
    const ftCost = totalMonthlyKwh * PEA_RATES.ft;
    const totalBeforeVat = onPeakCost + offPeakCost + ftCost + (totalMonthlyKwh > 0 ? PEA_RATES.service : 0);
    const vatAmount = totalBeforeVat * PEA_RATES.vat;
    const totalCost = totalBeforeVat + vatAmount;

    const activeDevicesCount = BUILDINGS.filter(b => b.deviceId && parsedBuildingData[b.id]?.isOnline).length;
    const totalDevicesCount = BUILDINGS.filter(b => b.deviceId).length;
    const allOnline = activeDevicesCount > 0 && activeDevicesCount === totalDevicesCount;

    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const currentMonth = months[currentTime.getMonth()];
    const currentYear = currentTime.getFullYear() + 543;

    const totalPower = (solarKw + globalKw) || 1;
    const prodPercent = Math.min((solarKw / totalPower) * 100, 100);
    const netGrid = globalKw - solarKw;

    const aiContextData = [
      `📊 ข้อมูลพลังงาน ณ ปัจจุบัน:`,
      `- โซล่าเซลล์ผลิตได้: ${solarKw.toFixed(2)} kW`,
      `- โหลดรวม: ${globalKw.toFixed(2)} kW`,
      `- พึ่งพาพลังงานทดแทน: ${prodPercent.toFixed(1)}%`,
      `- ไฟสุทธิ: ${netGrid > 0 ? '+' : ''}${netGrid.toFixed(2)} kW (${netGrid > 0 ? 'ดึงจาก PEA' : 'ส่งออกไป PEA'})`,
      `- TOU: ${touStatus === 'ON_PEAK' ? '🔴 On-Peak (4.39 บาท/หน่วย)' : '🟢 Off-Peak (2.65 บาท/หน่วย)'}`,
      `- ค่าไฟเดือน${currentMonth}: ${totalCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })} บาท (${isEstimated ? 'ประมาณ' : 'จากข้อมูลจริง'})`,
    ].join('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fade-in 0.4s ease-out' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          {/* Top Title Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>
              <span style={{ color: '#84cc16', fontSize: '1.2rem' }}>⚡</span> พลังงานอัจฉริยะ
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'transparent', border: 'none', color: theme.textSub, cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>
              ⚙️
            </button>
          </div>
          
          {/* Sub Title */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: theme.textMain, letterSpacing: '-0.5px' }}>วิเคราะห์ค่าไฟ (TOU)</h1>
            <div style={{ fontSize: '0.85rem', color: theme.textSub, marginTop: '0.2rem' }}>ประจำเดือน {currentMonth} {currentYear}</div>
          </div>
        </div>

        {/* Main TOU Dark Card */}
        <div style={{ background: '#2a303c', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>ค่าไฟโดยประมาณ (TOU)</div>
            <div style={{ background: '#a3e635', color: '#166534', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>📉 -12%</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>฿{Math.floor(totalCost).toLocaleString('th-TH')}</span>
            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginLeft: '2px' }}>.{(totalCost % 1).toFixed(2).substring(2)}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* On-Peak Box */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <span style={{color: '#fcd34d'}}>☀️</span> On-Peak
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.2rem' }}>฿{Math.floor(onPeakCost).toLocaleString('th-TH')}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{monthlyOnPeakKwh.toFixed(0)} kWh</div>
            </div>
            
            {/* Off-Peak Box */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <span style={{color: '#cbd5e1'}}>🌙</span> Off-Peak
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.2rem' }}>฿{Math.floor(offPeakCost).toLocaleString('th-TH')}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{monthlyOffPeakKwh.toFixed(0)} kWh</div>
            </div>
          </div>
        </div>

        {/* Savings Card (White) */}
        {(() => {
           const normalRate = 4.72; // Flat rate estimate
           const normalCostBeforeVat = totalMonthlyKwh * normalRate + PEA_RATES.service + ftCost;
           const normalCost = normalCostBeforeVat * (1 + PEA_RATES.vat);
           const savings = Math.max(0, normalCost - totalCost);
           
           return (
              <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '800', color: theme.textMain }}>สรุปการประหยัด (เทียบอัตราปกติ)</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#84cc16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 4px 10px rgba(132,204,22,0.3)', flexShrink: 0 }}>
                     🐷
                   </div>
                   <div style={{ minWidth: 0 }}>
                     <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4d7c0f', lineHeight: 1 }}>฿{Math.floor(savings).toLocaleString('th-TH')}</div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSub, marginTop: '0.25rem' }}>ประหยัดไปได้ในเดือนนี้</div>
                   </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '0.75rem' }}>
                     <span style={{ fontSize: '0.85rem', color: theme.textSub }}>อัตราปกติ (ถ้าไม่ใช้ TOU)</span>
                     <span style={{ fontSize: '0.9rem', fontWeight: '700', color: theme.textMain }}>฿{Math.floor(normalCost).toLocaleString('th-TH')}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.85rem', color: theme.textSub }}>อัตรา TOU ปัจจุบัน</span>
                     <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#65a30d' }}>฿{Math.floor(totalCost).toLocaleString('th-TH')}</span>
                   </div>
                </div>
              </div>
           );
        })()}

        {/* Hourly Chart Card */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: theme.textMain }}>ปริมาณการใช้ไฟรายชั่วโมง</h3>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: theme.textSub }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fde047' }}></div>On-Peak</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3e635' }}></div>Off-Peak</div>
              </div>
           </div>
           <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3px', paddingBottom: '0.5rem', borderBottom: `1px solid ${theme.border}` }}>
              {[10,12,15,18,14,12,15,20,25,55,65,72,80,85,78,70,65,60,55,50,35,25,18,12].map((h, i) => {
                 const isPeak = i >= 9 && i <= 21;
                 return <div key={i} style={{ flex: 1, background: isPeak ? '#fde047' : '#a3e635', height: `${h}%`, borderRadius: '2px 2px 0 0', transition: 'height 0.3s' }}></div>;
              })}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: theme.textSub }}>
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
           </div>
        </div>


        {/* Energy Distribution Card */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '800', color: theme.textMain }}>การกระจายพลังงาน</h3>
           <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderRight: `1px solid ${theme.border}` }}>
                 <div style={{ fontSize: '0.8rem', color: '#65a30d', fontWeight: '700' }}>🌱 พลังงานทดแทน</div>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.textMain }}>{solarKw.toFixed(1)}</span>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>kW</span>
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#65a30d', fontWeight: '700' }}>▲ {prodPercent.toFixed(0)}%</div>
              </div>
              <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                 <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '700' }}>⚡ PEA Grid</div>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.textMain }}>{globalKw.toFixed(1)}</span>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>kW</span>
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700' }}>▼ {(100-prodPercent).toFixed(0)}%</div>
              </div>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: `1px solid ${theme.border}`, fontSize: '0.85rem' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                 <div style={{ fontSize: '1.2rem', color: prodPercent >= 50 ? '#65a30d' : theme.danger, fontWeight: '800' }}>{prodPercent.toFixed(1)}%</div>
                 <div style={{ fontSize: '0.7rem', color: theme.textSub, marginTop: '0.15rem' }}>พึ่งพาทดแทน</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                 <div style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '12px', border: `1px solid ${touStatus === 'ON_PEAK' ? theme.danger : theme.success}`, color: touStatus === 'ON_PEAK' ? theme.danger : theme.success, display: 'inline-block' }}>{touStatus === 'ON_PEAK' ? 'On-Peak' : 'Off-Peak'}</div>
                 <div style={{ fontSize: '0.7rem', color: theme.textSub, marginTop: '0.15rem' }}>ช่วงเวลา</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                 <div style={{ fontSize: '1.2rem', color: netGrid <= 0 ? '#65a30d' : theme.danger, fontWeight: '800' }}>{netGrid > 0 ? '+' : ''}{netGrid.toFixed(1)} kW</div>
                 <div style={{ fontSize: '0.7rem', color: theme.textSub, marginTop: '0.15rem' }}>{netGrid > 0 ? 'ดึงจาก PEA' : 'ส่งออก PEA'}</div>
              </div>
           </div>
        </div>

        <AiAssistant 
          mode="energy"
          contextData={aiContextData}
          title="AI Energy Analyst"
          subtitle="ขับเคลื่อนโดย Gemini (Google AI)"
          icon="⚡"
          themeColor={isDarkMode ? '#6366f1' : '#22c55e'}
          isDarkMode={isDarkMode}
        />

        {/* Graph Section */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
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

        {/* Load Profile Data Table (PEA AMR Standard) */}
        <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain, fontWeight: '700' }}>ตารางข้อมูลสถิติไฟฟ้า (PEA Load Profile)</h3>
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: isDarkMode ? '#334155' : '#e2e8f0', color: theme.textSub, fontWeight: 'bold' }}>AMR Standard</span>
          </div>
          
          <div style={{ overflowX: 'auto', maxHeight: '350px', overflowY: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: isDarkMode ? '#1e293b' : '#f8fafc', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <tr style={{ color: theme.textSub, textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: `2px solid ${theme.border}` }}>วัน-เวลา</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: `2px solid ${theme.border}` }}>Demand (kW)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: `2px solid ${theme.border}` }}>Energy (kWh)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: `2px solid ${theme.border}` }}>Solar (kWh)</th>
                  {graphFilter !== 'day' && <th style={{ padding: '0.75rem 1rem', textAlign: 'center', borderBottom: `2px solid ${theme.border}` }}>TOU (Est.)</th>}
                </tr>
              </thead>
              <tbody>
                {[...historicalData].reverse().map((row, idx) => {
                  let kwh = 0;
                  let kw = 0;
                  let solarKwh = 0;
                  
                  if (graphFilter === 'day') {
                    kwh = row.totalKw;
                    kw = "-"; 
                    solarKwh = row.solarKw;
                  } else {
                    kw = row.totalKw;
                    const multiplier = graphFilter === '15min' ? 0.25 : graphFilter === '30min' ? 0.5 : 1;
                    kwh = parseFloat((row.totalKw * multiplier).toFixed(2));
                    solarKwh = parseFloat((row.solarKw * multiplier).toFixed(2));
                  }

                  let touBadge = null;
                  if (graphFilter !== 'day') {
                    const timeMatch = row.fullTime.match(/(\d{2}):/);
                    const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
                    const isPeakHour = hour >= 9 && hour < 22;
                    touBadge = isPeakHour ? 
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>On-Peak</span> : 
                      <span style={{ background: '#bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>Off-Peak</span>;
                  }

                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}`, background: idx % 2 === 0 ? 'transparent' : (isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)') }}>
                      <td style={{ padding: '0.75rem 1rem', color: theme.textMain, fontWeight: '600', whiteSpace: 'nowrap' }}>{row.fullTime}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.textSub, fontWeight: '500' }}>{kw}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.primary, fontWeight: '700' }}>{kwh}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f59e0b', fontWeight: '600' }}>{solarKwh}</td>
                      {graphFilter !== 'day' && <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{touBadge}</td>}
                    </tr>
                  );
                })}
                {historicalData.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: theme.textSub }}>กำลังโหลดข้อมูล...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* List of Panels */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: theme.textMain, fontWeight: '800' }}>รายการอาคาร</h3>
            <span style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: '500' }}>ทั้งหมด {BUILDINGS.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.keys(buildingData).length === 0 ? (
              // Skeleton Loaders
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.1rem 1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isDarkMode ? '#1e293b' : '#e2e8f0', animation: 'pulse-dot 1.5s infinite' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '16px', background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', width: '60%', marginBottom: '8px', animation: 'pulse-dot 1.5s infinite' }}></div>
                    <div style={{ height: '12px', background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: '4px', width: '40%', animation: 'pulse-dot 1.5s infinite' }}></div>
                  </div>
                </div>
              ))
            ) : (
            BUILDINGS.map(b => {
              const hasDevice = !!b.deviceId;
              const data = buildingData[b.id];
              const parsed = parsedBuildingData[b.id] || parseData(null);
              const isSolar = b.isSolar;
              
              let statusText = 'Pending';
              let statusColor = theme.warning;
              if (hasDevice) {
                statusText = parsed.isOnline ? 'Active' : 'Offline';
                statusColor = parsed.isOnline ? theme.success : theme.danger;
              }
              
              return (
                <div key={b.id} onClick={() => setActiveTab(b.id)} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1.1rem 1.25rem', cursor: 'pointer', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.1s' }}>
                  
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
            })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    const bldg = BUILDINGS.find(b => b.id === activeTab);
    const parsed = parsedBuildingData[bldg.id] || parseData(null);
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
            {/* Overview Stats (Thai) */}
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.2rem', color: theme.textMain, fontWeight: '800', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📊</span> ภาพรวมทางไฟฟ้า
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
                    <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: '700' }}>กำลังไฟรวม</div>
                 </div>
                 <div style={{ fontSize: '2.2rem', fontWeight: '800', color: theme.primary, lineHeight: '1.1' }}>{parsed.totalKw} <span style={{fontSize:'1rem', color:theme.textSub, fontWeight:'600'}}>kW</span></div>
               </div>
               
               <div style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '24px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🔋</div>
                    <div style={{ fontSize: '0.9rem', color: theme.textSub, fontWeight: '700' }}>หน่วยสะสม</div>
                 </div>
                 <div style={{ fontSize: '2.2rem', fontWeight: '800', color: theme.success, lineHeight: '1.1' }}>{parsed.totalKwh} <span style={{fontSize:'1rem', color:theme.textSub, fontWeight:'600'}}>kWh</span></div>
               </div>
            </div>

            {/* Environmental / Extra */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
               <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: '700', marginBottom: '0.25rem' }}>🔄 รีแอกทีฟรวม</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.warning }}>{parsed.totalKvar} <span style={{fontSize:'0.7rem', color:theme.textSub}}>kVar</span></span>
               </div>
               <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: '700', marginBottom: '0.25rem' }}>📈 ความถี่</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>{parsed.frequency} <span style={{fontSize:'0.7rem', color:theme.textSub}}>Hz</span></span>
               </div>
               <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: '700', marginBottom: '0.25rem' }}>🌡️ อุณหภูมิ</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>{parsed.temperature} <span style={{fontSize:'0.7rem', color:theme.textSub}}>°C</span></span>
               </div>
            </div>

            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', color: theme.textMain, fontWeight: '800', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span> สถานะแยกเฟส (L1, L2, L3)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { id: 'A', name: 'Phase A', label: 'L1', data: parsed.phases.A, color: '#ef4444', icon: '🔴' },
                { id: 'B', name: 'Phase B', label: 'L2', data: parsed.phases.B, color: '#f59e0b', icon: '🟡' },
                { id: 'C', name: 'Phase C', label: 'L3', data: parsed.phases.C, color: '#3b82f6', icon: '🔵' }
              ].map(p => (
                <div key={p.id} style={{ background: theme.cardBg, borderRadius: '24px', padding: '1.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, position: 'relative', overflow: 'hidden' }}>
                   {/* Background subtle color hint */}
                   <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`, opacity: isDarkMode ? 0.15 : 0.05, transform: 'translate(30%, -30%)' }}></div>
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                       <strong style={{ color: theme.textMain, fontSize: '1.2rem', fontWeight: '800' }}>{p.name}</strong>
                     </div>
                     <div style={{ fontSize: '0.85rem', color: p.color, fontWeight: '800', background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '0.3rem 0.8rem', borderRadius: '10px' }}>{p.label}</div>
                   </div>

                   <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 1, width: '100%' }}>
                     <div style={{ flex: 1, minWidth: 0, background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '16px', boxSizing: 'border-box' }}>
                       <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', color: theme.textSub, fontWeight: '600' }}>Voltage</div>
                       <div style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', fontWeight: '800', color: theme.textMain, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.data.v}<span style={{fontSize:'0.75rem', fontWeight:'600', marginLeft:'2px', color:theme.textSub}}>V</span></div>
                     </div>
                     <div style={{ flex: 1, minWidth: 0, background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '16px', boxSizing: 'border-box' }}>
                       <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', color: theme.textSub, fontWeight: '600' }}>Current</div>
                       <div style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', fontWeight: '800', color: theme.textMain, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.data.a}<span style={{fontSize:'0.75rem', fontWeight:'600', marginLeft:'2px', color:theme.textSub}}>A</span></div>
                     </div>
                     <div style={{ flex: 1, minWidth: 0, background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '16px', border: `1px solid ${p.color}40`, boxSizing: 'border-box' }}>
                       <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', color: theme.textSub, fontWeight: '600' }}>Power</div>
                       <div style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', fontWeight: '800', color: p.color, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.data.kw}<span style={{fontSize:'0.75rem', fontWeight:'600', marginLeft:'2px'}}>kW</span></div>
                     </div>
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px dashed ${theme.border}`, fontSize: '0.85rem', color: theme.textSub, position: 'relative', zIndex: 1, fontWeight: '500' }}>
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
