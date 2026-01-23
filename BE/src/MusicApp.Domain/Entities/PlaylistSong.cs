namespace MusicApp.Domain.Entities;

public class PlaylistSong
{
    public Guid PlaylistId { get; set; }
    public Guid SongId { get; set; }
    public int Position { get; set; } // Order of song in playlist
    public DateTime AddedAt { get; set; }

    public Playlist Playlist { get; set; } = null!;
    public Song Song { get; set; } = null!;
}
