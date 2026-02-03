namespace MusicApp.Domain.Entities;

public class Artist : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarObjectKey { get; set; }
    public string? Country { get; set; }
    public int FollowerCount { get; set; }

    public ICollection<Album> Albums { get; set; } = new List<Album>();
    public ICollection<SongArtist> SongArtists { get; set; } = new List<SongArtist>();
    public ICollection<UserFollowsArtist> Followers { get; set; } = new List<UserFollowsArtist>();


}
