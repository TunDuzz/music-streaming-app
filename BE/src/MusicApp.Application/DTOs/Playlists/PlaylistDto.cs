using MusicApp.Application.DTOs.Songs;

namespace MusicApp.Application.DTOs.Playlists;

public class PlaylistDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsPublic { get; set; }
    public bool IsFixed { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int SongCount { get; set; }
    public ICollection<SongDto> Songs { get; set; } = new List<SongDto>();
    public List<Guid> SongIds { get; set; } = new List<Guid>();
}
