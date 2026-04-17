import React, { useState, useEffect } from 'react';
import { Play, Pause, Disc3, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

// เมื่อได้ลิงก์ Publish to web (CSV) จาก Google Sheet แล้ว ให้นำมาแปะทับที่นี่ได้เลยครับ
const SHEET_URL = '/dhamma_tracks.csv';

export default function DhammaPlaylist({ category, currentTrack, isPlaying, onPlayTrack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    
    setLoading(true);
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        // Filter rows that match the current category and have a valid URL
        const filteredTracks = results.data
          .filter(row => row.categoryId === category.id && row.url && row.title)
          .map((row, index) => ({
            id: `${category.id}-${index}`, // Generate a safe ID
            title: row.title,
            subtitle: row.subtitle || '',
            duration: row.duration || '-:--',
            url: row.url
          }));
          
        setTracks(filteredTracks);
        setLoading(false);
      },
      error: (error) => {
        console.error("Error fetching Dhamma Tracks CSV:", error);
        setLoading(false);
      }
    });
  }, [category]);

  if (!category) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Premium Header */}
      <div style={{ 
        background: category.bgGradient,
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <category.icon size={40} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{category.title}</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>{category.subtitle}</p>
        </div>
      </div>

      {/* Track List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>รายการเสียงธรรม</h3>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
            <Loader2 size={32} color={category.color} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            ไม่มีรายการเสียงธรรมในหมวดหมู่นี้
          </div>
        ) : (
          tracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
            const isThisTrackSelected = currentTrack && currentTrack.id === track.id;
            
            return (
              <div 
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className="glass"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  gap: '1rem',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  background: isThisTrackSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--glass-bg)',
                  border: isThisTrackSelected ? `1px solid ${category.color}` : '1px solid var(--glass-border)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ color: isThisTrackSelected ? category.color : 'var(--text-muted)', fontSize: '1.1rem', width: '20px', textAlign: 'center' }}>
                  {isThisTrackPlaying ? (
                     <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', justifyContent: 'center' }}>
                       <div style={{ width: '3px', height: '100%', background: category.color, animation: 'bounce 1s infinite ease-in-out' }} />
                       <div style={{ width: '3px', height: '60%', background: category.color, animation: 'bounce 1s infinite ease-in-out 0.2s' }} />
                       <div style={{ width: '3px', height: '80%', background: category.color, animation: 'bounce 1s infinite ease-in-out 0.4s' }} />
                     </div>
                  ) : (
                     <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{index + 1}</span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    color: isThisTrackSelected ? category.color : 'var(--text-main)',
                    marginBottom: '0.1rem'
                  }}>
                    {track.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{track.subtitle}</span>
                  </div>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.8 }}>
                  {track.duration}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* CSS for EQ animation & Spin */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
