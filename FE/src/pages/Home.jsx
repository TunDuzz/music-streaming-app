import React, { useState, useEffect } from 'react';
import { songsApi, artistsApi } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import './Home.css';

const Home = () => {
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [songsData, artistsData] = await Promise.all([
        songsApi.getAll(),
        artistsApi.getAll(),
      ]);
      setSongs(songsData || []);
      setArtists(artistsData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u. Vui lÃ²ng thá»­ láº¡i sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    playSong(song);
  };

  const handleArtistClick = (artist) => {
    console.log('Artist clicked:', artist);
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
        <button className="btn-primary" onClick={loadData}>
          Thá»­ láº¡i
        </button>
      </div>
    );
  }

  const featuredSongs = songs.slice(0, 6);
  const popularArtists = artists.slice(0, 6);

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>ChÃ o má»«ng trá»Ÿ láº¡i</h1>
        <p>KhÃ¡m phÃ¡ Ã¢m nháº¡c má»›i má»—i ngÃ y</p>
      </div>

      {featuredSongs.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>BÃ i hÃ¡t ná»•i báº­t</h2>
            <button className="btn-secondary">Xem táº¥t cáº£</button>
          </div>
          <div className="song-grid">
            {featuredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={handlePlaySong}
                isPlaying={false}
              />
            ))}
          </div>
        </section>
      )}

      {popularArtists.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Nghá»‡ sÄ© phá»• biáº¿n</h2>
            <button className="btn-secondary">Xem táº¥t cáº£</button>
          </div>
          <div className="artist-grid">
            {popularArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={handleArtistClick}
              />
            ))}
          </div>
        </section>
      )}

      {songs.length > 6 && (
        <section className="section">
          <div className="section-header">
            <h2>Má»›i phÃ¡t hÃ nh</h2>
            <button className="btn-secondary">Xem táº¥t cáº£</button>
          </div>
          <div className="song-grid">
            {songs.slice(6, 12).map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={handlePlaySong}
                isPlaying={false}
              />
            ))}
          </div>
        </section>
      )}

      {songs.length === 0 && artists.length === 0 && (
        <div className="page-empty">
          <p>ChÆ°a cÃ³ ná»™i dung nÃ o. HÃ£y thÃªm bÃ i hÃ¡t vÃ  nghá»‡ sÄ© Ä‘á»ƒ báº¯t Ä‘áº§u!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
