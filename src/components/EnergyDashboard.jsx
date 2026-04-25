import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

// --- DATA ---
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

const getEquipmentsForBuilding = (bId, isOnline, hasDevice) => {
  if (!hasDevice) {
    return [
      { id: 'm1', name: 'มิเตอร์ไฟฟ้า 1', power: '0.00', kwh: '--', status: 'Pending', type: 'meter' },
      { id: 'm2', name: 'มิเตอร์ไฟฟ้า 2', power: '0.00', kwh: '--', status: 'Pending', type: 'meter' },
      { id: 'm3', name: 'มิเตอร์ไฟฟ้า 3', power: '0.00', kwh: '--', status: 'Pending', type: 'meter' }
    ];
  }
  if (bId === 'solar') {
    return [
      { id: 's1', name: 'ระบบโซล่าเซลล์ (Inverter 1)', power: '1.20', kwh: '45.00', status: isOnline ? 'Active' : 'Offline', type: 'solar' }
    ];
  }
  return [
    { id: 'e1', name: 'ระบบไฟฟ้า', power: '0.945', kwh: '2300.76', status: isOnline ? 'Active' : 'Offline', type: 'electric' },
    { id: 'e2', name: 'ระบบปรับอากาศ', power: '11.221', kwh: '603.26', status: isOnline ? 'Active' : 'Offline', type: 'ac' },
    { id: 'e3', name: 'ระบบโซล่าเซลล์', power: '0.000', kwh: '0.00', status: isOnline ? 'Active' : 'Offline', type: 'solar' }
  ];
};

const parseData = (raw) => {
  const defaultPhase = { v: '0.0', a: '0.0', kw: '0.00', pf: '0.00', kvar: '0.00', kwh: '0.00' };
  const parsed = {
    isOnline: false, totalKw: '0.00', totalKwh: '0.00', totalKvar: '0.00', frequency: '0', temperature: '0.0',
    phases: { A: { ...defaultPhase }, B: { ...defaultPhase }, C: { ...defaultPhase } }
  };
  if (!raw) return parsed;
  parsed.isOnline = true;
  const statusArray = raw.status || [];
  if (statusArray.length === 0) { parsed.isOnline = false; return parsed; }

  const findCode = (prefix) => {
    const item = statusArray.find(s => String(s.code).toLowerCase() === prefix);
    if (item && item.value !== undefined) {
      const val = Number(item.value); return isNaN(val) ? 0 : val;
    }
    return 0;
  };

  parsed.phases.A.v = (findCode('voltagea') / 10).toFixed(1); parsed.phases.A.a = (findCode('currenta') / 1000).toFixed(2); parsed.phases.A.kw = (findCode('activepowera') / 1000).toFixed(3); parsed.phases.A.pf = (findCode('powerfactora') / 100).toFixed(2); parsed.phases.A.kvar = (findCode('reactivepowera') / 1000).toFixed(3); parsed.phases.A.kwh = (findCode('energyconsumeda') / 100).toFixed(2);
  parsed.phases.B.v = (findCode('voltageb') / 10).toFixed(1); parsed.phases.B.a = (findCode('currentb') / 1000).toFixed(2); parsed.phases.B.kw = (findCode('activepowerb') / 1000).toFixed(3); parsed.phases.B.pf = (findCode('powerfactorb') / 100).toFixed(2); parsed.phases.B.kvar = (findCode('reactivepowerb') / 1000).toFixed(3); parsed.phases.B.kwh = (findCode('energyconsumedb') / 100).toFixed(2);
  parsed.phases.C.v = (findCode('voltagec') / 10).toFixed(1); parsed.phases.C.a = (findCode('currentc') / 1000).toFixed(2); parsed.phases.C.kw = (findCode('activepowerc') / 1000).toFixed(3); parsed.phases.C.pf = (findCode('powerfactorc') / 100).toFixed(2); parsed.phases.C.kvar = (findCode('reactivepowerc') / 1000).toFixed(3); parsed.phases.C.kwh = (findCode('energyconsumedc') / 100).toFixed(2);
  parsed.totalKw = (findCode('activepower') / 1000).toFixed(3); parsed.totalKwh = (findCode('totalenergyconsumed') / 100).toFixed(2); parsed.totalKvar = (findCode('reactivepower') / 1000).toFixed(3); parsed.frequency = findCode('frequency'); parsed.temperature = (findCode('temperature') / 10).toFixed(1);
  return parsed;
};

// --- ICONS ---
const Icons = {
  Home: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#1d4ed8" : "none"} stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Buildings: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "rgba(29, 78, 216, 0.1)" : "none"} stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>,
  Reports: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "rgba(29, 78, 216, 0.1)" : "none"} stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Bell: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "rgba(29, 78, 216, 0.1)" : "none"} stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Settings: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "rgba(29, 78, 216, 0.1)" : "none"} stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Back: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Electric: () => <span style={{fontSize:'1.5rem'}}>🔌</span>,
  AC: () => <span style={{fontSize:'1.5rem'}}>❄️</span>,
  Solar: () => <span style={{fontSize:'1.5rem'}}>☀️</span>,
  Meter: () => <span style={{fontSize:'1.5rem'}}>🎛️</span>
};

// --- COMPONENT ---
export default function EnergyDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingTab, setBuildingTab] = useState('overview'); // overview, energy, equipment, profile
  const [bSearch, setBSearch] = useState('');
  const [bFilter, setBFilter] = useState('all'); // all, active, pending
  const [reportTab, setReportTab] = useState('usage'); // overview, usage, cost, compare
  const [reportFilter, setReportFilter] = useState('day'); // day, month, year
  const [graphUnit, setGraphUnit] = useState('kW'); // kW, kWh
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Data States
  const [buildingData, setBuildingData] = useState({});
  const [rawHistory, setRawHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const HISTORY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNzQ7frtMJMwnqyXuqMjU_Jx59iApoXM0KYwfsfqIh6Q_wCKF6lCV3q0qov-dpzxJLabPdZFk31gyi/pub?output=csv";

  const theme = {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    textMain: '#0f172a',
    textSub: '#64748b',
    border: '#e2e8f0',
    primary: '#1d4ed8', // Dark Blue
    primaryLight: '#eff6ff',
    success: '#10b981', // Green
    warning: '#f59e0b', // Golden Yellow
    danger: '#ef4444',
    shadow: '0 4px 20px rgba(0,0,0,0.04)',
    shadowLg: '0 10px 25px rgba(0,0,0,0.08)'
  };

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
          let kwh = parseFloat(row['หน่วยไฟสะสมรวม (kWh)'] || 0);
          if (kw < -500 || kw > 1000) kw = 0;
          return { timestamp: row['วัน-เวลา'], building: row['อาคาร'], totalKw: kw, totalKwh: kwh, touStatus: row['ช่วงเวลา (TOU)'] };
        }).filter(r => r.timestamp);
        setRawHistory(parsedData);
      } catch (e) {
        console.error("Fetch history error", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const fetchRealData = async (bldgId, deviceId, type, retry = 3) => {
    if (!deviceId) return;
    const url = type === 'shelly' ? `/api/shelly?deviceId=${deviceId}` : `/api/tuya?deviceId=${deviceId}`;
    for (let i = 0; i < retry; i++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const apiData = await response.json();
        setBuildingData(prev => ({ ...prev, [bldgId]: { raw: apiData.success ? apiData.result : null, error: apiData.success ? null : apiData.error, lastUpdate: new Date() } }));
        return;
      } catch (error) {
        if (i === retry - 1) setBuildingData(prev => ({ ...prev, [bldgId]: { raw: null, error: error.message, lastAttempt: new Date() } }));
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  useEffect(() => {
    const fetchAll = () => { BUILDINGS.filter(b => b.deviceId).forEach(b => fetchRealData(b.id, b.deviceId, b.type)); };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const parsedBuildingData = useMemo(() => {
    const result = {};
    BUILDINGS.forEach(b => {
      if (buildingData[b.id]?.raw) { result[b.id] = parseData(buildingData[b.id].raw); }
      else { result[b.id] = parseData(null); }
    });
    return result;
  }, [buildingData]);

  // Generate Graph Data
  const graphData = useMemo(() => {
      const data = [];
      if (rawHistory.length === 0) return data;

      let sourceData = rawHistory;
      if (currentTab === 'buildings' && selectedBuilding) {
        sourceData = rawHistory.filter(r => r.building === selectedBuilding.name);
      } else {
        sourceData = rawHistory.filter(r => r.building !== 'พลังงานโซล่าเซลล์');
      }

      // Calculate precise kWh delta for each record per building
      const dataWithDelta = [];
      const bGroups = {};
      sourceData.forEach(r => {
        if (!bGroups[r.building]) bGroups[r.building] = [];
        bGroups[r.building].push(r);
      });
      Object.keys(bGroups).forEach(b => {
        const sorted = bGroups[b].sort((a,b) => new Date(a.timestamp.split(' ')[0].split('/').reverse().join('-') + 'T' + a.timestamp.split(' ')[1]) - new Date(b.timestamp.split(' ')[0].split('/').reverse().join('-') + 'T' + b.timestamp.split(' ')[1]));
        sorted.forEach((r, i) => {
          let delta = 0;
          if (i > 0) {
            const diff = r.totalKwh - sorted[i-1].totalKwh;
            if (diff > 0 && diff < 500) delta = diff;
          }
          dataWithDelta.push({ ...r, kwhDelta: delta });
        });
      });
      sourceData = dataWithDelta;

      if (reportFilter === 'day') {
          const [y,m,d] = selectedDate.split('-');
          const targetDateStr = `${d}/${m}/${y}`;
          const dayData = sourceData.filter(r => r.timestamp.startsWith(targetDateStr));
          const buckets = { '00:00':[], '04:00':[], '08:00':[], '12:00':[], '16:00':[], '20:00':[] };
          
          dayData.forEach(r => {
             const timeStr = r.timestamp.split(' ')[1];
             if (!timeStr) return;
             const hour = parseInt(timeStr.split(':')[0]);
             const bucket = Math.floor(hour / 4) * 4;
             const bStr = bucket.toString().padStart(2, '0') + ':00';
             if (buckets[bStr]) buckets[bStr].push(r);
          });

          Object.keys(buckets).forEach(b => {
             let avgKw = 0; let sumKwh = 0;
             if (buckets[b].length > 0) {
                 avgKw = buckets[b].reduce((sum, r) => sum + r.totalKw, 0) / buckets[b].length;
                 sumKwh = buckets[b].reduce((sum, r) => sum + r.kwhDelta, 0); 
             }
             data.push({ time: b, kw: avgKw, kwh: sumKwh });
          });
      } else if (reportFilter === 'month') {
          const [y,m] = selectedMonth.split('-');
          const targetMonthStr = `/${m}/${y}`;
          const monthData = sourceData.filter(r => r.timestamp.includes(targetMonthStr));
          const buckets = { 'สัปดาห์ 1':[], 'สัปดาห์ 2':[], 'สัปดาห์ 3':[], 'สัปดาห์ 4':[] };
          monthData.forEach(r => {
             const d = parseInt(r.timestamp.split('/')[0]);
             let b = 'สัปดาห์ 4';
             if (d <= 7) b = 'สัปดาห์ 1';
             else if (d <= 14) b = 'สัปดาห์ 2';
             else if (d <= 21) b = 'สัปดาห์ 3';
             buckets[b].push(r);
          });
          Object.keys(buckets).forEach(b => {
             let avgKw = 0; let sumKwh = 0;
             if (buckets[b].length > 0) {
                 avgKw = buckets[b].reduce((sum, r) => sum + r.totalKw, 0) / buckets[b].length;
                 sumKwh = buckets[b].reduce((sum, r) => sum + r.kwhDelta, 0); 
             }
             data.push({ time: b, kw: avgKw, kwh: sumKwh });
          });
      } else {
         const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
         labels.forEach((l, i) => {
             const mStr = (i+1).toString().padStart(2, '0');
             const targetStr = `/${mStr}/${selectedYear}`;
             const monthData = sourceData.filter(r => r.timestamp.includes(targetStr));
             let avgKw = 0; let sumKwh = 0;
             if (monthData.length > 0) {
                 avgKw = monthData.reduce((sum, r) => sum + r.totalKw, 0) / monthData.length;
                 sumKwh = monthData.reduce((sum, r) => sum + r.kwhDelta, 0); 
             }
             data.push({ time: l, kw: avgKw, kwh: sumKwh });
         });
      }
      return data;
  }, [reportFilter, selectedDate, selectedMonth, selectedYear, currentTab, rawHistory, selectedBuilding]);

  const billingInfo = useMemo(() => {
    let globalKw = 0, globalKwh = 0, solarKw = 0, cost = 0;
    const buildingUsages = [];

    const PEA_RATES = {
      onPeak: 4.3297, offPeak: 2.6369, demand: 210.00, ft: 0.3972, service: 312.24, vat: 0.07, pfPenalty: 56.07
    };

    let actualOnPeakKwh = 0, actualOffPeakKwh = 0, actualMaxDemand = 0;

    if (rawHistory.length > 0) {
      const bMap = {};
      const timeGroups = {};
      
      rawHistory.forEach(r => {
        if (!bMap[r.building]) bMap[r.building] = { data: [] };
        bMap[r.building].data.push(r);
        
        if (!timeGroups[r.timestamp]) timeGroups[r.timestamp] = { kw: 0 };
        if (r.building !== 'พลังงานโซล่าเซลล์') timeGroups[r.timestamp].kw += r.totalKw;
      });

      actualMaxDemand = Math.max(0, ...Object.values(timeGroups).map(t => t.kw));

      Object.keys(bMap).forEach(bName => {
        const bData = bMap[bName].data.sort((a,b) => new Date(a.timestamp.split(' ')[0].split('/').reverse().join('-') + 'T' + a.timestamp.split(' ')[1]) - new Date(b.timestamp.split(' ')[0].split('/').reverse().join('-') + 'T' + b.timestamp.split(' ')[1]));
        
        let bKwh = 0, bOnPeak = 0, bOffPeak = 0;
        for (let i = 1; i < bData.length; i++) {
          const diff = bData[i].totalKwh - bData[i-1].totalKwh;
          if (diff > 0 && diff < 500) {
            bKwh += diff;
            if (bData[i].touStatus === 'ON_PEAK') bOnPeak += diff;
            else bOffPeak += diff;
          }
        }

        if (bName !== 'พลังงานโซล่าเซลล์') {
          globalKwh += bKwh;
          actualOnPeakKwh += bOnPeak;
          actualOffPeakKwh += bOffPeak;
          const bMatch = BUILDINGS.find(b => b.name === bName);
          if (bMatch) {
            buildingUsages.push({ ...bMatch, kw: bData[bData.length-1].totalKw, kwh: bKwh });
          }
        }
      });
    }

    BUILDINGS.forEach(b => {
      if (b.deviceId && parsedBuildingData[b.id]?.isOnline) {
        const kw = parseFloat(parsedBuildingData[b.id].totalKw);
        if (!b.isSolar) { 
          globalKw = Math.max(globalKw, kw); 
          const u = buildingUsages.find(u => u.id === b.id);
          if (!u) buildingUsages.push({ ...b, kw, kwh: 0 });
          else u.kw = kw;
        } else {
          solarKw = kw;
        }
      }
    });

    const monthlyOnPeakKwh = actualOnPeakKwh > 0 ? actualOnPeakKwh : 100;
    const monthlyOffPeakKwh = actualOffPeakKwh > 0 ? actualOffPeakKwh : 80;
    const estimatedKwh = monthlyOnPeakKwh + monthlyOffPeakKwh;
    const estimatedMaxDemand = actualMaxDemand > 0 ? actualMaxDemand : (globalKw > 0 ? Math.max(globalKw * 1.5, 15) : 35); 
    
    // PF Calculation
    const estimatedKvar = estimatedMaxDemand * 0.698; // PF ~0.82 demo
    const currentPf = estimatedMaxDemand / Math.sqrt(Math.pow(estimatedMaxDemand, 2) + Math.pow(estimatedKvar, 2)) || 1;
    const kvarLimit = estimatedMaxDemand * 0.6197; 
    let pfPenaltyCost = 0;
    let excessKvar = 0;
    if (estimatedKvar > kvarLimit) {
      excessKvar = estimatedKvar - kvarLimit;
      pfPenaltyCost = excessKvar * PEA_RATES.pfPenalty;
    }

    const onPeakCost = monthlyOnPeakKwh * PEA_RATES.onPeak;
    const offPeakCost = monthlyOffPeakKwh * PEA_RATES.offPeak;
    const demandCost = estimatedMaxDemand * PEA_RATES.demand;
    const ftCost = estimatedKwh * PEA_RATES.ft;
    const totalBeforeVat = onPeakCost + offPeakCost + demandCost + ftCost + pfPenaltyCost + PEA_RATES.service;
    const vatCost = totalBeforeVat * PEA_RATES.vat;
    cost = totalBeforeVat + vatCost;

    const topBuildings = [...buildingUsages].sort((a, b) => b.kwh - a.kwh).slice(0, 3);
    
    const totalPower = (solarKw + globalKw) || 1;
    const prodPercent = Math.min((solarKw / totalPower) * 100, 100);
    const netGrid = globalKw - solarKw;
    
    const aiContextData = [
      `📊 ข้อมูลพลังงาน ณ ปัจจุบัน:`,
      `- โซล่าเซลล์ผลิตได้: ${solarKw.toFixed(2)} kW`,
      `- โหลดรวม: ${globalKw.toFixed(2)} kW`,
      `- พึ่งพาพลังงานทดแทน: ${prodPercent.toFixed(1)}%`,
      `- ไฟสุทธิ: ${netGrid > 0 ? '+' : ''}${netGrid.toFixed(2)} kW (${netGrid > 0 ? 'ดึงจาก PEA' : 'ส่งออกไป PEA'})`,
      `- ค่าไฟโดยประมาณตามรอบบิลปัจจุบัน: ${cost.toLocaleString('th-TH', { maximumFractionDigits: 0 })} บาท`,
      `- ค่าพาวเวอร์แฟกเตอร์ (PF): ${currentPf.toFixed(2)} (เกินเกณฑ์เสียค่าปรับ ${pfPenaltyCost.toFixed(2)} บาท)`,
      `- อาคารใช้พลังงานสูงสุด 3 อันดับ:`,
      ...topBuildings.map((b, i) => `  ${i+1}. ${b.name} (${b.kwh.toFixed(2)} kWh)`)
    ].join('\n');

    return {
      globalKw, globalKwh, solarKw, cost, topBuildings, aiContextData,
      onPeakCost, offPeakCost, demandCost, ftCost, pfPenaltyCost, totalBeforeVat, vatCost,
      currentPf, excessKvar, estimatedKwh, monthlyOnPeakKwh, monthlyOffPeakKwh, estimatedMaxDemand,
      kvarLimit, estimatedKvar
    };
  }, [parsedBuildingData, rawHistory]);

  const FilterSelector = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <span onClick={() => setReportFilter('day')} style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 12px', background: reportFilter === 'day' ? theme.primary : '#f1f5f9', color: reportFilter === 'day' ? 'white' : theme.textSub, borderRadius: '12px', transition: 'all 0.2s' }}>รายวัน</span>
        <span onClick={() => setReportFilter('month')} style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 12px', background: reportFilter === 'month' ? theme.primary : '#f1f5f9', color: reportFilter === 'month' ? 'white' : theme.textSub, borderRadius: '12px', transition: 'all 0.2s' }}>รายเดือน</span>
        <span onClick={() => setReportFilter('year')} style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '4px 12px', background: reportFilter === 'year' ? theme.primary : '#f1f5f9', color: reportFilter === 'year' ? 'white' : theme.textSub, borderRadius: '12px', transition: 'all 0.2s' }}>รายปี</span>
      </div>
      <div>
        {reportFilter === 'day' && <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '4px 8px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '0.8rem', outline: 'none', background: theme.bg, color: theme.textMain, fontFamily: 'inherit' }} />}
        {reportFilter === 'month' && <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: '4px 8px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '0.8rem', outline: 'none', background: theme.bg, color: theme.textMain, fontFamily: 'inherit' }} />}
        {reportFilter === 'year' && (
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ padding: '4px 8px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '0.8rem', outline: 'none', background: theme.bg, color: theme.textMain, fontFamily: 'inherit' }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>ปี {y}</option>;
            })}
          </select>
        )}
      </div>
    </div>
  );

  const renderNav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0 1rem 0', zIndex: 100, boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' }}>
      {[
        { id: 'dashboard', name: 'หน้าหลัก', Icon: Icons.Home },
        { id: 'buildings', name: 'อาคาร', Icon: Icons.Buildings },
        { id: 'reports', name: 'รายงาน', Icon: Icons.Reports },
        { id: 'notifications', name: 'แจ้งเตือน', Icon: Icons.Bell },
        { id: 'settings', name: 'ตั้งค่า', Icon: Icons.Settings }
      ].map(tab => (
        <div key={tab.id} onClick={() => { setCurrentTab(tab.id); setSelectedBuilding(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', opacity: currentTab === tab.id ? 1 : 0.6 }}>
          <tab.Icon active={currentTab === tab.id} />
          <span style={{ fontSize: '0.65rem', fontWeight: currentTab === tab.id ? '700' : '500', color: currentTab === tab.id ? theme.primary : theme.textSub }}>{tab.name}</span>
        </div>
      ))}
    </div>
  );

  const DashboardView = () => {
    const { 
      globalKw, globalKwh, solarKw, cost, topBuildings,
      onPeakCost, offPeakCost, demandCost, ftCost, pfPenaltyCost, totalBeforeVat, vatCost,
      currentPf, excessKvar, estimatedKwh, monthlyOnPeakKwh, monthlyOffPeakKwh, estimatedMaxDemand
    } = billingInfo;

    const currentHour = currentTime.getHours();
    const currentDay = currentTime.getDay(); 
    const isHoliday = currentDay === 0 || currentDay === 6; 
    const isOnPeakNow = !isHoliday && (currentHour >= 9 && currentHour < 22);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fade-in 0.3s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', background: theme.primaryLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏛️</div>
            <strong style={{ color: theme.textMain, fontSize: '1.1rem' }}>วัดหลวงพ่อสดธรรมกายาราม</strong>
          </div>
          <Icons.Bell />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: theme.textMain }}>ภาพรวมวันนี้</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', background: isOnPeakNow ? '#fef08a' : '#bbf7d0', color: isOnPeakNow ? '#854d0e' : '#166534', fontWeight: 'bold' }}>
              {isOnPeakNow ? '☀️ On-Peak' : '🌙 Off-Peak'}
            </span>
            <span style={{ fontSize: '0.8rem', color: theme.primary, fontWeight: '600', cursor: 'pointer' }} onClick={() => setCurrentTab('reports')}>ดูทั้งหมด</span>
          </div>
        </div>

        {/* --- TOU BILLING ANALYSIS CARD --- */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', padding: '1.5rem', color: 'white', boxShadow: theme.shadowLg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(56, 189, 248, 0.15)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', background: 'rgba(16, 185, 129, 0.15)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icons.Electric /> วิเคราะห์ค่าไฟ (TOU 6.2.3)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>สำหรับองค์กรไม่แสวงหากำไร (พ.ศ. 2569)</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', color: '#34d399', fontWeight: 'bold' }}>
                ประมาณการเดือนนี้
              </div>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.5rem', color: '#f8fafc', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              ฿{cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            {/* Breakdown Details */}
            <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>Demand Charge</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '0.5rem' }}>{estimatedMaxDemand.toFixed(2)} kW × ฿210</span>
                  <b>฿{demandCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>On-Peak (09:00-22:00)</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '0.5rem' }}>{monthlyOnPeakKwh.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย × ฿4.3297</span>
                  <b>฿{onPeakCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>Off-Peak</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '0.5rem' }}>{monthlyOffPeakKwh.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย × ฿2.6369</span>
                  <b>฿{offPeakCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#cbd5e1' }}>ค่าบริการรายเดือน</span>
                <span><b>฿312.24</b></span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>ค่า Ft (0.3972 บ./หน่วย)</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '0.5rem' }}>{estimatedKwh.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย</span>
                  <b>฿{ftCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>

              {pfPenaltyCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fca5a5' }}>ค่าปรับเพาเวอร์แฟคเตอร์ (PF: {currentPf.toFixed(2)})</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '0.5rem' }}>ส่วนเกิน {excessKvar.toFixed(2)} kVAR × ฿56.07</span>
                    <b style={{ color: '#fca5a5' }}>฿{pfPenaltyCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', margin: '0.25rem 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#cbd5e1' }}>รวมเงินก่อนภาษี (VAT)</span>
                <span><b>฿{totalBeforeVat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a3e635' }}>
                <span>ภาษีมูลค่าเพิ่ม 7%</span>
                <span><b>฿{vatCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: theme.textSub, marginBottom: '0.5rem' }}>พลังงานไฟฟ้า</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: theme.primary }}>{globalKw.toFixed(3)} <span style={{fontSize:'0.7rem'}}>kW</span></div>
          </div>
          <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: theme.textSub, marginBottom: '0.5rem' }}>พลังงานใช้ไป</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: theme.primary }}>{globalKwh.toFixed(2)} <span style={{fontSize:'0.7rem'}}>kWh</span></div>
          </div>
          <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: theme.textSub, marginBottom: '0.5rem' }}>โซล่าเซลล์</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: theme.success }}>{solarKw.toFixed(2)} <span style={{fontSize:'0.7rem'}}>kW</span></div>
          </div>
        </div>

        <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: theme.textMain }}>กราฟการใช้พลังงาน</h3>
            <div style={{ display: 'flex', background: theme.primaryLight, borderRadius: '8px', padding: '2px' }}>
              <div onClick={() => setGraphUnit('kW')} style={{ cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', background: graphUnit === 'kW' ? theme.primary : 'transparent', color: graphUnit === 'kW' ? 'white' : theme.primary, borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s' }}>kW</div>
              <div onClick={() => setGraphUnit('kWh')} style={{ cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', background: graphUnit === 'kWh' ? theme.primary : 'transparent', color: graphUnit === 'kWh' ? 'white' : theme.primary, borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s' }}>kWh</div>
            </div>
          </div>
          <FilterSelector />
          <div style={{ height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                <XAxis dataKey="time" fontSize={10} stroke={theme.textSub} tickMargin={10} />
                <Bar dataKey={graphUnit === 'kW' ? 'kw' : 'kwh'} fill={graphUnit === 'kW' ? '#eab308' : theme.success} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: theme.textMain }}>อาคารที่ใช้พลังงานสูงสุด</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topBuildings.length > 0 ? topBuildings.map((b, index) => (
              <div key={b.id} onClick={() => { setSelectedBuilding(b); setBuildingTab('overview'); setCurrentTab('buildings'); }} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', background: theme.primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: theme.primary }}>{index + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.textMain }}>{b.name}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.danger, fontWeight: 'bold' }}>฿ {(b.kwh * 4.24).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{b.kwh.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{fontSize:'0.7rem', color: theme.textSub}}>kWh</span></div>
              </div>
            )) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: theme.textSub, fontSize: '0.9rem', background: theme.cardBg, borderRadius: '16px', border: `1px dashed ${theme.border}` }}>กำลังรอข้อมูลจากมิเตอร์...</div>
            )}
          </div>
        </div>

      </div>
    );
  };

  const BuildingsView = () => {
    const filtered = BUILDINGS.filter(b => b.name.includes(bSearch) && (bFilter === 'all' || (bFilter === 'active' && b.deviceId)));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fade-in 0.3s ease-out' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: theme.textMain, textAlign: 'center' }}>อาคาร</h2>
        
        <div style={{ display: 'flex', borderBottom: `2px solid ${theme.border}` }}>
          <div onClick={() => setBFilter('all')} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', fontWeight: 'bold', color: bFilter === 'all' ? theme.textMain : theme.textSub, borderBottom: bFilter === 'all' ? `2px solid ${theme.textMain}` : 'none', marginBottom: '-2px' }}>ทั้งหมด ({BUILDINGS.length})</div>
          <div onClick={() => setBFilter('active')} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', fontWeight: 'bold', color: bFilter === 'active' ? theme.textMain : theme.textSub, borderBottom: bFilter === 'active' ? `2px solid ${theme.textMain}` : 'none', marginBottom: '-2px' }}>ที่ใช้บ่อย</div>
        </div>

        <input type="text" placeholder="ค้นหาอาคาร" value={bSearch} onChange={e => setBSearch(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.cardBg, fontSize: '0.9rem', outline: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(b => {
            const hasDevice = !!b.deviceId;
            const parsed = parsedBuildingData[b.id] || parseData(null);
            const isOnline = hasDevice && parsed.isOnline;
            const statusColor = isOnline ? theme.success : theme.warning;
            const statusText = isOnline ? 'Active' : (hasDevice ? 'Offline' : 'Pending');
            const kwh = isOnline ? parsed.totalKwh : (b.id === 'somdej' ? '2,300.76' : '--');
            const kwhNum = parseFloat(String(kwh).replace(/,/g, ''));
            const estCost = !isNaN(kwhNum) ? (kwhNum * 4.24).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '--';
            
            return (
              <div key={b.id} onClick={() => { setSelectedBuilding(b); setBuildingTab('overview'); }} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: b.isSolar ? '#fef3c7' : theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  {b.isSolar ? '☀️' : '🏢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: theme.textMain }}>{b.name}</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textSub, marginTop: '0.2rem' }}>Power {isOnline ? parsed.totalKw : '0.000'} kW</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: statusColor, marginBottom: '0.2rem' }}>{statusText}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: theme.textMain }}><span style={{color: statusColor}}>⚡</span> {kwh} <span style={{fontSize:'0.65rem', color: theme.textSub}}>kWh</span></div>
                  <div style={{ fontSize: '0.75rem', color: theme.danger, fontWeight: 'bold', marginTop: '0.2rem' }}>฿ {estCost}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BuildingDetailsView = () => {
    const b = selectedBuilding;
    const hasDevice = !!b.deviceId;
    const parsed = parsedBuildingData[b.id] || parseData(null);
    const isOnline = hasDevice && parsed.isOnline;
    const equipments = getEquipmentsForBuilding(b.id, isOnline, hasDevice);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fade-in 0.3s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div onClick={() => setSelectedBuilding(null)} style={{ cursor: 'pointer' }}><Icons.Back /></div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: theme.textMain, flex: 1 }}>{b.name}</h2>
          <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', border: `1px solid ${isOnline ? theme.success : theme.warning}`, color: isOnline ? theme.success : theme.warning, fontWeight: 'bold' }}>{isOnline ? 'Active' : (hasDevice ? 'Offline' : 'Pending')}</span>
        </div>

        <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {['ภาพรวม', 'พลังงาน', 'อุปกรณ์', 'โปรไฟล์'].map(t => {
            let id = 'overview';
            if (t === 'ภาพรวม') id = 'overview';
            if (t === 'พลังงาน') id = 'energy';
            if (t === 'อุปกรณ์') id = 'equipment';
            if (t === 'โปรไฟล์') id = 'profile';
            return (
              <div key={t} onClick={() => setBuildingTab(id)} style={{ whiteSpace: 'nowrap', padding: '0.25rem 0', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', color: buildingTab === id ? theme.primary : theme.textSub, borderBottom: buildingTab === id ? `2px solid ${theme.primary}` : 'none', transition: 'all 0.2s' }}>
                {t}
              </div>
            );
          })}
        </div>

        {buildingTab === 'equipment' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {equipments.map(e => (
              <div key={e.id} style={{ background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e.type === 'electric' ? <Icons.Electric /> : e.type === 'ac' ? <Icons.AC /> : e.type === 'solar' ? <Icons.Solar /> : <Icons.Meter />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: theme.textMain }}>{e.name}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.textSub, marginTop: '0.2rem' }}>Power {e.power} kW</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: e.status === 'Active' ? theme.success : theme.warning }}>{e.status}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: theme.textMain }}><span style={{color: e.status === 'Active' ? theme.danger : theme.warning}}>⚡</span> {e.kwh} <span style={{fontSize:'0.65rem', color: theme.textSub}}>kWh</span></div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', padding: '1rem', color: theme.primary, fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>👁️ ดูอุปกรณ์ทั้งหมด</div>
          </div>
        ) : buildingTab === 'overview' ? (
          <>
            <h3 style={{ margin: 0, fontSize: '1rem', color: theme.textMain }}>ภาพรวมวันนี้</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <div style={{ fontSize: '0.7rem', color: theme.textSub, marginBottom: '0.5rem' }}>พลังงานไฟฟ้า</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.primary }}>{isOnline ? parsed.totalKwh : '2,300.76'} <span style={{fontSize:'0.65rem', color: theme.textSub}}>kWh</span></div>
              </div>
              <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <div style={{ fontSize: '0.7rem', color: theme.textSub, marginBottom: '0.5rem' }}>กำลังไฟฟ้า</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.primary }}>{isOnline ? parsed.totalKw : '0.945'} <span style={{fontSize:'0.65rem', color: theme.textSub}}>kW</span></div>
              </div>
              <div style={{ flex: 1, background: theme.cardBg, borderRadius: '16px', padding: '1rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <div style={{ fontSize: '0.7rem', color: theme.textSub, marginBottom: '0.5rem' }}>ค่าใช้จ่าย</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: theme.danger }}>฿2,100.76</div>
              </div>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '20px', padding: '1.25rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.textMain }}>กราฟการใช้พลังงาน</h3>
                <div style={{ display: 'flex', background: theme.primaryLight, borderRadius: '8px', padding: '2px' }}>
                  <div onClick={() => setGraphUnit('kW')} style={{ cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', background: graphUnit === 'kW' ? theme.primary : 'transparent', color: graphUnit === 'kW' ? 'white' : theme.primary, borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s' }}>kW</div>
                  <div onClick={() => setGraphUnit('kWh')} style={{ cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', background: graphUnit === 'kWh' ? theme.primary : 'transparent', color: graphUnit === 'kWh' ? 'white' : theme.primary, borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s' }}>kWh</div>
                </div>
              </div>
              <FilterSelector />
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                    <XAxis dataKey="time" fontSize={10} stroke={theme.textSub} tickMargin={10} />
                    <Line type="monotone" dataKey={graphUnit === 'kW' ? 'kw' : 'kwh'} stroke={graphUnit === 'kW' ? theme.primary : theme.success} strokeWidth={3} dot={{ r: 4, fill: graphUnit === 'kW' ? theme.primary : theme.success }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: theme.textMain }}>อุปกรณ์ภายในอาคาร</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {equipments.slice(0, 3).map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {e.type === 'electric' ? <Icons.Electric /> : e.type === 'ac' ? <Icons.AC /> : e.type === 'solar' ? <Icons.Solar /> : <Icons.Meter />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: theme.textMain }}>{e.name}</div>
                    <div style={{ fontSize: '0.7rem', color: theme.textSub }}>Power {e.power} kW</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: e.status === 'Active' ? theme.success : theme.warning }}>{e.status}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: theme.textSub, background: theme.cardBg, borderRadius: '16px', border: `1px dashed ${theme.border}` }}>
            กำลังพัฒนาระบบแสดงผลข้อมูลสำหรับหัวข้อนี้...
          </div>
        )}
      </div>
    );
  };

  const ReportsView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fade-in 0.3s ease-out' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: theme.textMain, textAlign: 'center' }}>รายงาน</h2>
        
        <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {['ภาพรวม', 'การใช้พลังงาน', 'ค่าใช้จ่าย', 'เปรียบเทียบ'].map(t => {
            let id = 'usage';
            if (t === 'ภาพรวม') id = 'overview';
            if (t === 'การใช้พลังงาน') id = 'usage';
            if (t === 'ค่าใช้จ่าย') id = 'cost';
            if (t === 'เปรียบเทียบ') id = 'compare';
            return (
              <div key={t} onClick={() => setReportTab(id)} style={{ whiteSpace: 'nowrap', padding: '0.25rem 0', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', color: reportTab === id ? theme.primary : theme.textSub, borderBottom: reportTab === id ? `2px solid ${theme.primary}` : 'none', transition: 'all 0.2s' }}>
                {t}
              </div>
            );
          })}
        </div>

        {reportTab === 'usage' && (
          <>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textMain }}>การใช้พลังงาน (kWh)</h3>
            
            <FilterSelector />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: theme.textSub }}>รวมทั้งหมด</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.textMain }}>2,106.94 <span style={{fontSize:'0.8rem', color: theme.textSub}}>kWh</span></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: theme.success, fontWeight: 'bold' }}>+ 12.5% จากช่วงก่อน</div>
        </div>

        <div style={{ height: '200px', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData}>
              <XAxis dataKey="time" fontSize={10} stroke={theme.textSub} axisLine={false} tickLine={false} />
              <Bar dataKey="kwh" fill={theme.success} radius={[4,4,0,0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3 style={{ margin: '1rem 0 0 0', fontSize: '1rem', color: theme.textMain }}>ตารางสรุป</h3>
        <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSub }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'normal' }}>ช่วงเวลา</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'normal' }}>การใช้พลังงาน</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'normal' }}>ช่วงก่อน</th>
              </tr>
            </thead>
            <tbody>
              {[
                { d: '24/04/2567', u: '2,106.94', p: '+ 12.5%', c: theme.success },
                { d: '23/04/2567', u: '2,405.32', p: '+ 8.3%', c: theme.success },
                { d: '22/04/2567', u: '2,222.11', p: '+ 4.1%', c: theme.success },
                { d: '21/04/2567', u: '2,317.69', p: '+ 2.7%', c: theme.success }
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '0.75rem', color: theme.textMain }}>{r.d}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: theme.textMain }}>{r.u}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: r.c }}>{r.p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
        {reportTab !== 'usage' && (
          <div style={{ padding: '2rem', textAlign: 'center', color: theme.textSub, background: theme.cardBg, borderRadius: '16px', border: `1px dashed ${theme.border}` }}>
            กำลังพัฒนาระบบแสดงผลข้อมูลสำหรับหัวข้อนี้...
          </div>
        )}

        {/* AI Assistant Integration */}
        <AiAssistant
          mode="energy"
          contextData={billingInfo.aiContextData}
          title="AI Energy Analyst"
          subtitle="วิเคราะห์อัจฉริยะโดย Gemini (Google AI)"
          icon="⚡"
          themeColor="#10b981"
          isDarkMode={false}
        />
      </div>
    );
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', margin: '-1rem', padding: '1.5rem 1rem 8rem 1rem', fontFamily: "'Prompt', sans-serif", color: theme.textMain }}>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {currentTab === 'dashboard' && <DashboardView />}
      {currentTab === 'buildings' && !selectedBuilding && <BuildingsView />}
      {currentTab === 'buildings' && selectedBuilding && <BuildingDetailsView />}
      {currentTab === 'reports' && <ReportsView />}
      {(currentTab === 'notifications' || currentTab === 'settings') && (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: theme.textSub }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h2>อยู่ระหว่างการพัฒนา</h2>
        </div>
      )}

      <div style={{ height: '6rem', width: '100%' }}></div>
      {renderNav()}
    </div>
  );
}
