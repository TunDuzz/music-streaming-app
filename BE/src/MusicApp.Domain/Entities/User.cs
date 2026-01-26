namespace MusicApp.Domain.Entities;

using MusicApp.Domain.Enums;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public UserRole Role { get; set; } = UserRole.User;

    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    public ICollection<UserFollowsArtist> FollowedArtists { get; set; } = new List<UserFollowsArtist>();
    public ICollection<UserLikesSong> LikedSongs { get; set; } = new List<UserLikesSong>();
}
