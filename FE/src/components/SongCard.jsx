import React from 'react';
import { Play, Heart, MoreVertical } from 'lucide-react';
import { formatDuration } from '../services/api';
import './SongCard.css';

const SongCard = ({ song, onPlay, onLike, isPlaying = false }) => {
  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) onPlay(song);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) onLike(song);
  };

  return (
    <div className="song-card card" onClick={handlePlay}>
      <div className="song-card-image">
        <img 
          src={song.coverImageUrl || 'https://via.placeholder.com/200?text=No+Image'} 
          alt={song.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200?text=No+Image';
          }}
        />
        <div className="song-card-overlay">
          <button className="btn-icon play-button" onClick={handlePlay}>
            <Play size={20} fill="currentColor" />
          </button>
        </div>
      </div>
      <div className="song-card-info">
        <h4 className="song-card-title">{song.title}</h4>
        <p className="song-card-artist">{song.artistName}</p>
        <div className="song-card-meta">
          <span>{formatDuration(song.duration)}</span>
          <div className="song-card-actions">
            <button className="btn-icon" onClick={handleLike}>
              <Heart size={16} />
            </button>
            <button className="btn-icon">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
