import React, { useState, useEffect } from 'react';
import { Play, Shuffle, ListMusic, Loader2, MoreVertical, ChevronLeft, Heart } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

// ─── Modern EQ Bars (Primary Color) ─────────────────────────────
const EqBars = () => (
  <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', width: '20px' }}>
    {[1, 0.5, 0.8].map((_, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '2px', background: 'var(--primary-color)',
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
      color: 'var(--text-main)',
      margin: 0, minHeight: '100vh',
      fontFamily: "'Prompt', sans-serif", paddingBottom: '140px', overflowX: 'hidden',
    }}>

      {/* ── Hero with gradient bleed ── */}
      <div style={{ position: 'relative', paddingBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: category.bgGradient || 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(255, 255, 255, 0))', zIndex: 0, opacity: 0.6 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Back Button */}
          <div style={{ padding: '0 0.5rem 0.5rem' }}>
            <button onClick={onBack} className="glass" style={{ border: '1px solid var(--glass-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary-dark)', padding: 0 }}>
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Album art + Info (Responsive side-by-side) */}
          <div style={{ padding: '0.5rem 0.5rem 1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'nowrap' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '12px', flexShrink: 0,
              background: category.bgGradient || 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--glass-shadow)',
            }}>
              <category.icon size={48} color="white" strokeWidth={1.2} />
            </div>
            <div className="glass glass-card" style={{ flex: 1, minWidth: 0, padding: '0.75rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>เพลย์ลิสต์ธรรมะ</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '0.25rem', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{category.title}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.subtitle}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>
                🛕 วัดหลวงพ่อสดฯ &nbsp;•&nbsp; {tracks.length} รายการ
              </p>
            </div>
          </div>

          {/* Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '1rem' }}>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
              <Heart size={28} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
              <MoreVertical size={28} />
            </button>
            <div style={{ flex: 1 }} />
            {/* Shuffle */}
            <button onClick={handleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffled ? 'var(--primary-dark)' : 'var(--text-muted)', display: 'flex', padding: '0.25rem', transition: 'color 0.2s' }}>
              <Shuffle size={24} />
            </button>
            {/* Play Button */}
            <button
              onClick={() => displayTracks.length > 0 && handlePlayTrack(displayTracks[0])}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--primary-color)', border: '1px solid rgba(255,255,255,0.5)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(234, 179, 8, 0.4)',
                transition: 'transform 0.15s, filter 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
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
            <Loader2 size={32} color="var(--primary-color)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>กำลังโหลด...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
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
              className="glass"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.8rem', cursor: 'pointer',
                background: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--glass-bg)',
                transition: 'transform 0.15s',
                borderRadius: '8px',
                marginBottom: '0.35rem', margin: '0 0.5rem 0.35rem 0.5rem'
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'translateX(2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              {/* # or EQ */}
              <div style={{ width: '20px', textAlign: 'center', flexShrink: 0 }}>
                {isThisPlaying
                  ? <EqBars />
                  : <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)' }}>{idx + 1}</span>
                }
              </div>

              {/* Thumbnail */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '6px', flexShrink: 0,
                background: category.bgGradient || 'var(--primary-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <category.icon size={20} color="white" />
              </div>

              {/* Title + Artist */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.95rem', fontWeight: '600',
                  color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px'
                }}>{track.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.subtitle}
                </div>
              </div>

              {/* Like + Duration + More */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [track.id]: !p[track.id] })); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}
                >
                  <Heart size={20} fill={liked[track.id] ? 'var(--primary-color)' : 'none'} color={liked[track.id] ? 'var(--primary-color)' : 'var(--text-muted)'} />
                </button>
                {track.duration && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>{track.duration}</span>
                )}
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AI Assistant ── */}
      {currentTrack && (
        <div className="glass glass-card" style={{ margin: '1rem 0.5rem', overflow: 'hidden' }}>
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ผู้ช่วยอธิบายธรรมะ"
            icon="✨"
            themeColor="var(--primary-dark)"
            buttonText="ขอคำอธิบายเพิ่มเติม"
            isDarkMode={false}
          />
        </div>
      )}
    </div>
  );
}
