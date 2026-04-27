import React, { useState, useEffect } from 'react';
import { Play, Shuffle, ListMusic, Loader2, MoreVertical, ChevronLeft, Heart } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

const EqBars = () => (
  <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', width: '20px' }}>
    {[1, 0.5, 0.8].map((_, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '2px', background: 'var(--dh-primary)',
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
    <div className="dh-page">

      {/* ── Hero with gradient bleed ── */}
      <div style={{ position: 'relative', paddingBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: category.bgGradient || 'var(--dh-primary)', zIndex: 0, opacity: 0.2 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Back Button */}
          <div className="dh-topbar" style={{ paddingBottom: 0 }}>
            <button onClick={onBack} className="dh-icon-btn">
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Album art + Info (Responsive) */}
          <div className="dh-hero">
            <div className="dh-hero-art" style={{ background: category.bgGradient || 'var(--dh-primary)' }}>
              <category.icon size={64} color="white" strokeWidth={1.2} />
            </div>
            <div className="dh-hero-info">
              <div className="dh-subheading">เพลย์ลิสต์ธรรมะ</div>
              <h2 className="dh-heading" style={{ marginBottom: '8px' }}>{category.title}</h2>
              <p className="dh-hero-desc">{category.subtitle}</p>
              <p style={{ fontSize: 'var(--dh-small-text)', color: 'var(--dh-text-muted)', opacity: 0.8, margin: 0 }}>
                🛕 วัดหลวงพ่อสดฯ &nbsp;•&nbsp; {tracks.length} รายการ
              </p>
            </div>
          </div>

          {/* Controls Row */}
          <div className="dh-controls-row">
            <button className="dh-icon-btn" style={{ background: 'transparent', border: 'none' }}>
              <Heart size={28} />
            </button>
            <button className="dh-icon-btn" style={{ background: 'transparent', border: 'none' }}>
              <MoreVertical size={28} />
            </button>
            <div style={{ flex: 1 }} />
            {/* Shuffle */}
            <button onClick={handleShuffle} className="dh-icon-btn" style={{ background: 'transparent', border: 'none', color: isShuffled ? 'var(--dh-primary)' : 'var(--dh-text-muted)' }}>
              <Shuffle size={24} />
            </button>
            {/* Play Button */}
            <button
              onClick={() => displayTracks.length > 0 && handlePlayTrack(displayTracks[0])}
              className="dh-play-btn"
            >
              <Play size={32} fill="#fff" style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Track List ── */}
      <div style={{ padding: '0.5rem 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', gap: '1rem' }}>
            <Loader2 size={32} color="var(--dh-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--dh-text-muted)', fontSize: '1rem' }}>กำลังโหลด...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--dh-text-muted)' }}>
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
              className={`dh-glass dh-track-item ${isSelected ? 'active' : ''}`}
            >
              {/* # or EQ */}
              <div style={{ width: '24px', textAlign: 'center', flexShrink: 0 }}>
                {isThisPlaying
                  ? <EqBars />
                  : <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--dh-primary)' : 'var(--dh-text-muted)' }}>{idx + 1}</span>
                }
              </div>

              {/* Thumbnail */}
              <div className="dh-track-thumb" style={{ background: category.bgGradient || 'var(--dh-primary)' }}>
                <category.icon size={20} color="white" />
              </div>

              {/* Title + Artist */}
              <div className="dh-track-info">
                <div className="dh-track-title" style={{ color: isSelected ? 'var(--dh-primary)' : 'var(--dh-text-main)' }}>
                  {track.title}
                </div>
                <div className="dh-track-sub">
                  {track.subtitle}
                </div>
              </div>

              {/* Like + Duration + More */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [track.id]: !p[track.id] })); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}
                >
                  <Heart size={20} fill={liked[track.id] ? 'var(--dh-primary)' : 'none'} color={liked[track.id] ? 'var(--dh-primary)' : 'var(--dh-text-muted)'} />
                </button>
                {track.duration && (
                  <span style={{ fontSize: 'var(--dh-small-text)', color: 'var(--dh-text-muted)', minWidth: '35px', textAlign: 'right' }}>{track.duration}</span>
                )}
                <button style={{ background: 'none', border: 'none', color: 'var(--dh-text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AI Assistant ── */}
      {currentTrack && (
        <div className="dh-glass" style={{ margin: '1rem var(--dh-page-pad)', overflow: 'hidden' }}>
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ผู้ช่วยอธิบายธรรมะ"
            icon="✨"
            themeColor="var(--dh-primary)"
            buttonText="ขอคำอธิบายเพิ่มเติม"
            isDarkMode={false}
          />
        </div>
      )}
    </div>
  );
}
