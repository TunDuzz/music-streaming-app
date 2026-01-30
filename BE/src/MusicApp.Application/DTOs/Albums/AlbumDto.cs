namespace MusicApp.Application.DTOs.Albums;

public class AlbumDto : BaseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime ReleaseDate { get; set; }
    public int TotalTracks { get; set; }
    public Guid ArtistId { get; set; }
    public string ArtistName { get; set; } = string.Empty;
    public string Type { get; set; } = "Album";
}
