namespace MusicApp.Domain.Entities;

public class UserFollowsArtist
{
    public Guid UserId { get; set; }
    public Guid ArtistId { get; set; }
    public DateTime FollowedAt { get; set; }

    public User User { get; set; } = null!;
    public Artist Artist { get; set; } = null!;
}
