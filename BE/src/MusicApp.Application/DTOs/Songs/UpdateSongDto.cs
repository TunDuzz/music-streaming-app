using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Songs;

public class UpdateSongDto
{
    [StringLength(200)]
    public string? Title { get; set; }

    [Range(1, 7200)]
    public int? Duration { get; set; }

    public string? Lyrics { get; set; }

    public string? AudioFileUrl { get; set; }

    public string? CoverImageUrl { get; set; }

    public Guid? ArtistId { get; set; }

    public Guid? AlbumId { get; set; }
    
    public Guid? GenreId { get; set; }
}
