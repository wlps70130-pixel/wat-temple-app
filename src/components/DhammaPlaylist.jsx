import React, { useState, useEffect } from 'react';
import { Play, Shuffle, ListMusic, Loader2, MoreVertical, ChevronLeft, Heart } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

// ─── Modern EQ Bars (Sky Blue) ─────────────────────────────
const EqBars = () => (
  <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', width: '20px' }}>
    {[1, 0.5, 0.8].map((_, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '2px', background: '#0ea5e9',
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
      background: '#f4f9fc', color: '#1e293b',
      margin: 0, minHeight: '100vh',
      fontFamily: "'Prompt', sans-serif", paddingBottom: '140px', overflowX: 'hidden',
    }}>

      {/* ── Hero with gradient bleed ── */}
      <div style={{ position: 'relative', paddingBottom: '1.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: category.bgGradient, zIndex: 0, opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(244,249,252,0) 40%, #f4f9fc 100%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Back Button */}
          <div style={{ padding: '1rem 1.2rem 0' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <ChevronLeft size={28} />
            </button>
          </div>

          {/* Album art + Info (Responsive side-by-side) */}
          <div style={{ padding: '0.5rem 1.2rem 1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{
              width: 'clamp(100px, 25vw, 150px)', height: 'clamp(100px, 25vw, 150px)', borderRadius: '16px', flexShrink: 0,
              background: category.bgGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}>
              <category.icon size={64} color="white" strokeWidth={1.2} />
            </div>
            <div style={{ flex: 1, minWidth: '220px', paddingBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#0284c7', marginBottom: '0.3rem' }}>เพลย์ลิสต์ธรรมะ</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginBottom: '0.35rem', wordBreak: 'break-word' }}>{category.title}</h2>
              <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.25rem' }}>{category.subtitle}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                🛕 วัดหลวงพ่อสดฯ &nbsp;•&nbsp; {tracks.length} รายการ
              </p>
            </div>
          </div>

          {/* Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.2rem', gap: '1rem' }}>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.25rem' }}>
              <Heart size={28} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.25rem' }}>
              <MoreVertical size={28} />
            </button>
            <div style={{ flex: 1 }} />
            {/* Shuffle */}
            <button onClick={handleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffled ? '#0ea5e9' : '#64748b', display: 'flex', padding: '0.25rem', transition: 'color 0.2s' }}>
              <Shuffle size={24} />
            </button>
            {/* Play Button */}
            <button
              onClick={() => displayTracks.length > 0 && handlePlayTrack(displayTracks[0])}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#0ea5e9', border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(14,165,233,0.3)',
                transition: 'transform 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Play size={28} fill="#fff" style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Track List ── */}
      <div style={{ padding: '0.5rem 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', gap: '1rem' }}>
            <Loader2 size={32} color="#0ea5e9" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#64748b', fontSize: '1rem' }}>กำลังโหลด...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <ListMusic size={48} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1rem' }}>ยังไม่มีรายการในหมวดนี้</p>
          </div>
        ) : displayTracks.map((track, idx) => {
          const isSelected = currentTrack?.id === track.id;
          const isThisPlaying = isSelected && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.8rem 1.2rem', cursor: 'pointer',
                background: isSelected ? 'rgba(14,165,233,0.08)' : 'transparent',
                transition: 'background 0.15s',
                borderRadius: '12px', margin: '0 0.5rem'
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(14,165,233,0.08)' : 'transparent'; }}
            >
              {/* # or EQ */}
              <div style={{ width: '24px', textAlign: 'center', flexShrink: 0 }}>
                {isThisPlaying
                  ? <EqBars />
                  : <span style={{ fontSize: '1rem', color: isSelected ? '#0ea5e9' : '#94a3b8' }}>{idx + 1}</span>
                }
              </div>

              {/* Thumbnail */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '8px', flexShrink: 0,
                background: category.bgGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <category.icon size={22} color="white" />
              </div>

              {/* Title + Artist */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '1.05rem', fontWeight: '500',
                  color: isSelected ? '#0ea5e9' : '#0f172a',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px'
                }}>{track.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.subtitle}
                </div>
              </div>

              {/* Like + Duration + More */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [track.id]: !p[track.id] })); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}
                >
                  <Heart size={20} fill={liked[track.id] ? '#0ea5e9' : 'none'} color={liked[track.id] ? '#0ea5e9' : '#cbd5e1'} />
                </button>
                {track.duration && (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', minWidth: '35px', textAlign: 'right' }}>{track.duration}</span>
                )}
                <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AI Assistant ── */}
      {currentTrack && (
        <div style={{ margin: '1rem 1.2rem', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ผู้ช่วยอธิบายธรรมะ"
            icon="✨"
            themeColor="#0ea5e9"
            buttonText="ขอคำอธิบายเพิ่มเติม"
            isDarkMode={false}
          />
        </div>
      )}
    </div>
  );
}
