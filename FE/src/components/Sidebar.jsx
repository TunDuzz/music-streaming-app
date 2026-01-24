import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Search, Music, Heart, Clock } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const mainNavItems = [
    { path: '/', icon: Home, label: 'Trang chá»§' },
    { path: '/search', icon: Search, label: 'TÃ¬m kiáº¿m' },
    { path: '/library', icon: Library, label: 'ThÆ° viá»‡n cá»§a báº¡n' },
  ];

  const libraryNavItems = [
    { path: '/library/liked', icon: Heart, label: 'BÃ i hÃ¡t Ä‘Ã£ thÃ­ch' },
    { path: '/library/recent', icon: Clock, label: 'Nghe gáº§n Ä‘Ã¢y' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className="sidebar-nav-item-icon">
                  <Icon size={20} />
                </div>
                <span className="sidebar-nav-item-text">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="sidebar-nav-section">
          <div className="sidebar-nav-section-title">ThÆ° viá»‡n</div>
          {libraryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className="sidebar-nav-item-icon">
                  <Icon size={20} />
                </div>
                <span className="sidebar-nav-item-text">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
