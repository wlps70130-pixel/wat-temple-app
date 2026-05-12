import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  Download,
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
} from 'lucide-react';

function useAudioProgress(audioRef, track) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const syncProgress = () => {
      const audioDuration = audio.duration || 0;
      setCurrentTime(audio.currentTime || 0);
      setDuration(audioDuration);
      setProgress(audioDuration ? (audio.currentTime / audioDuration) * 100 : 0);
    };

    audio.addEventListener('timeupdate', syncProgress);
    audio.addEventListener('loadedmetadata', syncProgress);
    audio.addEventListener('durationchange', syncProgress);
    syncProgress();

    return () => {
      audio.removeEventListener('timeupdate', syncProgress);
      audio.removeEventListener('loadedmetadata', syncProgress);
      audio.removeEventListener('durationchange', syncProgress);
    };
  }, [audioRef, track]);

  const seek = (event) => {
    const audio = audioRef?.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pct = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = pct * duration;
    setProgress(pct * 100);
  };

  const fmt = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return '0:00';
    const minute = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minute}:${second}`;
  };

  return { progress, currentTime, duration, seek, fmt };
}

export default function AudioPlayer({
  track,
  isPlaying,
  onTogglePlay,
  audioRef,
  onNext,
  onPrev,
  tracks = [],
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const { progress, currentTime, duration, seek, fmt } = useAudioProgress(audioRef, track);

  useEffect(() => {
    if (audioRef?.current) audioRef.current.loop = isRepeat;
  }, [audioRef, isRepeat]);

  if (!track) return null;

  const trackGradient = track.categoryGradient || 'linear-gradient(135deg, #0ea5e9, #1d4ed8)';
  const accentColor = track.categoryColor || '#38bdf8';

  return (
    <>
      {!isExpanded && (
        <aside className="dh-mini-player" style={{ '--track-gradient': trackGradient }}>
          <button className="dh-mini-progress" onClick={seek} aria-label="เลื่อนตำแหน่งเสียง">
            <span style={{ width: `${progress}%` }} />
          </button>

          <div className="dh-mini-inner">
            <button className="dh-mini-art" onClick={() => setIsExpanded(true)} aria-label="เปิดเครื่องเล่น">
              <span>ธรรม</span>
            </button>

            <button className="dh-mini-title" onClick={() => setIsExpanded(true)} type="button">
              <strong>{track.title}</strong>
              <small>{track.subtitle}</small>
            </button>

            <button
              onClick={() => setIsLiked((previous) => !previous)}
              className={`dh-player-icon ${isLiked ? 'active' : ''}`}
              type="button"
              aria-label="ถูกใจ"
            >
              <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
            </button>

            <button onClick={onTogglePlay} className="dh-mini-play" type="button" aria-label="เล่นหรือหยุด">
              {isPlaying ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}
            </button>
          </div>
        </aside>
      )}

      {isExpanded && (
        <section className="dh-full-player" style={{ '--track-gradient': trackGradient, '--track-accent': accentColor }}>
          <header className="dh-player-header">
            <button onClick={() => setIsExpanded(false)} className="dh-player-icon" type="button" aria-label="ย่อเครื่องเล่น">
              <ChevronDown size={27} />
            </button>
            <div>
              <span>กำลังฟังธรรม</span>
              <strong>ไม่มีโฆษณา</strong>
            </div>
            <a href={track.url} target="_blank" rel="noreferrer" className="dh-player-icon" aria-label="ดาวน์โหลดเสียงธรรม">
              <Download size={22} />
            </a>
          </header>

          <div className="dh-player-stage">
            <div className="dh-player-art">
              <span>ธรรม</span>
            </div>

            <div className="dh-player-track-copy">
              <div>
                <h2>{track.title}</h2>
                <p>{track.subtitle}</p>
              </div>
              <button
                onClick={() => setIsLiked((previous) => !previous)}
                className={`dh-player-icon ${isLiked ? 'active' : ''}`}
                type="button"
                aria-label="ถูกใจ"
              >
                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="dh-player-timeline">
            <button className="dh-player-bar" onClick={seek} type="button" aria-label="เลื่อนตำแหน่งเสียง">
              <span style={{ width: `${progress}%` }} />
            </button>
            <div className="dh-player-time">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <div className="dh-player-controls">
            <button
              onClick={() => setIsRepeat((previous) => !previous)}
              className={`dh-player-icon ${isRepeat ? 'active' : ''}`}
              type="button"
              aria-label="เล่นซ้ำ"
            >
              <Repeat size={23} />
            </button>
            <button onClick={onPrev} className="dh-skip-btn" type="button" aria-label="รายการก่อนหน้า">
              <SkipBack size={34} fill="currentColor" />
            </button>
            <button onClick={onTogglePlay} className="dh-big-play" type="button" aria-label="เล่นหรือหยุด">
              {isPlaying ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" />}
            </button>
            <button onClick={onNext} className="dh-skip-btn" type="button" aria-label="รายการถัดไป">
              <SkipForward size={34} fill="currentColor" />
            </button>
            <a href={track.url} target="_blank" rel="noreferrer" className="dh-player-icon" aria-label="ดาวน์โหลด">
              <Download size={22} />
            </a>
          </div>

          <div className="dh-up-next">
            <div className="dh-up-next-title">
              <ListMusic size={18} />
              <span>รายการถัดไป</span>
            </div>
            {tracks.length === 0 ? (
              <p>กดเลือกเสียงธรรมในเพลย์ลิสต์เพื่อจัดคิวฟังต่อ</p>
            ) : (
              tracks.map((item) => (
                <div key={item.id} className="dh-up-next-item">
                  <span>{item.title}</span>
                  <small>{item.duration || item.subtitle}</small>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}
