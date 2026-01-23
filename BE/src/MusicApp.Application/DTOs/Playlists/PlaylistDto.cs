namespace MusicApp.Application.DTOs.Playlists;

public class PlaylistDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsPublic { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int SongCount { get; set; }
}
