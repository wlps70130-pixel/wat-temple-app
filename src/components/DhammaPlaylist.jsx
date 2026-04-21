import React, { useState, useEffect } from 'react';
import { Play, Shuffle, ListMusic, Loader2, MoreVertical, ChevronLeft, Heart } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

// ─── Spotify-style EQ Bars (green) ─────────────────────────────
const EqBars = () => (
  <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', width: '20px' }}>
    {[1, 0.5, 0.8].map((_, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '1px', background: '#1db954',
        animation: `sEq${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
        transformOrigin: 'bottom'
      }} />
    ))}
    <style>{`
      @keyframes sEq0{0%{height:25%}100%{height:100%}}
      @keyframes sEq1{0%{height:100%}100%{height:35%}}
      @keyframes sEq2{0%{height:55%}100%{height:90%}}
    `}</style>
  </div>
);

export default function DhammaPlaylist({ category, currentTrack, isPlaying, onPlayTrack, onBack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [liked, setLiked] = useState({});

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    Papa.parse(`${SHEET_URL}&t=${Date.now()}`, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        const filtered = results.data
          .filter(row => {
            const catKey = Object.keys(row).find(k => k.replace(/^\uFEFF/, '').trim() === 'categoryId');
            const urlKey = Object.keys(row).find(k => k.trim() === 'url');
            if (!catKey || !urlKey || typeof row[catKey] !== 'string' || typeof row[urlKey] !== 'string') return false;
            return row[catKey].trim() === category.id && row[urlKey].trim() !== '';
          })
          .map((row, i) => {
            const titleKey = Object.keys(row).find(k => k.replace(/^\uFEFF/, '').trim() === 'title');
            const subKey = Object.keys(row).find(k => k.trim() === 'subtitle');
            const durKey = Object.keys(row).find(k => k.trim() === 'duration');
            const urlKey = Object.keys(row).find(k => k.trim() === 'url');
            return {
              id: `${category.id}-${i}`,
              title: (titleKey && typeof row[titleKey] === 'string' && row[titleKey].trim()) ? row[titleKey].trim() : `ไฟล์เสียงธรรม ${i + 1}`,
              subtitle: (subKey && typeof row[subKey] === 'string' && row[subKey].trim()) ? row[subKey].trim() : category.title,
              duration: (durKey && typeof row[durKey] === 'string') ? row[durKey].trim() : '',
              url: (urlKey && typeof row[urlKey] === 'string') ? row[urlKey].trim() : '',
              categoryGradient: category.bgGradient,
              categoryColor: category.color,
            };
          });
        setTracks(filtered);
        setDisplayTracks(filtered);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, [category]);

  const handleShuffle = () => {
    if (isShuffled) { setDisplayTracks(tracks); setIsShuffled(false); }
    else { setDisplayTracks([...tracks].sort(() => Math.random() - 0.5)); setIsShuffled(true); }
  };

  const handlePlayTrack = (track) => onPlayTrack(track, displayTracks);

  if (!category) return null;

  return (
    <div style={{
      background: '#121212', color: '#ffffff',
      margin: 'calc(-1 * var(--content-pad))', minHeight: '100vh',
      fontFamily: "'Prompt', sans-serif", paddingBottom: '140px', overflowX: 'hidden',
    }}>

      {/* ── Hero with gradient bleed ── */}
      <div style={{ position: 'relative', paddingBottom: '1.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: category.bgGradient, zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 40%, #121212 100%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Back Button */}
          <div style={{ padding: '1rem 1.2rem 0' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <ChevronLeft size={28} />
            </button>
          </div>

          {/* Album art + Info (Spotify side-by-side on small screens) */}
          <div style={{ padding: '0.5rem 1.2rem 1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-end' }}>
            <div style={{
              width: '130px', height: '130px', borderRadius: '4px', flexShrink: 0,
              background: category.bgGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              <category.icon size={60} color="white" strokeWidth={1.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.65)', marginBottom: '0.3rem' }}>Playlist</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', lineHeight: 1.2, marginBottom: '0.35rem', wordBreak: 'break-word' }}>{category.title}</h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginBottom: '0.15rem' }}>{category.subtitle}</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                🛕 วัดหลวงพ่อสดฯ &nbsp;•&nbsp; {tracks.length} รายการ
              </p>
            </div>
          </div>

          {/* Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.2rem', gap: '1rem' }}>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', display: 'flex', padding: '0.25rem' }}>
              <Heart size={28} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', display: 'flex', padding: '0.25rem' }}>
              <MoreVertical size={28} />
            </button>
            <div style={{ flex: 1 }} />
            {/* Shuffle */}
            <button onClick={handleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffled ? '#1db954' : '#b3b3b3', display: 'flex', padding: '0.25rem', transition: 'color 0.2s' }}>
              <Shuffle size={24} />
            </button>
            {/* Spotify Green Play */}
            <button
              onClick={() => displayTracks.length > 0 && handlePlayTrack(displayTracks[0])}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#1db954', border: 'none', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(29,185,84,0.5)',
                transition: 'transform 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1ed760'; e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1db954'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Play size={24} fill="#000" style={{ marginLeft: '3px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Track List ── */}
      <div style={{ padding: '0.5rem 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', gap: '1rem' }}>
            <Loader2 size={32} color="#1db954" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>กำลังโหลด...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#555' }}>
            <ListMusic size={48} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>ยังไม่มีรายการในหมวดนี้</p>
          </div>
        ) : displayTracks.map((track, idx) => {
          const isSelected = currentTrack?.id === track.id;
          const isThisPlaying = isSelected && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 1.2rem', cursor: 'pointer',
                background: isSelected ? 'rgba(29,185,84,0.08)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(29,185,84,0.08)' : 'transparent'; }}
            >
              {/* # or EQ */}
              <div style={{ width: '20px', textAlign: 'center', flexShrink: 0 }}>
                {isThisPlaying
                  ? <EqBars />
                  : <span style={{ fontSize: '0.88rem', color: isSelected ? '#1db954' : '#b3b3b3' }}>{idx + 1}</span>
                }
              </div>

              {/* Thumbnail */}
              <div style={{
                width: '42px', height: '42px', borderRadius: '4px', flexShrink: 0,
                background: category.bgGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <category.icon size={18} color="white" />
              </div>

              {/* Title + Artist */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.92rem', fontWeight: '500',
                  color: isSelected ? '#1db954' : '#ffffff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px'
                }}>{track.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.subtitle}
                </div>
              </div>

              {/* Like + Duration + More */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [track.id]: !p[track.id] })); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}
                >
                  <Heart size={16} fill={liked[track.id] ? '#1db954' : 'none'} color={liked[track.id] ? '#1db954' : '#666'} />
                </button>
                {track.duration && (
                  <span style={{ fontSize: '0.75rem', color: '#b3b3b3', minWidth: '30px', textAlign: 'right' }}>{track.duration}</span>
                )}
                <button style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}>
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AI Assistant ── */}
      {currentTrack && (
        <div style={{ margin: '1rem 1.2rem', background: '#282828', borderRadius: '8px', overflow: 'hidden' }}>
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ผู้ช่วยอธิบายธรรมะ"
            icon="✨"
            themeColor="#1db954"
            buttonText="ขอคำอธิบายเพิ่มเติม"
          />
        </div>
      )}
    </div>
  );
}
