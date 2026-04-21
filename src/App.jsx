import React, { useState, useRef, useEffect } from 'react';
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


function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Audio State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Playback error:", e));
    }
  };

  const playTrack = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
  };

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

  return (
    <div className="app-wrapper" style={{ 
      padding: isDhammaView ? '0' : 'var(--content-pad)',
      paddingBottom: currentTrack ? '100px' : (isDhammaView ? '0' : '6rem'),
      background: isDhammaView ? '#030303' : 'transparent',
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
          onPlayTrack={playTrack}
          onBack={handleBack}
        />
      ) : currentView === 'amulet' ? (
        <AmuletViewer />
      ) : currentView === 'cctv' ? (
        <CCTVViewer />
      ) : null}

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack ? currentTrack.url : ''} 
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Persistent Audio Player (Spotify style) */}
      {currentTrack && (
        <AudioPlayer 
          track={currentTrack} 
          isPlaying={isPlaying} 
          onTogglePlay={togglePlay} 
        />
      )}
    </div>
  );
}

export default App;
