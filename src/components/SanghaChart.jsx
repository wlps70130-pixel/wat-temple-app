import React, { useState, useEffect } from 'react';
import { User, Users, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

// เมื่อได้ลิงก์ Publish to web (CSV) จาก Google Sheet แล้ว ให้นำมาแปะทับที่นี่ได้เลยครับ
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/11hBRfyMG6g2qhhSSPceu1_LvmBTrp0aOkmjculEM-r0/export?format=csv';

export default function SanghaChart() {
  const [data, setData] = useState({ abbot: null, viceAbbots: [], assistants: [], monks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data.filter(row => row.role && row.name);
        
        const parsedData = {
          abbot: rows.find(r => r.role === 'abbot') || { title: 'เจ้าอาวาส', name: '-' },
          viceAbbots: rows.filter(r => r.role === 'viceAbbot'),
          assistants: rows.filter(r => r.role === 'assistant'),
          monks: rows.filter(r => r.role === 'monk')
        };
        
        setData(parsedData);
        setLoading(false);
      },
      error: (error) => {
        console.error("Error fetching Sangha CSV:", error);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Loader2 size={32} color="#eab308" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>กำลังเชื่อมต่อแฟ้มข้อมูล...</p>
      </div>
    );
  }

  // Helper function to render avatar or default User icon
  const renderAvatar = (monk, size = 24, defaultColor = "#d97706") => {
    if (monk && monk.image && monk.image.trim() !== "") {
      return (
        <img 
          src={monk.image} 
          alt={monk.name} 
          style={{
            width: `${size * 1.5}px`,
            height: `${size * 1.5}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '0.5rem',
            border: `2px solid ${defaultColor}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      );
    }
    return <User size={size} color={defaultColor} style={{ marginBottom: '0.5rem' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
      <h2 className="section-title" style={{ paddingLeft: '0.5rem', justifyContent: 'center' }}>
        <Users size={24} color="#d97706" />
        ผังคณะสงฆ์วัดหลวงพ่อสดฯ
      </h2>

      {/* Abbot */}
      {data.abbot && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="glass glass-card" style={{ width: '80%', textAlign: 'center', borderTop: '4px solid #eab308' }}>
            <div style={{ padding: '0.5rem 0', display: 'flex', justifyContent: 'center' }}>
              {data.abbot.image ? renderAvatar(data.abbot, 40, '#ca8a04') : (
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', marginBottom: '0.5rem' }}>
                  <User size={40} color="#ca8a04" />
                </div>
              )}
            </div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{data.abbot.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{data.abbot.name}</p>
          </div>
        </div>
      )}

      {data.viceAbbots.length > 0 && (
        <>
          <div style={{ width: '2px', height: '1.5rem', background: '#cbd5e1', margin: '-1rem auto 0' }} />
          {/* Vice Abbots */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '0 0.5rem' }}>
            {data.viceAbbots.map((monk, i) => (
              <div key={i} className="glass glass-card" style={{ flex: '1 1 40%', textAlign: 'center', borderTop: '3px solid #f59e0b', padding: '1rem 0.5rem' }}>
                {renderAvatar(monk, 24, '#d97706')}
                <h3 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{monk.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{monk.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {data.assistants.length > 0 && (
        <>
          <div style={{ width: '2px', height: '1.5rem', background: '#cbd5e1', margin: '-1rem auto 0' }} />
          {/* Assistants */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0 0.5rem' }}>
            {data.assistants.map((monk, i) => (
              <div key={i} className="glass glass-card" style={{ textAlign: 'center', borderTop: '2px solid #fbbf24', padding: '1rem 0.25rem' }}>
                {renderAvatar(monk, 20, '#d97706')}
                <h3 style={{ color: 'var(--text-main)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{monk.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{monk.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {data.monks.length > 0 && (
        <>
          <div style={{ width: '2px', height: '1.5rem', background: '#cbd5e1', margin: '-1rem auto 0' }} />
          {/* Ordinary Monks header */}
          <div style={{ textAlign: 'center', marginBottom: '-0.5rem' }}>
            <h3 style={{ color: 'var(--primary-dark)', fontSize: '1rem' }}>พระภิกษุสามเณร (พระลูกวัด)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ทั้งหมด {data.monks.length} รูป</p>
          </div>

          {/* Ordinary Monks List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0 0.5rem' }}>
            {data.monks.map((monk, index) => (
              <div key={index} className="glass glass-card" style={{ padding: '0.75rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {monk.image && monk.image.trim() !== "" ? (
                   <img src={monk.image} alt={monk.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                   <Users size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', lineHeight: '1.2' }}>{monk.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
