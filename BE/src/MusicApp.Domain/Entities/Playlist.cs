namespace MusicApp.Domain.Entities;

public class Playlist : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsPublic { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;
    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = new List<PlaylistSong>();
}
