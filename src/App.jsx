import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DateTimeWeather from './components/DateTimeWeather';
import MenuGrid from './components/MenuGrid';
import DailyActivities from './components/DailyActivities';
import NewsCarousel from './components/NewsCarousel';
import SanghaChart from './components/SanghaChart';
import DhammaMenu from './components/DhammaMenu';
import DhammaPlaylist from './components/DhammaPlaylist';
import AudioPlayer from './components/AudioPlayer';
import EnergyDashboard from './components/EnergyDashboard';
import AmuletViewer from './components/AmuletViewer';
import CCTVViewer from './components/CCTVViewer';
import TaskTracker from './components/TaskTracker';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Audio State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]); // tracks in current playlist
  const audioRef = useRef(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Playback error:", e));
    }
  }, [isPlaying, currentTrack]);

  const playTrack = useCallback((track, trackList) => {
    if (trackList) setQueue(trackList);
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
  }, [currentTrack, togglePlay]);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const next = queue[idx + 1] || queue[0];
    setCurrentTrack(next);
  }, [currentTrack, queue]);

  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const prev = queue[idx - 1] || queue[queue.length - 1];
    setCurrentTrack(prev);
  }, [currentTrack, queue]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error("Playback error:", e);
          setIsPlaying(false);
        });
    }
  }, [currentTrack]);

  const handleBack = () => {
    if (currentView === 'dhammaplaylist') {
      setCurrentView('dhamma');
      setSelectedCategory(null);
    } else {
      setCurrentView('dashboard');
    }
  };

  const isDhammaView = currentView === 'dhamma' || currentView === 'dhammaplaylist';

  // Next tracks in queue (those after current)
  const queueAfterCurrent = (() => {
    if (!currentTrack || queue.length === 0) return [];
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    return queue.slice(idx + 1, idx + 3);
  })();

  return (
    <div className="app-wrapper" style={{
      padding: isDhammaView ? '0' : 'var(--content-pad)',
      paddingBottom: currentTrack ? '80px' : (isDhammaView ? '0' : '6rem'),
      background: isDhammaView ? '#f4f9fc' : 'transparent',
      minHeight: '100vh'
    }}>
      {!isDhammaView && <Header onBack={currentView !== 'dashboard' ? handleBack : undefined} />}

      {currentView === 'dashboard' ? (
        <>
          <DateTimeWeather />
          <MenuGrid onMenuClick={setCurrentView} />
          <NewsCarousel />
          <DailyActivities />
        </>
      ) : currentView === 'sangha' ? (
        <SanghaChart />
      ) : currentView === 'energy' ? (
        <EnergyDashboard />
      ) : currentView === 'dhamma' ? (
        <DhammaMenu
          onBack={handleBack}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentView('dhammaplaylist');
          }}
        />
      ) : currentView === 'dhammaplaylist' ? (
        <DhammaPlaylist
          category={selectedCategory}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={(track, trackList) => playTrack(track, trackList)}
          onBack={handleBack}
        />
      ) : currentView === 'amulet' ? (
        <AmuletViewer />
      ) : currentView === 'cctv' ? (
        <CCTVViewer />
      ) : currentView === 'tasks' ? (
        <TaskTracker />
      ) : null}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.url : ''}
        onEnded={playNext}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* YouTube Music style Player */}
      {currentTrack && (
        <AudioPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          audioRef={audioRef}
          onNext={playNext}
          onPrev={playPrev}
          tracks={queueAfterCurrent}
        />
      )}
    </div>
  );
}

export default App;
