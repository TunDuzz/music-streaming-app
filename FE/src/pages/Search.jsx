import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { songsApi, artistsApi } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import SongListItem from '../components/SongListItem';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { playSong } = usePlayer();
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [allSongs, setAllSongs] = useState([]);
  const [allArtists, setAllArtists] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const loadAllData = async () => {
    try {
      const [songsData, artistsData] = await Promise.all([
        songsApi.getAll(),
        artistsApi.getAll(),
      ]);
      setAllSongs(songsData || []);
      setAllArtists(artistsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const performSearch = React.useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      setSongs([]);
      setArtists([]);
      return;
    }

    const lowerQuery = searchTerm.toLowerCase();
    
    const filteredSongs = allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artistName.toLowerCase().includes(lowerQuery) ||
        (song.albumTitle && song.albumTitle.toLowerCase().includes(lowerQuery))
    );

    const filteredArtists = allArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(lowerQuery) ||
        (artist.bio && artist.bio.toLowerCase().includes(lowerQuery))
    );

    setSongs(filteredSongs);
    setArtists(filteredArtists);
  }, [allSongs, allArtists]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      performSearch(value);
    } else {
      setSongs([]);
      setArtists([]);
      setSearchParams({});
    }
  };

  const hasResults = songs.length > 0 || artists.length > 0;
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>TÃ¬m kiáº¿m</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <SearchIcon className="search-icon" size={20} />
          <input
            type="search"
            placeholder="Báº¡n muá»‘n nghe gÃ¬?"
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
          />
        </form>
      </div>

      {!hasQuery ? (
        <div className="search-empty">
          <SearchIcon size={64} className="search-empty-icon" />
          <h2>TÃ¬m kiáº¿m bÃ i hÃ¡t, nghá»‡ sÄ©, album...</h2>
          <p>Nháº­p tá»« khÃ³a vÃ o Ã´ tÃ¬m kiáº¿m Ä‘á»ƒ báº¯t Ä‘áº§u</p>
        </div>
      ) : loading ? (
        <div className="page-loading">
          <div className="spinner" />
          <p>Äang tÃ¬m kiáº¿m...</p>
        </div>
      ) : !hasResults ? (
        <div className="search-no-results">
          <p>KhÃ´ng tÃ¬m tháº¥y káº¿t quáº£ cho "{searchQuery}"</p>
          <p className="text-secondary">Thá»­ tÃ¬m kiáº¿m vá»›i tá»« khÃ³a khÃ¡c</p>
        </div>
      ) : (
        <div className="search-results">
          <div className="search-tabs">
            <button
              className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Táº¥t cáº£ ({songs.length + artists.length})
            </button>
            <button
              className={`search-tab ${activeTab === 'songs' ? 'active' : ''}`}
              onClick={() => setActiveTab('songs')}
            >
              BÃ i hÃ¡t ({songs.length})
            </button>
            <button
              className={`search-tab ${activeTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              Nghá»‡ sÄ© ({artists.length})
            </button>
          </div>

          {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
            <section className="search-section">
              <h2>BÃ i hÃ¡t</h2>
              <div className="search-songs-list">
                {songs.map((song, index) => (
                  <SongListItem
                    key={song.id}
                    song={song}
                    index={index}
                    onPlay={playSong}
                    isCurrent={false}
                  />
                ))}
              </div>
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <section className="search-section">
              <h2>Nghá»‡ sÄ©</h2>
              <div className="search-artists-grid">
                {artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onClick={(artist) => {
                      console.log('Artist clicked:', artist);
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
