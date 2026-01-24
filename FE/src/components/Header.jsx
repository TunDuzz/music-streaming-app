import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-logo">
          MusicApp
        </Link>
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`header-nav-item ${isActive('/') ? 'active' : ''}`}
          >
            Trang chá»§
          </Link>
          <Link 
            to="/library" 
            className={`header-nav-item ${isActive('/library') ? 'active' : ''}`}
          >
            ThÆ° viá»‡n
          </Link>
        </nav>
      </div>
      <div className="header-right">
        <form className="header-search" onSubmit={handleSearch}>
          <Search className="header-search-icon" size={18} />
          <input
            type="search"
            placeholder="TÃ¬m kiáº¿m bÃ i hÃ¡t, nghá»‡ sÄ©..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="header-user">
          <div className="header-user-avatar">
            <User size={18} />
          </div>
          <span className="header-user-name">NgÆ°á»i dÃ¹ng</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
