import React, { useState, useEffect } from 'react';
import { Play, Pause, Shuffle, ListMusic, Clock3, Loader2, ChevronDown } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

// ─── EQ Animation Bars ──────────────────────────────────────────
const EqBars = ({ color = '#1db954' }) => (
  <div style={{ display: 'flex', gap: '2px', height: '16px', alignItems: 'flex-end' }}>
    {[1, 0.5, 0.8, 0.3, 0.9].map((h, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '2px',
        background: color,
        height: `${h * 100}%`,
        animation: `eq${i + 1} ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
        transformOrigin: 'bottom'
      }} />
    ))}
    <style>{`
      @keyframes eq1{from{height:20%}to{height:100%}}
      @keyframes eq2{from{height:60%}to{height:30%}}
      @keyframes eq3{from{height:80%}to{height:40%}}
      @keyframes eq4{from{height:30%}to{height:90%}}
      @keyframes eq5{from{height:70%}to{height:20%}}
    `}</style>
  </div>
);

// ─── Album Art Placeholder ───────────────────────────────────────
const AlbumArt = ({ emoji, gradient, size = 48, isPlaying, color }) => (
  <div style={{
    width: `${size}px`, height: `${size}px`, borderRadius: '8px',
    background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: `${size * 0.45}px`, flexShrink: 0, position: 'relative',
    boxShadow: isPlaying ? `0 0 0 2px ${color}, 0 4px 16px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'box-shadow 0.3s'
  }}>
    {emoji}
  </div>
);

export default function DhammaPlaylist({ category, currentTrack, isPlaying, onPlayTrack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    // Add cache busting to ensure we get the latest file
    const urlWithCacheBust = `${SHEET_URL}?t=${new Date().getTime()}`;
    
    Papa.parse(urlWithCacheBust, {
      download: true, 
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsed CSV Data:", results.data);
        const filtered = results.data
          .filter(row => {
            // Check keys defensively in case of BOM (Byte Order Mark) or spaces
            const catKey = Object.keys(row).find(k => k.replace(/^\uFEFF/, '').trim() === 'categoryId');
            const urlKey = Object.keys(row).find(k => k.trim() === 'url');
            
            if (!catKey || !urlKey) return false;
            
            return row[catKey].trim() === category.id && row[urlKey].trim() !== '';
          })
          .map((row, i) => {
            const titleKey = Object.keys(row).find(k => k.replace(/^\uFEFF/, '').trim() === 'title');
            const subKey = Object.keys(row).find(k => k.trim() === 'subtitle');
            const durKey = Object.keys(row).find(k => k.trim() === 'duration');
            const urlKey = Object.keys(row).find(k => k.trim() === 'url');

            return {
              id: `${category.id}-${i}`,
              title: (titleKey && row[titleKey]) ? row[titleKey].trim() : `ไฟล์เสียงธรรม ${i + 1}`,
              subtitle: (subKey && row[subKey]) ? row[subKey].trim() : '',
              duration: (durKey && row[durKey]) ? row[durKey].trim() : '-:--',
              url: (urlKey && row[urlKey]) ? row[urlKey].trim() : '',
            };
          });
        setTracks(filtered);
        setDisplayTracks(filtered);
        setLoading(false);
      },
      error: (error) => {
        console.error("Error loading CSV:", error);
        setLoading(false);
      },
    });
  }, [category]);

  const handleShuffle = () => {
    const shuffled = [...displayTracks].sort(() => Math.random() - 0.5);
    setDisplayTracks(shuffled);
    setIsShuffled(!isShuffled);
  };

  const totalDuration = tracks.length;

  if (!category) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ─── Spotify-style Hero Header ─────────────────────── */}
      <div style={{
        background: category.bgGradient,
        borderRadius: '20px',
        padding: '2rem 1.5rem 1.5rem',
        color: 'white',
        marginBottom: '0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle noise texture overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))', borderRadius: '20px' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Large Album Art */}
          <div style={{
            width: '110px', height: '110px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3.5rem', marginBottom: '1rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <category.icon size={52} />
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '1.5px', opacity: 0.8, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            PLAYLIST
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '0.4rem', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {category.title}
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '1rem' }}>{category.subtitle}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', opacity: 0.8 }}>
            <span>🛕 วัดหลวงพ่อสดฯ</span>
            <span>•</span>
            <span>{totalDuration} เพลง</span>
          </div>
        </div>
      </div>

      {/* ─── Controls Bar ───────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem 0.5rem 0.75rem',
        borderBottom: '1px solid #f1f5f9',
      }}>
        {/* Play All Button */}
        <button
          onClick={() => displayTracks.length > 0 && onPlayTrack(displayTracks[0])}
          style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${category.color}55`,
            transition: 'all 0.2s ease', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Play size={22} color="white" fill="white" style={{ marginLeft: '2px' }} />
        </button>

        {/* Shuffle */}
        <button
          onClick={handleShuffle}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem',
            color: isShuffled ? category.color : '#94a3b8',
            transition: 'color 0.2s', borderRadius: '50%',
          }}
          title="สุ่มเพลง"
        >
          <Shuffle size={20} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Track count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.78rem' }}>
          <ListMusic size={14} />
          <span>{totalDuration} รายการ</span>
        </div>
      </div>

      {/* ─── AI Assistant ───────────────────────────────────── */}
      {currentTrack && (
        <div style={{ margin: '0.75rem 0' }}>
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ผู้ช่วยอธิบายธรรมะ"
            icon="🧘‍♂️"
            themeColor={category.color}
            buttonText="ขอคำอธิบายเพิ่มเติม"
          />
        </div>
      )}

      {/* ─── Track List ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Column Headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 1fr auto',
          gap: '0.75rem', padding: '0.5rem 0.75rem',
          borderBottom: '1px solid #f1f5f9',
          fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8',
          letterSpacing: '0.5px', textTransform: 'uppercase',
          alignItems: 'center',
        }}>
          <span style={{ textAlign: 'center' }}>#</span>
          <span>ชื่อเพลง</span>
          <Clock3 size={13} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '0.75rem' }}>
            <Loader2 size={28} color={category.color} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>กำลังโหลดรายการ...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <ListMusic size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />
            <p style={{ fontSize: '0.9rem' }}>ยังไม่มีรายการในหมวดนี้</p>
          </div>
        ) : (
          displayTracks.map((track, index) => {
            const isSelected = currentTrack?.id === track.id;
            const isThisPlaying = isSelected && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr auto',
                  gap: '0.75rem', padding: '0.7rem 0.75rem',
                  alignItems: 'center', cursor: 'pointer',
                  borderRadius: '10px', margin: '0 -0.25rem',
                  background: isSelected ? `${category.color}12` : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? `${category.color}12` : 'transparent'; }}
              >
                {/* Track Number / EQ */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '20px' }}>
                  {isThisPlaying
                    ? <EqBars color={category.color} />
                    : <span style={{ fontSize: '0.82rem', fontWeight: '600', color: isSelected ? category.color : '#94a3b8' }}>{index + 1}</span>}
                </div>

                {/* Album Art + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <AlbumArt
                    emoji={<category.icon size={20} color={isSelected ? category.color : '#94a3b8'} />}
                    gradient={isSelected ? `${category.color}22` : '#f1f5f9'}
                    size={44}
                    isPlaying={isThisPlaying}
                    color={category.color}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.88rem', fontWeight: isSelected ? '700' : '600',
                      color: isSelected ? category.color : '#1e293b',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.subtitle}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                  {track.duration}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
