const https = require('https');
const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=2048515869&single=true&output=csv";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      console.log('No data found');
      return;
    }

    const headers = lines[0].split(',');
    
    // Parse rows
    const rows = lines.slice(1).map(line => {
      // Basic CSV parsing
      const cols = line.split(',');
      return {
        timestamp: cols[0],
        building: cols[1],
        kw: parseFloat(cols[2] || 0)
      };
    });

    const buildingStats = {};
    const recentRows = rows.slice(-500); // Look at last 500 rows

    recentRows.forEach(row => {
      const b = row.building;
      if (!buildingStats[b]) {
        buildingStats[b] = { count: 0, lastSeen: null, lastKw: null, zeros: 0 };
      }
      buildingStats[b].count++;
      buildingStats[b].lastSeen = row.timestamp;
      buildingStats[b].lastKw = row.kw;
      if (row.kw === 0 || row.kw < -500) {
          buildingStats[b].zeros++;
      }
    });

    console.log("=== สรุปข้อมูลล่าสุด ===");
    for (const [b, stats] of Object.entries(buildingStats)) {
      console.log(`อาคาร: ${b}`);
      console.log(`  อัปเดตล่าสุด: ${stats.lastSeen}`);
      console.log(`  ค่าไฟล่าสุด: ${stats.lastKw} kW`);
      console.log(`  พบข้อมูลเป็น 0 หรือผิดปกติ: ${stats.zeros} ครั้งในรอบหลังสุด`);
      console.log("------------------------");
    }
  });
}).on('error', (e) => {
  console.error("Error:", e);
});
