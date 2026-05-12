import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Download,
  Heart,
  ListMusic,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Search,
  Shuffle,
} from 'lucide-react';
import Papa from 'papaparse';
import AiAssistant from './AiAssistant';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

function EqBars() {
  return (
    <span className="dh-eq-bars" aria-label="กำลังเล่น">
      <i />
      <i />
      <i />
    </span>
  );
}

function getCleanValue(row, keyName) {
  const key = Object.keys(row).find((item) => item.replace(/^\uFEFF/, '').trim() === keyName);
  return key && typeof row[key] === 'string' ? row[key].trim() : '';
}

function normalizeDuration(value) {
  if (!value) return '';
  return value.replace('.', ':');
}

export default function DhammaPlaylist({ category, currentTrack, isPlaying, onPlayTrack, onBack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [liked, setLiked] = useState({});
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!category) return;

    let isMounted = true;
    setLoading(true);

    Papa.parse(`${SHEET_URL}&t=${Date.now()}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!isMounted) return;

        const filtered = results.data
          .filter((row) => getCleanValue(row, 'categoryId') === category.id && getCleanValue(row, 'url'))
          .map((row, index) => ({
            id: `${category.id}-${index}`,
            title: getCleanValue(row, 'title') || `เสียงธรรม ${index + 1}`,
            subtitle: getCleanValue(row, 'subtitle') || category.title,
            duration: normalizeDuration(getCleanValue(row, 'duration')),
            url: getCleanValue(row, 'url'),
            categoryGradient: category.bgGradient,
            categoryColor: category.color,
          }));

        setTracks(filtered);
        setDisplayTracks(filtered);
        setLoading(false);
      },
      error: () => {
        if (!isMounted) return;
        setTracks([]);
        setDisplayTracks([]);
        setLoading(false);
      },
    });

    return () => {
      isMounted = false;
    };
  }, [category]);

  const filteredTracks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return displayTracks;
    return displayTracks.filter((track) =>
      `${track.title} ${track.subtitle}`.toLowerCase().includes(keyword)
    );
  }, [displayTracks, query]);

  const totalDurationLabel = useMemo(() => {
    const durations = tracks
      .map((track) => track.duration)
      .filter(Boolean)
      .map((duration) => duration.split(':').map(Number))
      .filter(([minute, second]) => Number.isFinite(minute) && Number.isFinite(second));
    if (durations.length === 0) return '';
    const totalSeconds = durations.reduce((sum, [minute, second]) => sum + minute * 60 + second, 0);
    const hour = Math.floor(totalSeconds / 3600);
    const minute = Math.round((totalSeconds % 3600) / 60);
    return hour ? `${hour} ชม. ${minute} นาที` : `${minute} นาที`;
  }, [tracks]);

  const handleShuffle = () => {
    if (isShuffled) {
      setDisplayTracks(tracks);
      setIsShuffled(false);
      return;
    }
    setDisplayTracks([...tracks].sort(() => Math.random() - 0.5));
    setIsShuffled(true);
  };

  const handlePlayTrack = (track) => onPlayTrack(track, filteredTracks);

  if (!category) return null;

  const CategoryIcon = category.icon;

  return (
    <div className="dh-page dh-playlist-page">
      <section className="dh-playlist-hero" style={{ '--playlist-gradient': category.bgGradient }}>
        <div className="dh-topbar dh-playlist-topbar">
          <button onClick={onBack} className="dh-icon-btn" aria-label="กลับไปหมวดเสียงธรรม">
            <ChevronLeft size={24} />
          </button>
          <button className="dh-icon-btn" aria-label="เมนูเพิ่มเติม">
            <MoreVertical size={23} />
          </button>
        </div>

        <div className="dh-hero">
          <div className="dh-hero-art" style={{ background: category.bgGradient }}>
            <CategoryIcon size={70} color="white" strokeWidth={1.4} />
          </div>

          <div className="dh-hero-info">
            <span className="dh-subheading">เพลย์ลิสต์เสียงธรรม</span>
            <h1 className="dh-heading">{category.title}</h1>
            <p className="dh-hero-desc">{category.subtitle}</p>
            <div className="dh-playlist-meta">
              <span>วัดหลวงพ่อสดธรรมกายาราม</span>
              <span>{tracks.length} รายการ</span>
              {totalDurationLabel && <span>{totalDurationLabel}</span>}
            </div>
          </div>
        </div>

        <div className="dh-controls-row">
          <button className="dh-soft-btn" type="button">
            <Heart size={20} />
            บันทึก
          </button>
          <button
            onClick={handleShuffle}
            className={`dh-soft-btn ${isShuffled ? 'active' : ''}`}
            type="button"
          >
            <Shuffle size={20} />
            สุ่มเล่น
          </button>
          <button
            onClick={() => filteredTracks.length > 0 && handlePlayTrack(filteredTracks[0])}
            className="dh-play-btn"
            type="button"
            disabled={filteredTracks.length === 0}
            aria-label="เล่นทั้งหมด"
          >
            <Play size={32} fill="currentColor" />
          </button>
        </div>
      </section>

      <div className="dh-playlist-toolbar">
        <label className="dh-glass dh-search-bar dh-track-search">
          <Search size={20} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาในเพลย์ลิสต์นี้..."
            className="dh-search-input"
          />
        </label>
      </div>

      <section className="dh-track-list">
        {loading ? (
          <div className="dh-empty-state">
            <Loader2 size={34} className="dh-spin" />
            <span>กำลังโหลดเสียงธรรม...</span>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="dh-empty-state">
            <ListMusic size={46} />
            <span>ไม่พบรายการเสียงธรรมในหมวดนี้</span>
          </div>
        ) : (
          filteredTracks.map((track, index) => {
            const isSelected = currentTrack?.id === track.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePlayTrack(track);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`dh-track-item ${isSelected ? 'active' : ''}`}
              >
                <span className="dh-track-index">
                  {isThisPlaying ? <EqBars /> : index + 1}
                </span>

                <span className="dh-track-thumb" style={{ background: category.bgGradient }}>
                  {isThisPlaying ? <Pause size={19} fill="currentColor" /> : <CategoryIcon size={20} />}
                </span>

                <span className="dh-track-info">
                  <strong className="dh-track-title">{track.title}</strong>
                  <small className="dh-track-sub">{track.subtitle}</small>
                </span>

                <span className="dh-track-actions" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className={`dh-inline-icon ${liked[track.id] ? 'active' : ''}`}
                    onClick={() => setLiked((previous) => ({ ...previous, [track.id]: !previous[track.id] }))}
                    aria-label="บันทึกรายการโปรด"
                  >
                    <Heart size={19} fill={liked[track.id] ? 'currentColor' : 'none'} />
                  </button>
                  {track.duration && <span className="dh-duration">{track.duration}</span>}
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="dh-inline-icon"
                    aria-label={`ดาวน์โหลด ${track.title}`}
                  >
                    <Download size={18} />
                  </a>
                </span>
              </div>
            );
          })
        )}
      </section>

      {currentTrack && (
        <section className="dh-ai-panel">
          <AiAssistant
            mode="dhamma"
            contextData={`กำลังฟัง: "${currentTrack.title}" (${currentTrack.subtitle || ''})`}
            title="พระอาจารย์ AI"
            subtitle="ช่วยสรุปใจความและอธิบายธรรมะจากรายการที่กำลังฟัง"
            icon="✨"
            themeColor="var(--dh-primary)"
            buttonText="ขอคำอธิบายเพิ่มเติม"
            isDarkMode={false}
          />
        </section>
      )}
    </div>
  );
}
