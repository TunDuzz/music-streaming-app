namespace MusicApp.Domain.Entities;

public class Song : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public int Duration { get; set; } // Duration in seconds
    public string? Lyrics { get; set; }
    public string AudioFileUrl { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public int PlayCount { get; set; }
    public int LikeCount { get; set; }

    public Guid? AlbumId { get; set; } // Nullable for singles
    public Guid? GenreId { get; set; } // Nullable initially to avoid breaking changes, or Required if we migrate data

    public Album? Album { get; set; }
    public Genre? Genre { get; set; }
    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = new List<PlaylistSong>();
    public ICollection<UserLikesSong> LikedByUsers { get; set; } = new List<UserLikesSong>();
    
    // Many-to-Many Relationship
    public ICollection<SongArtist> SongArtists { get; set; } = new List<SongArtist>();

    public string? AudioObjectKey { get; set; }
    public string? CoverObjectKey { get; set; }
}
