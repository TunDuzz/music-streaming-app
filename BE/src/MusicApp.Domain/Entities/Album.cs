using MusicApp.Domain.Enums;

namespace MusicApp.Domain.Entities;

public class Album : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime ReleaseDate { get; set; }
    public AlbumType Type { get; set; } = AlbumType.Album; // Default to Album
    public int TotalTracks { get; set; }

    public Guid ArtistId { get; set; }

    public Artist Artist { get; set; } = null!;
    public ICollection<Song> Songs { get; set; } = new List<Song>();
}
