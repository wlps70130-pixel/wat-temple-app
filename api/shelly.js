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
     
     const ds = data.data.device_status;
     let status = [];
     
     if (ds.emeters) {
         // Gen 1 (Shelly 3EM)
         const emeters = ds.emeters;
         const sumPower = emeters.reduce((acc, e) => acc + (e.power || 0), 0);
         const sumTotal = emeters.reduce((acc, e) => acc + (e.total || 0), 0);
         const sumReactive = emeters.reduce((acc, e) => acc + (e.reactive || 0), 0);
         
         status = [
           { code: "activepower", value: Math.round(sumPower) },
           { code: "totalenergyconsumed", value: Math.round(sumTotal / 10) }, 
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
     } else if (ds['em:0'] && ds['emdata:0']) {
         // Gen 2 / Gen 3 (Shelly Pro 3EM)
         const em = ds['em:0'];
         const emdata = ds['emdata:0'];
         
         const sumPower = em.total_act_power || 0;
         const sumTotal = emdata.total_act || 0;
         const sumReactive = em.total_aprt_power || 0;
         
         status = [
           { code: "activepower", value: Math.round(sumPower) },
           { code: "totalenergyconsumed", value: Math.round(sumTotal / 10) }, 
           { code: "reactivepower", value: Math.round(sumReactive) },
           
           { code: "voltagea", value: Math.round((em.a_voltage || 0) * 10) },
           { code: "currenta", value: Math.round((em.a_current || 0) * 1000) },
           { code: "activepowera", value: Math.round(em.a_act_power || 0) },
           { code: "powerfactora", value: Math.round((em.a_pf || 0) * 100) },
           
           { code: "voltageb", value: Math.round((em.b_voltage || 0) * 10) },
           { code: "currentb", value: Math.round((em.b_current || 0) * 1000) },
           { code: "activepowerb", value: Math.round(em.b_act_power || 0) },
           { code: "powerfactorb", value: Math.round((em.b_pf || 0) * 100) },
           
           { code: "voltagec", value: Math.round((em.c_voltage || 0) * 10) },
           { code: "currentc", value: Math.round((em.c_current || 0) * 1000) },
           { code: "activepowerc", value: Math.round(em.c_act_power || 0) },
           { code: "powerfactorc", value: Math.round((em.c_pf || 0) * 100) }
         ];
     } else {
         return res.status(500).json({ success: false, error: "Invalid Shelly response format" });
     }
     
     return res.status(200).json({
       success: true,
       result: { status: status }
     });
     
  } catch (error) {
     return res.status(500).json({ success: false, error: error.message });
  }
}
