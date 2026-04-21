import React, { useState, useEffect } from 'react';
import { Play, Pause, Shuffle, ListMusic, Clock3, Loader2, MoreVertical, Share2, Download, ChevronLeft } from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

// ─── YTM EQ Animation Bars ──────────────────────────────────────
const EqBars = ({ color = '#ffffff' }) => (
  <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'flex-end', justifyContent: 'center', width: '24px' }}>
    {[1, 0.5, 0.8].map((h, i) => (
      <div key={i} style={{
        width: '3px', borderRadius: '1px',
        background: color,
        height: `${h * 100}%`,
        animation: `eqYTM${i + 1} ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
        transformOrigin: 'bottom'
      }} />
    ))}
    <style>{`
      @keyframes eqYTM1{0%{height:30%}100%{height:100%}}
      @keyframes eqYTM2{0%{height:100%}100%{height:40%}}
      @keyframes eqYTM3{0%{height:50%}100%{height:90%}}
    `}</style>
  </div>
);

// ─── Square Album Art ───────────────────────────────────────
const AlbumArt = ({ icon: Icon, gradient, size = 48 }) => (
  <div style={{
    width: `${size}px`, height: `${size}px`, borderRadius: '4px', // YTM uses slightly rounded squares
    background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', flexShrink: 0
  }}>
    <Icon size={size * 0.5} />
  </div>
);

export default function DhammaPlaylist({ category, currentTrack, isPlaying, onPlayTrack, onBack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    const urlWithCacheBust = `${SHEET_URL}&t=${new Date().getTime()}`;
    
    Papa.parse(urlWithCacheBust, {
      download: true, 
      header: true,
      skipEmptyLines: true,
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
              subtitle: (subKey && typeof row[subKey] === 'string') ? row[subKey].trim() : category.title,
              duration: (durKey && typeof row[durKey] === 'string') ? row[durKey].trim() : '',
              url: (urlKey && typeof row[urlKey] === 'string') ? row[urlKey].trim() : '',
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
    if (isShuffled) {
      setDisplayTracks(tracks);
      setIsShuffled(false);
    } else {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setDisplayTracks(shuffled);
      setIsShuffled(true);
    }
  };

  if (!category) return null;

  return (
    <div style={{ 
      background: '#030303', // YTM pitch black
      color: '#ffffff',
      margin: 'calc(-1 * var(--content-pad))',
      minHeight: '100vh',
      fontFamily: "'Roboto', 'Prompt', sans-serif",
      paddingBottom: '100px'
    }}>

      {/* ─── YTM Hero Header ─────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '3rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: '1rem', left: '1rem', zIndex: 10,
            background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
            width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)'
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Ambient Blurred Background */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: category.bgGradient,
          opacity: 0.3, filter: 'blur(60px)', 
          transform: 'scale(1.5)', zIndex: 0 
        }} />
        
        {/* Gradient Fade to Black */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, transparent 20%, #030303 95%)',
          zIndex: 0 
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Large Album Art */}
          <div style={{
            width: '240px', height: '240px', borderRadius: '8px',
            background: category.bgGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            marginBottom: '1.5rem'
          }}>
            <category.icon size={100} color="white" strokeWidth={1} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {category.title}
          </h2>
          <p style={{ fontSize: '1rem', color: '#aaaaaa', marginBottom: '1.5rem' }}>
            วัดหลวงพ่อสดฯ • {tracks.length} รายการ
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px' }}>
            <button
              onClick={() => displayTracks.length > 0 && onPlayTrack(displayTracks[0])}
              style={{
                flex: 1, height: '48px', borderRadius: '24px',
                background: '#ffffff', color: '#030303',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.95rem', fontWeight: '600', transition: 'transform 0.1s'
              }}
              onActive={e => e.currentTarget.style.transform = 'scale(0.96)'}
            >
              <Play size={20} fill="#030303" /> ฟังเลย
            </button>
            <button
              onClick={handleShuffle}
              style={{
                flex: 1, height: '48px', borderRadius: '24px',
                background: 'rgba(255,255,255,0.1)', color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.95rem', fontWeight: '600'
              }}
            >
              <Shuffle size={20} color={isShuffled ? category.color : '#ffffff'} /> สุ่ม
            </button>
          </div>
        </div>
      </div>

      {/* ─── Track List ─────────────────────────────────────── */}
      <div style={{ padding: '0 1rem', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
            <Loader2 size={32} color={category.color || "#fff"} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : displayTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#aaaaaa' }}>
            <p>ไม่มีรายการ</p>
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
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem 0.5rem', cursor: 'pointer',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                {/* Album Art / EQ */}
                <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                  <AlbumArt icon={category.icon} gradient={category.bgGradient} size={48} />
                  {isThisPlaying && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px'
                    }}>
                      <EqBars color="#ffffff" />
                    </div>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{
                    fontSize: '0.95rem', fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? '#ffffff' : '#f1f1f1',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: '2px'
                  }}>
                    {track.title}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', color: '#aaaaaa', 
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                  }}>
                    {track.subtitle} {track.duration ? `• ${track.duration}` : ''}
                  </div>
                </div>

                {/* Options Icon */}
                <div style={{ padding: '0.5rem', color: '#aaaaaa' }}>
                  <MoreVertical size={20} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── AI Assistant (Dark Mode Theme) ─────────────────── */}
      {currentTrack && (
        <div style={{ padding: '1rem', margin: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
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
