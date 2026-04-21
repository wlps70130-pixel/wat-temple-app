import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, MoreVertical, Shuffle, Repeat, Heart, ThumbsDown } from 'lucide-react';

// ─── Real Audio Progress Hook ──────────────────────────────────────────
function useAudioProgress(audioRef, isPlaying, track) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioRef, track]);

  const seek = (e) => {
    const audio = audioRef?.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
    setProgress(pct * 100);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return { progress, currentTime, duration, seek, fmt };
}

export default function AudioPlayer({ track, isPlaying, onTogglePlay, audioRef, onNext, onPrev, tracks = [] }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { progress, currentTime, duration, seek, fmt } = useAudioProgress(audioRef, isPlaying, track);

  if (!track) return null;

  const trackGradient = track.categoryGradient || 'linear-gradient(135deg, #1a1a2e, #16213e)';
  const trackColor = track.categoryColor || '#f59e0b';

  return (
    <>
      {/* ── Collapsed Mini Bar (shown when not expanded) ── */}
      {!isExpanded && (
        <div
          style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 'var(--app-max-width)',
            background: '#1f1f1f',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            zIndex: 200,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Thin Progress Line */}
          <div style={{ height: '2px', background: 'rgba(255,255,255,0.15)', position: 'relative', cursor: 'pointer' }} onClick={seek}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '2px', width: `${progress}%`, background: '#ffffff', transition: 'width 0.3s linear' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1rem', gap: '0.75rem' }}>
            {/* Thumbnail */}
            <div
              onClick={() => setIsExpanded(true)}
              style={{
                width: '40px', height: '40px', borderRadius: '4px',
                background: trackGradient, flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.1rem'
              }}
            >🛕</div>

            {/* Title - Scrolling if long */}
            <div
              onClick={() => setIsExpanded(true)}
              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.subtitle}
              </div>
            </div>

            {/* Mini Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button onClick={() => setIsLiked(p => !p)} style={{ background: 'none', border: 'none', color: isLiked ? '#ff4e6a' : '#888', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                <Heart size={20} fill={isLiked ? '#ff4e6a' : 'none'} />
              </button>
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                <SkipForward size={22} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded Full-Screen Player ── */}
      {isExpanded && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: '#030303',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Roboto', 'Prompt', sans-serif",
          color: 'white',
          maxWidth: 'var(--app-max-width)',
          left: '50%', transform: 'translateX(-50%)',
          width: '100%',
          overflow: 'hidden',
        }}>
          {/* Ambient BG */}
          <div style={{
            position: 'absolute', inset: 0, background: trackGradient,
            opacity: 0.25, filter: 'blur(80px)', transform: 'scale(2)', zIndex: 0
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #030303 60%)', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 1.5rem', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.2rem', marginBottom: '1rem' }}>
              <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <ChevronDown size={28} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#aaa', fontWeight: '700' }}>กำลังฟัง</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <MoreVertical size={24} />
              </button>
            </div>

            {/* Large Album Art */}
            <div style={{
              width: '100%', maxWidth: '320px', aspectRatio: '1',
              borderRadius: '12px', background: trackGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 80px ${trackColor}30`,
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              transform: isPlaying ? 'scale(1.04)' : 'scale(0.95)',
              fontSize: '5rem'
            }}>
              🛕
            </div>

            {/* Track Info + Heart */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.title}
                </div>
                <div style={{ fontSize: '1rem', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.subtitle}
                </div>
              </div>
              <button onClick={() => setIsLiked(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: isLiked ? '#ff4e6a' : '#888', display: 'flex', flexShrink: 0 }}>
                <Heart size={26} fill={isLiked ? '#ff4e6a' : 'none'} />
              </button>
            </div>

            {/* Progress Bar */}
            <div
              onClick={seek}
              style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer', position: 'relative', marginBottom: '0.5rem' }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, height: '4px', width: `${progress}%`, background: '#ffffff', borderRadius: '4px', transition: 'width 0.3s linear' }} />
              <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: `${progress}%`, width: '14px', height: '14px', background: 'white', borderRadius: '50%', boxShadow: '0 0 6px rgba(0,0,0,0.4)' }} />
            </div>

            {/* Time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '2rem' }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>

            {/* Main Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <Shuffle size={24} />
              </button>
              <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <SkipBack size={30} fill="currentColor" />
              </button>
              <button
                onClick={onTogglePlay}
                style={{
                  width: '68px', height: '68px', borderRadius: '50%',
                  background: 'white', border: 'none', color: '#030303',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,255,255,0.3)',
                  transition: 'transform 0.15s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" style={{ marginLeft: '3px' }} />}
              </button>
              <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <SkipForward size={30} fill="currentColor" />
              </button>
              <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <Repeat size={24} />
              </button>
            </div>

            {/* Up Next preview */}
            {tracks.length > 0 && (
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ลำดับถัดไป</div>
                {tracks.slice(0, 2).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: trackGradient, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🛕</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#777' }}>{t.subtitle}</div>
                    </div>
                    <MoreVertical size={18} color="#666" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
