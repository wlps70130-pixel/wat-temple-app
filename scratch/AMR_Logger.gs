// ==========================================
// ระบบบันทึกข้อมูล AMR 15 นาที - วัดหลวงพ่อสดฯ
// ==========================================

// 1. ใส่ URL ของเว็บไซต์ (Vercel) ของคุณเบนซ์ที่นี่
// (เช่น https://wat-temple-app.vercel.app โดยไม่ต้องมีเครื่องหมาย / ต่อท้าย)
const VERCEL_APP_URL = "https://wat-temple-app.vercel.app";

// 2. รายชื่อ Device ID ที่ต้องการดึงข้อมูล
// ถ้าเป็น Tuya ให้ใช้ type: "tuya" (หรือปล่อยว่างไว้)
// ถ้าเป็น Shelly ให้ใช้ type: "shelly"
const DEVICES = [
  { name: "ศาลาสมเด็จฯ", id: "somdej", type: "tuya", deviceId: "a3415610e1bc4a9df14lsa" },
  { name: "ศาลาพระประจำวัน", id: "multipurpose", type: "tuya", deviceId: "a3a95d6030b8bc9a02idhq" },
  { name: "พลังงานโซล่าเซลล์", id: "solar", type: "shelly", deviceId: "e08cfe96bc38" }
];

// ฟังก์ชันตรวจสอบ On-Peak / Off-Peak (เวลาประเทศไทย)
function getTouStatus() {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
  
  const day = tzDate.getDay(); // 0 = อาทิตย์, 1 = จันทร์ ... 6 = เสาร์
  const hour = tzDate.getHours();
  
  const isWeekday = day >= 1 && day <= 5;
  const isPeakHour = hour >= 9 && hour < 22;
  
  if (isWeekday && isPeakHour) {
    return "ON_PEAK";
  }
  return "OFF_PEAK";
}

// ฟังก์ชันแปลงข้อมูล Tuya JSON (และ Shelly ที่แปลงมาแล้ว) ให้อ่านง่าย
function parseTuyaData(statusArray) {
  if (!statusArray) return null;
  
  const findVal = (code) => {
    const item = statusArray.find(s => String(s.code).toLowerCase() === code.toLowerCase());
    return item ? Number(item.value) : 0;
  };

  return {
    totalKw: (findVal('activepower') / 1000).toFixed(3),
    totalKwh: (findVal('totalenergyconsumed') / 100).toFixed(2),
    kwA: (findVal('activepowera') / 1000).toFixed(3),
    kwB: (findVal('activepowerb') / 1000).toFixed(3),
    kwC: (findVal('activepowerc') / 1000).toFixed(3),
    vA: (findVal('voltagea') / 10).toFixed(1),
    vB: (findVal('voltageb') / 10).toFixed(1),
    vC: (findVal('voltagec') / 10).toFixed(1),
    aA: (findVal('currenta') / 1000).toFixed(2),
    aB: (findVal('currentb') / 1000).toFixed(2),
    aC: (findVal('currentc') / 1000).toFixed(2)
  };
}

// ==========================================
// ฟังก์ชันลบข้อมูลเก่าอัตโนมัติ เฉพาะแผ่นงาน AMR_Data (Master)
// ==========================================
function deleteOldData(sheet) {
  const MAX_ROWS = 10000; // เก็บย้อนหลังเฉพาะไว้โชว์ในเว็บ
  const currentRowCount = sheet.getLastRow();
  
  if (currentRowCount > MAX_ROWS) {
    const rowsToDelete = currentRowCount - MAX_ROWS + 500; 
    sheet.deleteRows(2, rowsToDelete); 
    Logger.log("ลบข้อมูลเก่าใน AMR_Data ทิ้งจำนวน: " + rowsToDelete + " แถว");
  }
}

// ==========================================
// ฟังก์ชันสร้าง Header อัตโนมัติ
// ==========================================
function setupHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "วัน-เวลา", "อาคาร", "ช่วงเวลา (TOU)", "หน่วยไฟสะสมรวม (kWh)", 
      "กำลังไฟรวม (kW)", "กระแสเฟส A (A)", "กระแสเฟส B (A)", "กระแสเฟส C (A)",
      "กำลังไฟเฟส A (kW)", "กำลังไฟเฟส B (kW)", "กำลังไฟเฟส C (kW)",
      "แรงดันเฟส A (V)", "แรงดันเฟส B (V)", "แรงดันเฟส C (V)"
    ]);
    sheet.getRange("A1:N1").setBackground("#1e293b").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

// ==========================================
// ฟังก์ชันหลัก: ดึงข้อมูลและบันทึกลง Sheet
// (ให้ตั้ง Trigger รันฟังก์ชันนี้ทุก 15 นาที)
// ==========================================
function fetchAndSaveTuyaData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet หลักสำหรับให้ Website ดึงไปแสดงผล (ลบข้อมูลเก่าอัตโนมัติ)
  let masterSheet = ss.getSheetByName("AMR_Data");
  if (!masterSheet) {
    masterSheet = ss.insertSheet("AMR_Data");
  }
  setupHeaders(masterSheet);

  const touStatus = getTouStatus();
  const timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");

  // วนลูปดึงข้อมูลทีละอุปกรณ์
  DEVICES.forEach(device => {
    try {
      const apiPath = device.type === 'shelly' ? '/api/shelly' : '/api/tuya';
      const url = VERCEL_APP_URL + apiPath + "?deviceId=" + device.deviceId;
      
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const json = JSON.parse(response.getContentText());
      
      if (json.success && json.result && json.result.status) {
        const data = parseTuyaData(json.result.status);
        const rowData = [
          timestamp, device.name, touStatus, data.totalKwh, data.totalKw,
          data.aA, data.aB, data.aC, data.kwA, data.kwB, data.kwC, data.vA, data.vB, data.vC
        ];
        
        // บันทึกลง Sheet หลัก (AMR_Data) สำหรับเว็บ
        masterSheet.appendRow(rowData);
        
        // 2. บันทึกลง Sheet แยกแต่ละอาคาร (สำหรับเก็บประวัติระยะยาว ไม่มีลบทิ้ง)
        // ตั้งชื่อแท็บตามชื่ออาคาร เช่น "ศาลาสมเด็จฯ", "พลังงานโซล่าเซลล์"
        let buildingSheet = ss.getSheetByName(device.name);
        if (!buildingSheet) {
          buildingSheet = ss.insertSheet(device.name);
        }
        setupHeaders(buildingSheet);
        buildingSheet.appendRow(rowData);
      }
    } catch (error) {
      Logger.log("Error fetching " + device.name + ": " + error.toString());
    }
  });

  // ลบข้อมูลเก่าเฉพาะในแท็บหลัก (AMR_Data) เพื่อไม่ให้รก
  deleteOldData(masterSheet);
}
