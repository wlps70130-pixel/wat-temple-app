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
  { name: "ศาลาสมเด็จฯ", id: "somdej", type: "tuya", deviceId: "a326a888ee9e0e5c67pwni" },
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
// ฟังก์ชันหลัก: ดึงข้อมูลและบันทึกลง Sheet
// (ให้ตั้ง Trigger รันฟังก์ชันนี้ทุก 15 นาที)
// ==========================================
function fetchAndSaveTuyaData() {
  // บังคับหาชื่อแท็บ AMR_Data เท่านั้น จะได้ไม่ไปลงแท็บพระมั่ว
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AMR_Data");
  
  if (!sheet) {
    Logger.log("ไม่พบแท็บชื่อ AMR_Data โปรดสร้างแท็บนี้ก่อน");
    return;
  }
  
  // สร้าง Header อัตโนมัติถ้าบรรทัดแรกยังว่าง
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "วัน-เวลา", 
      "อาคาร", 
      "ช่วงเวลา (TOU)", 
      "หน่วยไฟสะสมรวม (kWh)", 
      "กำลังไฟรวม (kW)", 
      "กระแสเฟส A (A)", 
      "กระแสเฟส B (A)", 
      "กระแสเฟส C (A)",
      "กำลังไฟเฟส A (kW)",
      "กำลังไฟเฟส B (kW)",
      "กำลังไฟเฟส C (kW)",
      "แรงดันเฟส A (V)",
      "แรงดันเฟส B (V)",
      "แรงดันเฟส C (V)"
    ]);
    sheet.getRange("A1:N1").setBackground("#1e293b").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  const touStatus = getTouStatus();
  const timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");

  // วนลูปดึงข้อมูลทีละอุปกรณ์
  DEVICES.forEach(device => {
    try {
      // เลือกว่าจะดึงจาก API ตัวไหน (Tuya หรือ Shelly)
      const apiPath = device.type === 'shelly' ? '/api/shelly' : '/api/tuya';
      const url = VERCEL_APP_URL + apiPath + "?deviceId=" + device.deviceId;
      
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const json = JSON.parse(response.getContentText());
      
      if (json.success && json.result && json.result.status) {
        // ไม่ว่าจะเป็น Tuya หรือ Shelly เราก็ใช้ตัวอ่านเดียวกันได้เลย เพราะหลังบ้านเว็บเราแปลงให้แล้ว!
        const data = parseTuyaData(json.result.status);
        
        // บันทึกลง Sheet
        sheet.appendRow([
          timestamp,
          device.name,
          touStatus,
          data.totalKwh,
          data.totalKw,
          data.aA,
          data.aB,
          data.aC,
          data.kwA,
          data.kwB,
          data.kwC,
          data.vA,
          data.vB,
          data.vC
        ]);
      }
    } catch (error) {
      Logger.log("Error fetching " + device.name + ": " + error.toString());
    }
  });
}
