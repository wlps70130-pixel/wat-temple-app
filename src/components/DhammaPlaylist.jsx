import React, { useState, useEffect } from 'react';
import { Play, Pause, Shuffle, ListMusic, Loader2, MoreVertical, ChevronLeft, Heart } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

// ─── EQ Bars ──────────────────────────────────────────
const EqBars = () => (
  <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', width: '20px' }}>
    {[1, 0.5, 0.8].map((h, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '1px', background: '#fff',
        height: `${h * 100}%`,
        animation: `ytmEq${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
      }} />
    ))}
    <style>{`
      @keyframes ytmEq0{0%{height:25%}100%{height:100%}}
      @keyframes ytmEq1{0%{height:100%}100%{height:35%}}
      @keyframes ytmEq2{0%{height:55%}100%{height:90%}}
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
    if (isShuffled) {
      setDisplayTracks(tracks);
      setIsShuffled(false);
    } else {
      setDisplayTracks([...tracks].sort(() => Math.random() - 0.5));
      setIsShuffled(true);
    }
  };

  const handlePlayTrack = (track) => {
    onPlayTrack(track, displayTracks);
  };

  if (!category) return null;

  return (
    <div style={{
      background: '#030303',
      color: '#ffffff',
      margin: 'calc(-1 * var(--content-pad))',
      minHeight: '100vh',
      fontFamily: "'Roboto', 'Prompt', sans-serif",
      paddingBottom: '120px'
    }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', padding: '0 0 2rem', textAlign: 'center', overflow: 'hidden' }}>
        
        {/* Ambient glow BG */}
        <div style={{ position: 'absolute', inset: 0, background: category.bgGradient, opacity: 0.35, filter: 'blur(80px)', transform: 'scale(1.8)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 30%, #030303 90%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1rem 0' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
              <ChevronLeft size={28} />
            </button>
          </div>

          {/* Album Art */}
          <div style={{
            width: '220px', height: '220px', borderRadius: '8px',
            background: category.bgGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '1rem auto 1.5rem',
            boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
          }}>
            <category.icon size={90} color="white" strokeWidth={1} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', padding: '0 1.5rem', marginBottom: '0.3rem' }}>{category.title}</h2>
          <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.25rem' }}>{category.subtitle}</p>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>วัดหลวงพ่อสดฯ • {tracks.length} รายการ</p>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0 1.5rem' }}>
            <button style={{ background: 'none', border: 'none', color: isShuffled ? category.color : '#aaa', cursor: 'pointer', display: 'flex', transition: 'color 0.2s' }} onClick={handleShuffle}>
              <Shuffle size={24} />
            </button>
            
            {/* Big Play Button */}
            <button
              onClick={() => displayTracks.length > 0 && handlePlayTrack(displayTracks[0])}
              style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: '#ffffff', border: 'none', color: '#030303',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 4px 24px rgba(255,255,255,0.3)',
                transition: 'transform 0.15s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={26} fill="#030303" style={{ marginLeft: '3px' }} />
            </button>

            <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex' }}>
              <MoreVertical size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Track List ── */}
      <div style={{ padding: '0 0.75rem' }}>

        {/* "Songs" Label */}
        <div style={{ padding: '0 0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>
            <ListMusic size={13} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            เพลง
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', flexDirection: 'column', gap: '1rem' }}>
            <Loader2 size={32} color={category.color} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#666', fontSize: '0.85rem' }}>กำลังโหลด...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#555' }}>
            <p>ยังไม่มีรายการ</p>
          </div>
        ) : (
          displayTracks.map((track, idx) => {
            const isSelected = currentTrack?.id === track.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.6rem 0.5rem', borderRadius: '6px', cursor: 'pointer',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(255,255,255,0.08)' : 'transparent'; }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '4px',
                    background: isSelected ? category.bgGradient : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    transition: 'background 0.2s'
                  }}>
                    {!isThisPlaying && <category.icon size={22} color={isSelected ? 'white' : '#555'} />}
                    {isThisPlaying && <EqBars />}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.9rem', fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? '#ffffff' : '#e1e1e1',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: '2px'
                  }}>{track.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.subtitle}{track.duration ? ` • ${track.duration}` : ''}
                  </div>
                </div>

                {/* Like + More */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [track.id]: !p[track.id] })); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked[track.id] ? '#ff4e6a' : 'transparent', padding: '0.4rem', display: 'flex' }}
                  >
                    <Heart size={16} fill={liked[track.id] ? '#ff4e6a' : 'none'} color={liked[track.id] ? '#ff4e6a' : '#555'} />
                  </button>
                  <button style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── AI Assistant ── */}
      {currentTrack && (
        <div style={{ margin: '1.5rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ผู้ช่วยอธิบายธรรมะ"
            icon="✨"
            themeColor={category.color}
            buttonText="ขอคำอธิบายเพิ่มเติม"
          />
        </div>
      )}
    </div>
  );
}
