import React from 'react';
import { User } from 'lucide-react';
import './ArtistCard.css';

const ArtistCard = ({ artist, onClick }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="artist-card card" onClick={() => onClick && onClick(artist)}>
      <div className="artist-card-avatar">
        {artist.avatarUrl && !imageError ? (
          <img 
            src={artist.avatarUrl} 
            alt={artist.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="artist-card-placeholder">
            <User size={48} />
          </div>
        )}
      </div>
      <div className="artist-card-info">
        <h4 className="artist-card-name">{artist.name}</h4>
        <p className="artist-card-followers">{artist.followerCount.toLocaleString()} ngÆ°á»i theo dÃµi</p>
      </div>
    </div>
  );
};

export default ArtistCard;
