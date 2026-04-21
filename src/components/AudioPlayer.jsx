import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Headphones } from 'lucide-react';

export default function AudioPlayer({ track, isPlaying, onTogglePlay }) {
  // We use a simulated progress bar for the UI since we haven't wired it to the actual audio current time yet
  // In a robust implementation, this would read from audioRef.current.currentTime
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) return 0;
          return p + 0.5; // slow mock progress
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, track]);

  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
  }, [track]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px', // var(--app-max-width)
      background: '#212121', // YTM Player Dark Grey
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      padding: '1rem',
      paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
      color: 'white',
      zIndex: 100,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      {/* Progress Bar Container */}
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'var(--primary-color)', 
          borderRadius: '2px',
          transition: 'width 1s linear'
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <Headphones size={20} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {track.title}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {track.subtitle}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <SkipBack size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={onTogglePlay}
            style={{ 
              background: 'white', 
              border: 'none', 
              color: '#1e293b', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
          </button>

          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
