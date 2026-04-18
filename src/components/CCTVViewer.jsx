import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, X, RefreshCw, Wifi, WifiOff, Settings, ChevronRight, Shield } from 'lucide-react';

// ─── ตั้งค่ากล้องที่นี่ ─────────────────────────────────────────
// รองรับ: URL รูป MJPEG, iframe URL ของระบบ NVR, หรือ HLS stream
const CAMERAS = [
  { id: 1, name: 'หน้าวัด (ประตูใหญ่)',   url: '', type: 'mjpeg', location: 'บริเวณประตูทางเข้า' },
  { id: 2, name: 'ศาลาสมเด็จ',             url: '', type: 'mjpeg', location: 'ด้านหน้าศาลา' },
  { id: 3, name: 'อาคารอเนกประสงค์',       url: '', type: 'mjpeg', location: 'ทางเข้าอาคาร' },
  { id: 4, name: 'ลานจอดรถ',               url: '', type: 'mjpeg', location: 'ด้านหลังวัด' },
  { id: 5, name: 'กุฏิสงฆ์',               url: '', type: 'mjpeg', location: 'เขตสังฆาวาส' },
  { id: 6, name: 'โรงครัว',                url: '', type: 'mjpeg', location: 'ด้านข้างวัด' },
  { id: 7, name: 'ห้องเครื่องเสียง',       url: '', type: 'mjpeg', location: 'อาคารหลัก' },
  { id: 8, name: 'ทางเดินหลัก',            url: '', type: 'mjpeg', location: 'กลางวัด' },
];

// ─── Camera Card ────────────────────────────────────────────────
function CameraCard({ cam, onExpand }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hasStream = !!cam.url;

  return (
    <div
      onClick={() => hasStream && onExpand(cam)}
      style={{
        background: '#0f172a', borderRadius: '14px', overflow: 'hidden',
        border: '1px solid #1e293b', position: 'relative',
        aspectRatio: '16/9', cursor: hasStream ? 'pointer' : 'default',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => hasStream && (e.currentTarget.style.border = '1px solid #3b82f6')}
      onMouseLeave={e => (e.currentTarget.style.border = '1px solid #1e293b')}
    >
      {/* Camera Feed */}
      {hasStream && !imgError ? (
        <>
          {!loaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          <img
            src={cam.url}
            alt={cam.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: loaded ? 'block' : 'none' }}
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        // Offline / Not configured placeholder
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Camera size={22} color={hasStream ? '#ef4444' : '#334155'} />
          <span style={{ fontSize: '0.6rem', color: hasStream ? '#ef4444' : '#475569', fontWeight: '600' }}>
            {hasStream ? 'สัญญาณขาด' : 'ยังไม่ได้ตั้งค่า'}
          </span>
        </div>
      )}

      {/* Overlay labels */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '0.6rem 0.5rem 0.4rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'white', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cam.name}</div>
        <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '1px' }}>{cam.location}</div>
      </div>

      {/* Status dot */}
      <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
        {hasStream && !imgError
          ? <><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e', animation: 'pulse 2s infinite' }}/><span style={{ fontSize: '0.5rem', color: '#22c55e', fontWeight: '700' }}>LIVE</span></>
          : <><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#475569' }}/><span style={{ fontSize: '0.5rem', color: '#475569', fontWeight: '700' }}>OFF</span></>}
      </div>

      {/* Expand icon */}
      {hasStream && !imgError && loaded && (
        <div style={{ position: 'absolute', top: '0.4rem', left: '0.4rem', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '2px 4px' }}>
          <Maximize2 size={10} color="white" />
        </div>
      )}

      {/* Cam number */}
      <div style={{ position: 'absolute', top: '0.4rem', left: hasStream && !imgError && loaded ? '1.6rem' : '0.4rem', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.52rem', color: '#94a3b8', fontWeight: '700' }}>
        CAM {cam.id}
      </div>
    </div>
  );
}

// ─── Fullscreen Modal ────────────────────────────────────────────
function FullscreenCamera({ cam, onClose }) {
  const [imgError, setImgError] = useState(false);
  if (!cam) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', animation: 'fadeIn .2s' }}>
      {/* Top Bar */}
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem', background: 'rgba(255,255,255,0.05)' }}>
        <div>
          <div style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem' }}>{cam.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '1px' }}>{cam.location} · CAM {cam.id}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#22c55e', fontSize: '0.65rem', fontWeight: '700' }}>LIVE</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
        {imgError ? (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <WifiOff size={40} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <p style={{ fontSize: '0.85rem' }}>ไม่สามารถแสดงภาพกล้องได้</p>
            <p style={{ fontSize: '0.72rem', marginTop: '0.25rem' }}>ตรวจสอบ URL ในไฟล์ CCTVViewer.jsx</p>
          </div>
        ) : (
          <img src={cam.url} alt={cam.name} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'contain' }} onError={() => setImgError(true)} />
        )}
      </div>

      {/* Bottom info */}
      <div onClick={e => e.stopPropagation()} style={{ padding: '0.75rem 1.1rem 1.5rem', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={13} color="#64748b" />
        <span style={{ fontSize: '0.68rem', color: '#475569' }}>ระบบกล้องวงจรปิด วัดหลวงพ่อสดธรรมกายาราม</span>
      </div>
    </div>
  );
}

// ─── Setup Hint ─────────────────────────────────────────────────
function SetupHint() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
      <button onClick={() => setShow(!show)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={14} color="#64748b" />
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>วิธีเชื่อมต่อกล้อง</span>
        </div>
        <ChevronRight size={14} color="#475569" style={{ transform: show ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
      </button>
      {show && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', color: '#475569', lineHeight: 1.7 }}>
          <p>📌 เปิดไฟล์ <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>src/components/CCTVViewer.jsx</code></p>
          <p style={{ marginTop: '0.4rem' }}>📷 ใส่ URL กล้องในตัวแปร <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>CAMERAS</code></p>
          <p style={{ marginTop: '0.4rem' }}>🔗 รองรับ: MJPEG stream URL, snapshot URL ที่รีเฟรชอัตโนมัติ</p>
          <p style={{ marginTop: '0.4rem' }}>⚠️ ต้องเป็น <strong style={{ color: '#f59e0b' }}>https://</strong> เท่านั้น (ไม่รองรับ RTSP โดยตรง)</p>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────
export default function CCTVViewer() {
  const [expandedCam, setExpandedCam] = useState(null);
  const [cols, setCols] = useState(2);
  const [tick, setTick] = useState(0);
  const activeCams = CAMERAS.filter(c => c.url);

  // Auto-refresh snapshot every 5s for MJPEG
  useEffect(() => {
    const t = setInterval(() => setTick(k => k + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '3px', height: '18px', background: '#3b82f6', borderRadius: '2px' }} />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>กล้องวงจรปิด</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.58rem', color: '#16a34a', fontWeight: '800' }}>LIVE</span>
          </div>
        </div>
        {/* Grid toggle */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {[2, 1].map(c => (
            <button key={c} onClick={() => setCols(c)} style={{ background: cols === c ? '#3b82f6' : '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', color: cols === c ? 'white' : '#64748b' }}>
              {c === 2 ? '⊞ 2×2' : '⊡ 1×1'}
            </button>
          ))}
        </div>
      </div>

      <SetupHint />

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
        {[{ label: 'กล้องทั้งหมด', val: CAMERAS.length, color: '#1e293b' }, { label: 'ออนไลน์', val: activeCams.length, color: '#16a34a' }, { label: 'ออฟไลน์', val: CAMERAS.length - activeCams.length, color: '#94a3b8' }].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '0.5rem 0.6rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '600' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Camera Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.6rem' }}>
        {CAMERAS.map(cam => (
          <CameraCard key={`${cam.id}-${tick}`} cam={cam} onExpand={setExpandedCam} />
        ))}
      </div>

      {/* Fullscreen */}
      {expandedCam && <FullscreenCamera cam={expandedCam} onClose={() => setExpandedCam(null)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes fadeIn{ from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}
