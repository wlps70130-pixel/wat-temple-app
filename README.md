# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## NVR event receiver on Optiplex 5000

The app exposes `POST /api/nvr-events` for VIGI NVR event callbacks. It stores each callback as JSON Lines files under `data/nvr-events` by default, with raw payload, redacted headers, source IP, and a first-pass summary for camera, event type, person detection, time period, and future Duangkaew score.

Production target:

- Receiver machine: Dell Optiplex 5000
- CPU/RAM: 12th Gen Intel Core i5-12400T, 16 GB RAM
- Storage: 512 GB NVMe
- Recommended app path: `D:\wat-temple-app`
- Optiplex LAN IP: `192.168.1.53`
- NVR callback URL: `http://192.168.1.53:10000/api/nvr-events`

VIGI UI setup, when available:

- Menu: `Settings > Event > Alarm Server > +Add`
- Thai UI: `การตั้งค่า > เหตุการณ์ > เซิร์ฟเวอร์แจ้งเตือน / เซิร์ฟเวอร์เตือนภัย > +เพิ่ม`
- Host IP/Domain: `192.168.1.53`
- Protocol: `HTTP`
- Port: `10000`
- URL: `/api/nvr-events`
- Attach image / picture switch: `off` at first, then enable later after the JSON event payload is confirmed.

After adding the alarm server, open the event rule and enable `Send to Alarm Server` in the processing mode.

Depending on firmware, human/person detection may appear in one of two places:

- `Settings > Event > Basic Event > Motion Detection`, then enable `Smart Detection / Object Classification > Human`.
- `Settings > Event > Smart Event`, then choose an event such as `Intrusion Detection` or `Line Crossing Detection` and enable its human/person target option.

Thai UI for the event rule is usually around:

- `การตั้งค่า > เหตุการณ์ > เหตุการณ์พื้นฐาน > การตรวจจับการเคลื่อนไหว`
- Turn on `เปิดใช้งาน / เปิดการตรวจจับการเคลื่อนไหว`.
- Find `การตรวจจับอัจฉริยะ`, `การจำแนกวัตถุ`, or `ประเภทเป้าหมาย`, then enable `มนุษย์ / บุคคล`.
- Find the section named `โหมดการประมวลผล`, `วิธีการเชื่อมโยง`, `การเชื่อมโยง`, or `การดำเนินการเมื่อเกิดเหตุการณ์`.
- Enable the option translated like `ส่งไปยังเซิร์ฟเวอร์แจ้งเตือน`, `ส่งไปยังเซิร์ฟเวอร์เตือนภัย`, or `ส่งไปยัง Alarm Server`.
- Click `นำไปใช้ / บันทึก`.

If `การตรวจจับการเคลื่อนไหว` has no alarm-server option, use a smart event that exists on the NVR, such as `การตรวจจับการบุกรุก` or `การตรวจจับการข้ามเส้น`, then enable human/person target filtering and `ส่งไปยังเซิร์ฟเวอร์แจ้งเตือน`.

If the UI menu is not available, configure it through NVR OpenAPI `POST /openapi/event_server`:

```json
{
  "id": 1,
  "ip_or_domain": "192.168.1.53",
  "port": 10000,
  "url": "/api/nvr-events",
  "protocol": "HTTP",
  "picture_switch": "off"
}
```

Some NVR firmware versions do not show `Send to Alarm Server` in any event's triggered action. In that case, still configure `/openapi/event_server` first and trigger motion/person events to verify whether the NVR firmware pushes events globally.

Helper script:

```powershell
cd D:\wat-temple-app
$env:NVR_ACCESS_TOKEN = "<paste token locally only>"
node .\scripts\nvr-event-server.mjs get
node .\scripts\nvr-event-server.mjs set
node .\scripts\nvr-event-server.mjs get
```

Expected OpenAPI set response:

```json
{ "error_code": 0 }
```

Then walk in front of one camera and check:

```powershell
curl.exe http://127.0.0.1:10000/api/nvr-events?limit=20
```

If `event_server` is configured but no callbacks arrive, this firmware likely supports event server configuration but does not link detection events to it. The fallback is to poll/search NVR events through OpenAPI on a schedule instead of receiving callbacks.

Optional environment variables:

- `NVR_EVENT_LOG_DIR`: directory for `.jsonl` event logs. Use a persistent local folder on the Optiplex, for example `D:\wat-temple-app\data\nvr-events`.
- `NVR_EVENT_SECRET`: optional shared secret. When set, requests must include `x-nvr-event-secret` or `?secret=...`.
- `NVR_EVENT_TIME_ZONE`: time zone for morning/afternoon/evening grouping. Defaults to `Asia/Bangkok`.

Local production run on the Optiplex:

```powershell
cd D:\wat-temple-app
npm.cmd run build
$env:PORT = "10000"
$env:NVR_EVENT_LOG_DIR = "D:\wat-temple-app\data\nvr-events"
$env:NVR_EVENT_TIME_ZONE = "Asia/Bangkok"
npm.cmd start
```

Allow the NVR to reach the receiver through Windows Firewall:

```powershell
New-NetFirewallRule -DisplayName "Wat Temple NVR Events" -Direction Inbound -Protocol TCP -LocalPort 10000 -Action Allow
```

Useful checks:

```powershell
curl.exe http://127.0.0.1:10000/api/nvr-events?limit=20
curl.exe -X POST http://127.0.0.1:10000/api/nvr-events `
  -H "Content-Type: application/json" `
  -d "{\"eventType\":\"human_detection\",\"channelId\":1,\"time\":\"2026-05-12T06:00:00+07:00\"}"
```
