// ==========================================
// ระบบบันทึกข้อมูล AMR 15 นาที - วัดหลวงพ่อสดฯ
// ==========================================

// 1. ใส่ URL ของเว็บไซต์ (Vercel) ของคุณเบนซ์ที่นี่
// (ไม่ต้องมีเครื่องหมาย / ต่อท้าย)
const VERCEL_APP_URL = "https://YOUR_VERCEL_APP_URL.vercel.app";

// 2. รายชื่อ Device ID ที่ต้องการดึงข้อมูล
const DEVICES = [
  { name: "ศาลาสมเด็จฯ", id: "somdej", deviceId: "a326a888ee9e0e5c67pwni" },
  { name: "ศาลาพระประจำวัน", id: "multipurpose", deviceId: "a3a95d6030b8bc9a02idhq" }
];

// ฟังก์ชันตรวจสอบ On-Peak / Off-Peak (เวลาประเทศไทย)
function getTouStatus() {
  const now = new Date();
  // จัดรูปแบบให้อยู่ใน Timezone ประเทศไทย (+07:00)
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

// ฟังก์ชันแปลงข้อมูล Tuya JSON ให้อ่านง่าย
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // สร้าง Header อัตโนมัติถ้าบรรทัดแรกยังว่าง
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "วัน-เวลา (ด/ว/ป ช:น)", 
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
    // จัดสี Header ให้สวยงาม
    sheet.getRange("A1:N1").setBackground("#1e293b").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  const touStatus = getTouStatus();
  const timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");

  // วนลูปดึงข้อมูลทีละอุปกรณ์
  DEVICES.forEach(device => {
    try {
      const url = VERCEL_APP_URL + "/api/tuya?deviceId=" + device.deviceId;
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const json = JSON.parse(response.getContentText());
      
      if (json.success && json.result && json.result.status) {
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

// ==========================================
// ฟังก์ชัน API: ส่งข้อมูลกลับไปให้เว็บ (React) โหลดกราฟ
// ==========================================
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ดึงข้อมูลแถวทั้งหมด (ข้าม Header)
  const numRowsToFetch = Math.min(lastRow - 1, 500); // ดึงล่าสุดไม่เกิน 500 แถว
  const startRow = lastRow - numRowsToFetch + 1;
  const data = sheet.getRange(startRow, 1, numRowsToFetch, 14).getValues();
  
  const result = data.map(row => ({
    timestamp: row[0],
    building: row[1],
    touStatus: row[2],
    totalKwh: row[3],
    totalKw: row[4],
    currentA: row[5],
    currentB: row[6],
    currentC: row[7],
    kwA: row[8],
    kwB: row[9],
    kwC: row[10]
  }));

  // ส่ง JSON กลับไป (อนุญาตให้ข้ามโดเมนได้)
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
