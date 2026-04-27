import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, MoreVertical, Shuffle, Repeat, Heart, MessageCircle, Share2, Download, ListMusic } from 'lucide-react';

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

  const trackGradient = track.categoryGradient || 'linear-gradient(135deg, #1e3a8a, #312e81)';
  const trackColor = track.categoryColor || '#facc15';

  return (
    <>
      <style>{`
        @keyframes antigravity {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.6; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
        }
        @keyframes slowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .space-particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(8px);
          animation: antigravity 8s ease-in-out infinite;
        }
        .lyrics-scroll {
          animation: scrollUp 20s linear infinite;
        }
        @keyframes scrollUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>

      {/* ── Collapsed Mini Bar (shown when not expanded) ── */}
      {!isExpanded && (
        <div
          style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 'var(--app-max-width)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 200,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Thin Progress Line */}
          <div style={{ height: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer' }} onClick={seek}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '2px', width: `${progress}%`, background: '#38bdf8', transition: 'width 0.3s linear' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', gap: '0.75rem' }}>
            {/* Thumbnail */}
            <div
              onClick={() => setIsExpanded(true)}
              style={{
                width: '44px', height: '44px', borderRadius: '8px',
                background: trackGradient, flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >🛕</div>

            {/* Title */}
            <div
              onClick={() => setIsExpanded(true)}
              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'rgba(255,255,255,0.95)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#fef08a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.subtitle}
              </div>
            </div>

            {/* Mini Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => setIsLiked(p => !p)} style={{ background: 'none', border: 'none', color: isLiked ? '#facc15' : 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                <Heart size={22} fill={isLiked ? '#facc15' : 'none'} />
              </button>
              <button onClick={onTogglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded Full-Screen Player ── */}
      {isExpanded && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'linear-gradient(160deg, #020617 0%, #0f172a 40%, #2e1065 100%)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Prompt', sans-serif",
          color: 'white',
          maxWidth: 'var(--app-max-width)',
          left: '50%', transform: 'translateX(-50%)',
          width: '100%',
          overflow: 'hidden',
          transition: 'all 0.4s ease-in-out'
        }}>
          {/* Antigravity Effects */}
          <div className="space-particle" style={{ width: '150px', height: '150px', background: 'rgba(14, 165, 233, 0.15)', top: '10%', left: '-20%' }} />
          <div className="space-particle" style={{ width: '200px', height: '200px', background: 'rgba(234, 179, 8, 0.1)', top: '40%', right: '-30%', animationDelay: '2s' }} />
          <div className="space-particle" style={{ width: '100px', height: '100px', background: 'rgba(192, 132, 252, 0.15)', bottom: '20%', left: '10%', animationDelay: '4s' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 1.5rem', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setIsExpanded(false)} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', padding: '0.5rem', display: 'flex', transition: 'background 0.2s' }}>
                <ChevronDown size={28} />
              </button>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>กำลังฟังธรรมะ</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fef08a' }}>หลวงพ่อสด</div>
              </div>
              <button style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <MoreVertical size={24} />
              </button>
            </div>

            {/* Large 16:9 Album Art */}
            <div style={{
              width: '100%', aspectRatio: '16/9',
              borderRadius: '20px', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 60px rgba(234, 179, 8, 0.15), 0 0 60px rgba(14, 165, 233, 0.15)',
              transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              transform: isPlaying ? 'scale(1.02)' : 'scale(0.98)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Abstract minimalist art */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '-20%', width: '150%', height: '50%', background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.3) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))', zIndex: 1, animation: 'antigravity 6s infinite ease-in-out' }}>🧘‍♂️</span>
            </div>

            {/* Track Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'rgba(255,255,255,0.95)', marginBottom: '0.4rem', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {track.title}
                </div>
                <div style={{ fontSize: '1.05rem', color: '#fef08a', fontWeight: '500', opacity: 0.9 }}>
                  {track.subtitle}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              onClick={seek}
              style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', cursor: 'pointer', position: 'relative', marginBottom: '0.75rem' }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, height: '6px', width: \`\${progress}%\`, background: '#38bdf8', borderRadius: '6px', transition: 'width 0.3s linear', boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)' }} />
              <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: \`\${progress}%\`, width: '16px', height: '16px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)' }} />
            </div>

            {/* Time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontWeight: '500' }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>

            {/* Main Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 1rem' }}>
              <button style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <Shuffle size={26} />
              </button>
              <button onClick={onPrev} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <SkipBack size={36} fill="currentColor" />
              </button>
              <button
                onClick={onTogglePlay}
                style={{
                  width: '76px', height: '76px', borderRadius: '50%',
                  background: 'radial-gradient(circle at top left, #fef08a, #ca8a04)', border: 'none', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 0 30px rgba(250, 204, 21, 0.4), inset 0 4px 10px rgba(255,255,255,0.5)',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" style={{ marginLeft: '4px' }} />}
              </button>
              <button onClick={onNext} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <SkipForward size={36} fill="currentColor" />
              </button>
              <button style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <Repeat size={26} />
              </button>
            </div>

            {/* Actions Row (Like, Comment, Share, Download) */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '2rem' }}>
              {[
                { icon: Heart, label: 'ถูกใจ', color: isLiked ? '#facc15' : 'rgba(255,255,255,0.6)', action: () => setIsLiked(!isLiked), fill: isLiked ? '#facc15' : 'none' },
                { icon: MessageCircle, label: 'ความคิดเห็น', color: 'rgba(255,255,255,0.6)', fill: 'none' },
                { icon: Share2, label: 'แชร์', color: 'rgba(255,255,255,0.6)', fill: 'none' },
                { icon: Download, label: 'ดาวน์โหลด', color: 'rgba(255,255,255,0.6)', fill: 'none' }
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem', borderRadius: '50%', display: 'flex' }}>
                    <btn.icon size={22} color={btn.color} fill={btn.fill} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Lyrics / Up Next Frosted Glass Panel */}
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', 
              borderRadius: '20px', padding: '1.2rem', marginTop: 'auto',
              border: '1px solid rgba(255,255,255,0.1)', flex: 1, minHeight: '120px',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', cursor: 'pointer' }}>บทธรรมะ (Lyrics)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>รายการถัดไป</div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Scrolling Lyrics Effect */}
                <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', fontWeight: '500', textAlign: 'center', paddingTop: '1rem' }}>
                  <div className="lyrics-scroll">
                    "จิตที่ฝึกดีแล้ว นำสุขมาให้"<br/><br/>
                    "การให้ธรรมะ ชนะการให้ทั้งปวง"<br/><br/>
                    "ผู้ใดเห็นธรรม ผู้นั้นเห็นเรา"<br/><br/>
                  </div>
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,16,101,0) 0%, rgba(30,16,101,0) 60%, rgba(15,23,42,1) 100%)', pointerEvents: 'none' }} />
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
