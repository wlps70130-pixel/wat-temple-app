export default async function handler(req, res) {
  const { deviceId } = req.query;
  
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });
  
  // Shelly Cloud Config
  const SERVER = "https://shelly-256-eu.shelly.cloud";
  const AUTH_KEY = "NDBmZjYwdWlkFFD944BFE845180CBC1C841EA9A06D86A747318179B7E151C8DD1BB3907E8E579ABA7F9504D2CD12";
  
  const url = `${SERVER}/device/status`;
  const body = `id=${deviceId}&auth_key=${AUTH_KEY}`;
  
  try {
     const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
     });
     
     const data = await response.json();
     
     if (!data.isok || !data.data || !data.data.device_status || !data.data.device_status.emeters) {
        return res.status(500).json({ success: false, error: "Invalid Shelly response or Device Offline" });
     }
     
     const emeters = data.data.device_status.emeters;
     
     const sumPower = emeters.reduce((acc, e) => acc + (e.power || 0), 0);
     const sumTotal = emeters.reduce((acc, e) => acc + (e.total || 0), 0);
     const sumReactive = emeters.reduce((acc, e) => acc + (e.reactive || 0), 0);
     
     // Map Shelly 3EM data to exact Tuya API format so the Frontend/Apps Script requires NO changes!
     const status = [
       { code: "activepower", value: Math.round(sumPower) },
       { code: "totalenergyconsumed", value: Math.round(sumTotal / 10) }, // Tuya expects kWh * 100. Shelly is Wh. Wh/10 = kWh*100
       { code: "reactivepower", value: Math.round(sumReactive) },
       
       { code: "voltagea", value: Math.round((emeters[0]?.voltage || 0) * 10) },
       { code: "currenta", value: Math.round((emeters[0]?.current || 0) * 1000) },
       { code: "activepowera", value: Math.round(emeters[0]?.power || 0) },
       { code: "powerfactora", value: Math.round((emeters[0]?.pf || 0) * 100) },
       
       { code: "voltageb", value: Math.round((emeters[1]?.voltage || 0) * 10) },
       { code: "currentb", value: Math.round((emeters[1]?.current || 0) * 1000) },
       { code: "activepowerb", value: Math.round(emeters[1]?.power || 0) },
       { code: "powerfactorb", value: Math.round((emeters[1]?.pf || 0) * 100) },
       
       { code: "voltagec", value: Math.round((emeters[2]?.voltage || 0) * 10) },
       { code: "currentc", value: Math.round((emeters[2]?.current || 0) * 1000) },
       { code: "activepowerc", value: Math.round(emeters[2]?.power || 0) },
       { code: "powerfactorc", value: Math.round((emeters[2]?.pf || 0) * 100) }
     ];
     
     return res.status(200).json({
       success: true,
       result: { status: status }
     });
     
  } catch (error) {
     return res.status(500).json({ success: false, error: error.message });
  }
}
