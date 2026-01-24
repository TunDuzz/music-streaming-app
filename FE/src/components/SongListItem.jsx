import React from 'react';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { formatDuration } from '../services/api';
import './SongListItem.css';

const SongListItem = ({ song, index, onPlay, onLike, isPlaying = false, isCurrent = false }) => {
  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) onPlay(song);
  };

  return (
    <div className={`song-list-item ${isCurrent ? 'active' : ''}`} onClick={handlePlay}>
      <div className="song-list-item-index">
        {isCurrent && isPlaying ? (
          <Pause size={16} />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>
      <div className="song-list-item-image">
        <img 
          src={song.coverImageUrl || 'https://via.placeholder.com/50?text=No+Image'} 
          alt={song.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
          }}
        />
      </div>
      <div className="song-list-item-info">
        <h4 className="song-list-item-title">{song.title}</h4>
        <p className="song-list-item-artist">{song.artistName}</p>
      </div>
      <div className="song-list-item-album">
        {song.albumTitle || '-'}
      </div>
      <div className="song-list-item-duration">
        {formatDuration(song.duration)}
      </div>
      <div className="song-list-item-actions">
        <button className="btn-icon" onClick={(e) => {
          e.stopPropagation();
          if (onLike) onLike(song);
        }}>
          <Heart size={16} />
        </button>
        <button className="btn-icon">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default SongListItem;
