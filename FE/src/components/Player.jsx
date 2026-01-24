import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { formatDuration } from '../services/api';
import './Player.css';

const Player = () => {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    currentSong,
    volume,
    togglePlayPause,
    seek,
    setVolumeLevel,
  } = usePlayer();

  const progressRef = useRef(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showVolume, setShowVolume] = React.useState(false);


  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seek(newTime);
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolumeLevel(volume || 0.5);
      setIsMuted(false);
    } else {
      setIsMuted(true);
      setVolumeLevel(0);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="player">
        <div className="player-info">
          <div className="player-image">
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              <Play size={24} />
            </div>
          </div>
          <div className="player-details">
            <div className="player-title">ChÆ°a cÃ³ bÃ i hÃ¡t nÃ o</div>
            <div className="player-artist">Chá»n má»™t bÃ i hÃ¡t Ä‘á»ƒ phÃ¡t</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player">
      <audio ref={audioRef} />
      
      <div className="player-info">
        <div className="player-image">
          <img 
            src={currentSong.coverImageUrl || 'https://via.placeholder.com/56?text=No+Image'} 
            alt={currentSong.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/56?text=No+Image';
            }}
          />
        </div>
        <div className="player-details">
          <div className="player-title">{currentSong.title}</div>
          <div className="player-artist">{currentSong.artistName}</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="player-controls-main">
          <button className="player-button">
            <Shuffle size={18} />
          </button>
          <button className="player-button">
            <SkipBack size={20} />
          </button>
          <button className="player-button player-button-primary" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button className="player-button">
            <SkipForward size={20} />
          </button>
          <button className="player-button">
            <Repeat size={18} />
          </button>
        </div>
        <div className="player-controls-secondary">
          <div 
            className="player-progress" 
            ref={progressRef}
            onClick={handleProgressClick}
          >
            <div 
              className="player-progress-bar" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="player-progress-time">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>
      </div>

      <div className="player-actions">
        <div 
          className="player-volume"
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button className="player-button" onClick={handleVolumeToggle}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {showVolume && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolumeLevel(newVolume);
                setIsMuted(newVolume === 0);
              }}
              style={{
                position: 'absolute',
                bottom: '60px',
                width: '100px',
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                zIndex: 1000,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
