import React, { useState, useEffect } from 'react';
import { songsApi } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import SongListItem from '../components/SongListItem';
import './Library.css';

const Library = () => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const songsData = await songsApi.getAll();
      setSongs(songsData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch bÃ i hÃ¡t. Vui lÃ²ng thá»­ láº¡i sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy);
    const sorted = [...songs].sort((a, b) => {
      switch (newSortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artistName.localeCompare(b.artistName);
        case 'duration':
          return a.duration - b.duration;
        case 'playCount':
          return b.playCount - a.playCount;
        case 'likeCount':
          return b.likeCount - a.likeCount;
        default:
          return 0;
      }
    });
    setSongs(sorted);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Äang táº£i...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button className="btn-primary" onClick={loadSongs}>
          Thá»­ láº¡i
        </button>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>ThÆ° viá»‡n cá»§a báº¡n</h1>
        <p>{songs.length} bÃ i hÃ¡t</p>
      </div>

      {songs.length > 0 ? (
        <>
          <div className="library-controls">
            <div className="library-sort">
              <label>Sáº¯p xáº¿p theo:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="library-sort-select"
              >
                <option value="title">TiÃªu Ä‘á»</option>
                <option value="artist">Nghá»‡ sÄ©</option>
                <option value="duration">Thá»i lÆ°á»£ng</option>
                <option value="playCount">LÆ°á»£t phÃ¡t</option>
                <option value="likeCount">LÆ°á»£t thÃ­ch</option>
              </select>
            </div>
          </div>

          <div className="library-songs">
            <div className="library-songs-header">
              <div className="library-songs-header-item">#</div>
              <div className="library-songs-header-item">TiÃªu Ä‘á»</div>
              <div className="library-songs-header-item">Album</div>
              <div className="library-songs-header-item">Thá»i lÆ°á»£ng</div>
              <div className="library-songs-header-item"></div>
            </div>
            <div className="library-songs-list">
              {songs.map((song, index) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  index={index}
                  onPlay={playSong}
                  isPlaying={isPlaying}
                  isCurrent={currentSong?.id === song.id}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="page-empty">
          <p>ThÆ° viá»‡n cá»§a báº¡n Ä‘ang trá»‘ng</p>
          <p className="text-secondary">ThÃªm bÃ i hÃ¡t Ä‘á»ƒ báº¯t Ä‘áº§u nghe nháº¡c</p>
        </div>
      )}
    </div>
  );
};

export default Library;
