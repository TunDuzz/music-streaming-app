namespace MusicApp.Application.DTOs.Songs;

public class SongDto : BaseDto
{
    public string Title { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string? Lyrics { get; set; }
    public string AudioFileUrl { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public int PlayCount { get; set; }
    public int LikeCount { get; set; }
    public Guid ArtistId { get; set; }
    public string ArtistName { get; set; } = string.Empty;
    public Guid? AlbumId { get; set; }
    public string? AlbumTitle { get; set; }
    public Guid? GenreId { get; set; }
    public string? GenreName { get; set; }
}
