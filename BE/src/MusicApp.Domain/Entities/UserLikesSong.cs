namespace MusicApp.Domain.Entities;

public class UserLikesSong
{
    public Guid UserId { get; set; }
    public Guid SongId { get; set; }
    public DateTime LikedAt { get; set; }

    public User User { get; set; } = null!;
    public Song Song { get; set; } = null!;
}
