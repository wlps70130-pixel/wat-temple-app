import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
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
  Home: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Buildings: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>,
  Reports: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Bell: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Settings: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Back: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Electric: () => <span style={{fontSize:'1.5rem'}} aria-hidden="true">🔌</span>,
  AC: () => <span style={{fontSize:'1.5rem'}} aria-hidden="true">❄️</span>,
  Solar: () => <span style={{fontSize:'1.5rem'}} aria-hidden="true">☀️</span>,
  Meter: () => <span style={{fontSize:'1.5rem'}} aria-hidden="true">🎛️</span>
};

// --- SUB COMPONENTS ---

const AppNav = ({ currentTab, setCurrentTab, setSelectedBuilding }) => (
  <nav className="e-bottom-nav">
    {[
      { id: 'dashboard', name: 'หน้าหลัก', Icon: Icons.Home },
      { id: 'buildings', name: 'อาคาร', Icon: Icons.Buildings },
      { id: 'reports', name: 'รายงาน', Icon: Icons.Reports },
      { id: 'notifications', name: 'แจ้งเตือน', Icon: Icons.Bell },
      { id: 'settings', name: 'ตั้งค่า', Icon: Icons.Settings }
    ].map(tab => (
      <button 
        key={tab.id} 
        onClick={() => { setCurrentTab(tab.id); setSelectedBuilding(null); }} 
        className={`e-nav-btn ${currentTab === tab.id ? 'active' : ''}`}
        aria-label={tab.name}
      >
        <tab.Icon active={currentTab === tab.id} />
        <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>{tab.name}</span>
      </button>
    ))}
  </nav>
);

const SegmentedControl = ({ options, value, onChange }) => (
  <div className="e-segmented-control" role="tablist">
    {options.map(opt => (
      <button 
        key={opt.value} 
        onClick={() => onChange(opt.value)}
        className={`e-segment-btn ${value === opt.value ? 'active' : ''}`}
        role="tab"
        aria-selected={value === opt.value}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const StatCard = ({ title, value, unit, type }) => {
  const colorVar = type === 'solar' ? 'var(--e-success)' : 'var(--e-primary)';
  return (
    <div className="e-card" style={{ textAlign: 'center' }}>
      <div className="e-subtitle" style={{ marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '800', color: colorVar }}>
        {value} <span style={{ fontSize: '0.6em' }}>{unit}</span>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="e-card" style={{ textAlign: 'center', padding: '32px 16px', borderStyle: 'dashed' }}>
    <div className="e-subtitle">{message}</div>
  </div>
);

// --- MAIN COMPONENT ---
export default function EnergyDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingTab, setBuildingTab] = useState('overview'); // overview, energy, equipment, profile
  const [bSearch, setBSearch] = useState('');
  const [bFilter, setBFilter] = useState('all'); // all, active, pending
  const [reportTab, setReportTab] = useState('usage'); // overview, usage, cost, compare
  const [reportFilter, setReportFilter] = useState('day'); // day, month, year
  const [graphUnit, setGraphUnit] = useState('kW'); // kW, kWh
  const [dayResolution, setDayResolution] = useState('1h'); // 15m, 30m, 1h, 4h
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Data States
  const [buildingData, setBuildingData] = useState({});
  const [rawHistory, setRawHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const HISTORY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNzQ7frtMJMwnqyXuqMjU_Jx59iApoXM0KYwfsfqIh6Q_wCKF6lCV3q0qov-dpzxJLabPdZFk31gyi/pub?output=csv";

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

      // Calculate precise kWh delta
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
            if (diff > 0 && diff < 50000) delta = diff;
          }
          dataWithDelta.push({ ...r, kwhDelta: delta });
        });
      });
      sourceData = dataWithDelta;

      if (reportFilter === 'day') {
          const [y,m,d] = selectedDate.split('-');
          const targetDateStr = `${d}/${m}/${y}`;
          const dayData = sourceData.filter(r => r.timestamp.startsWith(targetDateStr));
          
          const intervalMinutes = dayResolution === '15m' ? 15 : dayResolution === '30m' ? 30 : dayResolution === '1h' ? 60 : 240;
          const buckets = {};
          
          for(let i=0; i<24*60; i+=intervalMinutes) {
              const h = Math.floor(i/60).toString().padStart(2, '0');
              const mStr = (i%60).toString().padStart(2, '0');
              buckets[`${h}:${mStr}`] = [];
          }
          
          dayData.forEach(r => {
             const timeStr = r.timestamp.split(' ')[1];
             if (!timeStr) return;
             const [hh, mm] = timeStr.split(':').map(Number);
             const totalMins = hh * 60 + mm;
             const bucketMins = Math.floor(totalMins / intervalMinutes) * intervalMinutes;
             const bH = Math.floor(bucketMins / 60).toString().padStart(2, '0');
             const bM = (bucketMins % 60).toString().padStart(2, '0');
             const bStr = `${bH}:${bM}`;
             if (buckets[bStr]) buckets[bStr].push(r);
          });

          Object.keys(buckets).forEach(b => {
             let maxKw = 0; let sumKwh = 0;
             if (buckets[b].length > 0) {
                 maxKw = Math.max(...buckets[b].map(r => r.totalKw));
                 sumKwh = buckets[b].reduce((sum, r) => sum + r.kwhDelta, 0); 
             }
             data.push({ time: b, kw: maxKw, kwh: sumKwh });
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
             let maxKw = 0; let sumKwh = 0;
             if (buckets[b].length > 0) {
                 maxKw = Math.max(...buckets[b].map(r => r.totalKw));
                 sumKwh = buckets[b].reduce((sum, r) => sum + r.kwhDelta, 0); 
             }
             data.push({ time: b, kw: maxKw, kwh: sumKwh });
          });
      } else {
         const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
         labels.forEach((l, i) => {
             const mStr = (i+1).toString().padStart(2, '0');
             const targetStr = `/${mStr}/${selectedYear}`;
             const monthData = sourceData.filter(r => r.timestamp.includes(targetStr));
             let maxKw = 0; let sumKwh = 0;
             if (monthData.length > 0) {
                 maxKw = Math.max(...monthData.map(r => r.totalKw));
                 sumKwh = monthData.reduce((sum, r) => sum + r.kwhDelta, 0); 
             }
             data.push({ time: l, kw: maxKw, kwh: sumKwh });
         });
      }
      return data;
  }, [reportFilter, dayResolution, selectedDate, selectedMonth, selectedYear, currentTab, rawHistory, selectedBuilding]);

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
    
    const estimatedKvar = estimatedMaxDemand * 0.698;
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

  const FilterControls = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      <SegmentedControl 
        options={[{label: 'รายวัน', value: 'day'}, {label: 'รายเดือน', value: 'month'}, {label: 'รายปี', value: 'year'}]}
        value={reportFilter}
        onChange={setReportFilter}
      />
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {reportFilter === 'day' && (
          <>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="e-input" />
            <select value={dayResolution} onChange={e => setDayResolution(e.target.value)} className="e-input">
              <option value="15m">ทุก 15 นาที</option>
              <option value="30m">ทุก 30 นาที</option>
              <option value="1h">ทุก 1 ชั่วโมง</option>
              <option value="4h">ทุก 4 ชั่วโมง</option>
            </select>
          </>
        )}
        {reportFilter === 'month' && <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="e-input" />}
        {reportFilter === 'year' && (
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="e-input">
            {Array.from({ length: 5 }).map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>ปี {y}</option>;
            })}
          </select>
        )}
      </div>
    </div>
  );

  const ChartCard = ({ title }) => {
    const shouldShowLabels = graphData.length <= 12;
    return (
      <div className="e-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="e-heading" style={{ margin: 0 }}>{title}</h3>
          <div style={{ display: 'flex', background: 'var(--e-surface-soft)', borderRadius: '8px', padding: '2px' }}>
            <button onClick={() => setGraphUnit('kW')} style={{ padding: '4px 12px', fontSize: '0.75rem', background: graphUnit === 'kW' ? 'var(--e-primary)' : 'transparent', color: graphUnit === 'kW' ? 'white' : 'var(--e-primary)', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>kW</button>
            <button onClick={() => setGraphUnit('kWh')} style={{ padding: '4px 12px', fontSize: '0.75rem', background: graphUnit === 'kWh' ? 'var(--e-primary)' : 'transparent', color: graphUnit === 'kWh' ? 'white' : 'var(--e-primary)', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>kWh</button>
          </div>
        </div>
        <FilterControls />
        <div className="e-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData} margin={{ top: 48, right: 20, left: 12, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--e-border)" />
              <XAxis dataKey="time" fontSize={11} stroke="var(--e-muted)" tickMargin={12} interval="preserveStartEnd" minTickGap={28} />
              <YAxis width={42} domain={[0, dataMax => (dataMax * 1.15)]} fontSize={11} stroke="var(--e-muted)" tickMargin={8} tickFormatter={v => Math.round(v)} />
              <Tooltip cursor={{ fill: 'var(--e-surface-soft)' }} contentStyle={{ backgroundColor: 'var(--e-surface)', border: `1px solid var(--e-border)`, borderRadius: '8px', color: 'var(--e-text)' }} />
              <Bar dataKey={graphUnit === 'kW' ? 'kw' : 'kwh'} fill={graphUnit === 'kW' ? '#eab308' : '#10b981'} maxBarSize={18} radius={[6,6,0,0]} isAnimationActive={false} activeBar={false}>
                {shouldShowLabels && <LabelList dataKey={graphUnit === 'kW' ? 'kw' : 'kwh'} position="top" fontSize={11} fill="var(--e-muted)" offset={8} formatter={(val) => val > 0 ? Number(val).toFixed(1) : ''} />}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

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
      <div className="e-app-shell">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--e-primary-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏛️</div>
            <strong className="e-title">วัดหลวงพ่อสดฯ</strong>
          </div>
          <button className="e-btn" aria-label="Notifications">
            <Icons.Bell />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="e-heading" style={{ margin: 0 }}>ภาพรวมวันนี้</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`e-badge ${isOnPeakNow ? 'e-badge-pending' : 'e-badge-active'}`}>
              {isOnPeakNow ? '☀️ On-Peak' : '🌙 Off-Peak'}
            </span>
          </div>
        </div>

        {/* --- TOU BILLING ANALYSIS CARD --- */}
        <div className="e-tou-card">
          <div className="e-tou-glow-1"></div>
          <div className="e-tou-glow-2"></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Electric /> วิเคราะห์ค่าไฟ (TOU 6.2.3)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>สำหรับองค์กรไม่แสวงหากำไร (พ.ศ. 2569)</div>
              </div>
              <div className="e-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>ประมาณการเดือนนี้</div>
            </div>

            <div className="e-tou-amount">
              ฿{cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="e-tou-breakdown">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>Demand Charge</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '8px' }}>{estimatedMaxDemand.toFixed(2)} kW × ฿210</span>
                  <b>฿{demandCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>On-Peak (09:00-22:00)</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '8px' }}>{monthlyOnPeakKwh.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย × ฿4.3297</span>
                  <b>฿{onPeakCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>Off-Peak</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '8px' }}>{monthlyOffPeakKwh.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย × ฿2.6369</span>
                  <b>฿{offPeakCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1' }}>ค่า Ft (0.3972 บ./หน่วย)</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '8px' }}>{estimatedKwh.toLocaleString('th-TH', { maximumFractionDigits: 0 })} หน่วย</span>
                  <b>฿{ftCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              </div>

              {pfPenaltyCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fca5a5' }}>ค่าปรับเพาเวอร์แฟคเตอร์ (PF: {currentPf.toFixed(2)})</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '8px' }}>ส่วนเกิน {excessKvar.toFixed(2)} kVAR</span>
                    <b style={{ color: '#fca5a5' }}>฿{pfPenaltyCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a3e635' }}>
                <span>รวม + ภาษีมูลค่าเพิ่ม 7%</span>
                <span><b>฿{cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
              </div>
            </div>
          </div>
        </div>

        <div className="e-grid-summary">
          <StatCard title="พลังงานไฟฟ้า" value={globalKw.toFixed(3)} unit="kW" />
          <StatCard title="พลังงานใช้ไป" value={globalKwh.toFixed(2)} unit="kWh" />
          <StatCard title="โซล่าเซลล์" value={solarKw.toFixed(2)} unit="kW" type="solar" />
        </div>

        <ChartCard title="กราฟการใช้พลังงาน" />

        <div>
          <h3 className="e-heading">อาคารที่ใช้พลังงานสูงสุด</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topBuildings.length > 0 ? topBuildings.map((b, index) => (
              <div key={b.id} onClick={() => { setSelectedBuilding(b); setBuildingTab('overview'); setCurrentTab('buildings'); }} className="e-building-card">
                <div style={{ width: '40px', height: '40px', background: 'var(--e-primary-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--e-primary)' }}>{index + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--e-text)' }}>{b.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--e-danger)', fontWeight: 'bold' }}>฿ {(b.kwh * 4.24).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{b.kwh.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{fontSize:'0.7rem', color: 'var(--e-muted)'}}>kWh</span></div>
              </div>
            )) : <EmptyState message="กำลังรอข้อมูลจากมิเตอร์..." />}
          </div>
        </div>
      </div>
    );
  };

  const BuildingsView = () => {
    const filtered = BUILDINGS.filter(b => b.name.includes(bSearch) && (bFilter === 'all' || (bFilter === 'active' && b.deviceId)));
    return (
      <div className="e-app-shell">
        <h2 className="e-title" style={{ textAlign: 'center' }}>อาคาร</h2>
        
        <SegmentedControl 
          options={[{label: `ทั้งหมด (${BUILDINGS.length})`, value: 'all'}, {label: 'ที่ใช้บ่อย', value: 'active'}]}
          value={bFilter}
          onChange={setBFilter}
        />

        <input type="text" placeholder="ค้นหาอาคาร..." value={bSearch} onChange={e => setBSearch(e.target.value)} className="e-input" />

        <div className="e-grid-buildings">
          {filtered.map(b => {
            const hasDevice = !!b.deviceId;
            const parsed = parsedBuildingData[b.id] || parseData(null);
            const isOnline = hasDevice && parsed.isOnline;
            const statusClass = isOnline ? 'e-badge-active' : (hasDevice ? 'e-badge-offline' : 'e-badge-pending');
            const statusText = isOnline ? 'Active' : (hasDevice ? 'Offline' : 'Pending');
            const kwh = isOnline ? parsed.totalKwh : (b.id === 'somdej' ? '2,300.76' : '--');
            const kwhNum = parseFloat(String(kwh).replace(/,/g, ''));
            const estCost = !isNaN(kwhNum) ? (kwhNum * 4.24).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '--';
            
            return (
              <div key={b.id} onClick={() => { setSelectedBuilding(b); setBuildingTab('overview'); }} className="e-building-card">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: b.isSolar ? '#fef3c7' : 'var(--e-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  {b.isSolar ? '☀️' : '🏢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{b.name}</div>
                  <div className="e-subtitle" style={{ marginTop: '4px' }}>Power {isOnline ? parsed.totalKw : '0.000'} kW</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`e-badge ${statusClass}`} style={{ marginBottom: '4px' }}>{statusText}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>⚡ {kwh} <span style={{fontSize:'0.65rem', color: 'var(--e-muted)'}}>kWh</span></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--e-danger)', fontWeight: 'bold', marginTop: '4px' }}>฿ {estCost}</div>
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
      <div className="e-app-shell">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSelectedBuilding(null)} className="e-btn"><Icons.Back /></button>
          <h2 className="e-title" style={{ flex: 1 }}>{b.name}</h2>
          <span className={`e-badge ${isOnline ? 'e-badge-active' : (hasDevice ? 'e-badge-offline' : 'e-badge-pending')}`}>{isOnline ? 'Active' : (hasDevice ? 'Offline' : 'Pending')}</span>
        </div>

        <SegmentedControl 
          options={[{label: 'ภาพรวม', value: 'overview'}, {label: 'พลังงาน', value: 'energy'}, {label: 'อุปกรณ์', value: 'equipment'}, {label: 'โปรไฟล์', value: 'profile'}]}
          value={buildingTab}
          onChange={setBuildingTab}
        />

        {buildingTab === 'equipment' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {equipments.map(e => (
              <div key={e.id} className="e-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--e-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e.type === 'electric' ? <Icons.Electric /> : e.type === 'ac' ? <Icons.AC /> : e.type === 'solar' ? <Icons.Solar /> : <Icons.Meter />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{e.name}</div>
                  <div className="e-subtitle">Power {e.power} kW</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`e-badge ${e.status === 'Active' ? 'e-badge-active' : 'e-badge-pending'}`}>{e.status}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '4px' }}>⚡ {e.kwh} <span style={{fontSize:'0.65rem', color: 'var(--e-muted)'}}>kWh</span></div>
                </div>
              </div>
            ))}
          </div>
        ) : buildingTab === 'overview' ? (
          <>
            <h3 className="e-heading">ภาพรวมวันนี้</h3>
            <div className="e-grid-summary">
              <StatCard title="พลังงานไฟฟ้า" value={isOnline ? parsed.totalKwh : '2,300.76'} unit="kWh" />
              <StatCard title="กำลังไฟฟ้า" value={isOnline ? parsed.totalKw : '0.945'} unit="kW" />
              <div className="e-card" style={{ textAlign: 'center' }}>
                <div className="e-subtitle" style={{ marginBottom: '8px' }}>ค่าใช้จ่าย</div>
                <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '800', color: 'var(--e-danger)' }}>฿2,100.76</div>
              </div>
            </div>

            <ChartCard title="กราฟการใช้พลังงาน" />

            <h3 className="e-heading">อุปกรณ์ภายในอาคาร</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {equipments.slice(0, 3).map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderBottom: '1px solid var(--e-border)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--e-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {e.type === 'electric' ? <Icons.Electric /> : e.type === 'ac' ? <Icons.AC /> : e.type === 'solar' ? <Icons.Solar /> : <Icons.Meter />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{e.name}</div>
                    <div className="e-subtitle">Power {e.power} kW</div>
                  </div>
                  <div className={`e-badge ${e.status === 'Active' ? 'e-badge-active' : 'e-badge-pending'}`}>{e.status}</div>
                </div>
              ))}
            </div>
          </>
        ) : <EmptyState message="กำลังพัฒนาระบบแสดงผลข้อมูลสำหรับหัวข้อนี้..." />}
      </div>
    );
  };

  const ReportsView = () => (
    <div className="e-app-shell">
      <h2 className="e-title" style={{ textAlign: 'center' }}>รายงาน</h2>
      
      <SegmentedControl 
        options={[{label: 'ภาพรวม', value: 'overview'}, {label: 'การใช้พลังงาน', value: 'usage'}, {label: 'ค่าใช้จ่าย', value: 'cost'}, {label: 'เปรียบเทียบ', value: 'compare'}]}
        value={reportTab}
        onChange={setReportTab}
      />

      {reportTab === 'usage' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 className="e-heading" style={{ margin: 0 }}>การใช้พลังงาน ({graphUnit === 'kW' ? 'kW' : 'kWh'})</h3>
            <div style={{ display: 'flex', background: 'var(--e-surface-soft)', borderRadius: '8px', padding: '2px' }}>
              <button onClick={() => setGraphUnit('kW')} style={{ padding: '4px 12px', fontSize: '0.75rem', background: graphUnit === 'kW' ? 'var(--e-primary)' : 'transparent', color: graphUnit === 'kW' ? 'white' : 'var(--e-primary)', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>kW</button>
              <button onClick={() => setGraphUnit('kWh')} style={{ padding: '4px 12px', fontSize: '0.75rem', background: graphUnit === 'kWh' ? 'var(--e-primary)' : 'transparent', color: graphUnit === 'kWh' ? 'white' : 'var(--e-primary)', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>kWh</button>
            </div>
          </div>
          
          <FilterControls />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
            <div>
              <div className="e-subtitle">{graphUnit === 'kW' ? 'ความต้องการพลังงานสูงสุด (Peak Demand)' : 'รวมทั้งหมด'}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                {graphUnit === 'kW' ? Math.max(0, ...graphData.map(d => d.kw || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : graphData.reduce((sum, d) => sum + (d.kwh || 0), 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{fontSize:'0.8rem', color: 'var(--e-muted)'}}>{graphUnit === 'kW' ? 'kW' : 'kWh'}</span>
              </div>
            </div>
          </div>

          <div className="e-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData} margin={{ top: 48, right: 20, left: 12, bottom: 24 }}>
                <YAxis width={42} domain={[0, dataMax => (dataMax * 1.15)]} hide />
                <Tooltip cursor={{ fill: 'var(--e-surface-soft)' }} contentStyle={{ backgroundColor: 'var(--e-surface)', border: `1px solid var(--e-border)`, borderRadius: '8px', color: 'var(--e-text)' }} />
                <XAxis dataKey="time" fontSize={11} stroke="var(--e-muted)" axisLine={false} tickLine={false} tickMargin={12} interval="preserveStartEnd" minTickGap={28} />
                <Bar dataKey={graphUnit === 'kW' ? 'kw' : 'kwh'} fill={graphUnit === 'kW' ? '#eab308' : '#10b981'} maxBarSize={18} radius={[6,6,0,0]} isAnimationActive={false} activeBar={false}>
                  {graphData.length <= 12 && <LabelList dataKey={graphUnit === 'kW' ? 'kw' : 'kwh'} position="top" fontSize={11} fill="var(--e-muted)" offset={8} formatter={(val) => val > 0 ? Number(val).toFixed(1) : ''} />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="e-heading" style={{ marginTop: '24px' }}>ตารางสรุป</h3>
          <div className="e-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="e-table">
              <thead>
                <tr>
                  <th>ช่วงเวลา</th>
                  <th style={{ textAlign: 'right' }}>การใช้พลังงาน (kWh)</th>
                  <th style={{ textAlign: 'right' }}>ความต้องการสูงสุด (kW)</th>
                </tr>
              </thead>
              <tbody>
                {graphData.filter(d => d.kwh > 0 || d.kw > 0).reverse().map((r, i) => (
                  <tr key={i}>
                    <td>{r.time}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{r.kwh.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--e-warning)' }}>{r.kw.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {graphData.filter(d => d.kwh > 0 || d.kw > 0).length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--e-muted)' }}>ไม่มีข้อมูลในอดีต</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : <EmptyState message="กำลังพัฒนาระบบแสดงผลข้อมูลสำหรับหัวข้อนี้..." />}

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

  return (
    <div className="energy-app">
      {currentTab === 'dashboard' && DashboardView()}
      {currentTab === 'buildings' && !selectedBuilding && BuildingsView()}
      {currentTab === 'buildings' && selectedBuilding && BuildingDetailsView()}
      {currentTab === 'reports' && ReportsView()}
      {(currentTab === 'notifications' || currentTab === 'settings') && (
        <EmptyState message="⚙️ อยู่ระหว่างการพัฒนา" />
      )}
      <AppNav currentTab={currentTab} setCurrentTab={setCurrentTab} setSelectedBuilding={setSelectedBuilding} />
    </div>
  );
}
