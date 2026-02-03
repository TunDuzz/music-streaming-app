using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Songs;

public class CreateSongDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(1, 7200)] // Max 2 hours
    public int Duration { get; set; }

    public string? Lyrics { get; set; }

    [Required]
    public string AudioFileUrl { get; set; } = string.Empty;
    public string? AudioObjectKey { get; set; }

    public string? CoverImageUrl { get; set; }
    public string? CoverObjectKey { get; set; }

    [Required]
    public List<Guid> ArtistIds { get; set; } = new List<Guid>();

    public Guid? AlbumId { get; set; }

    public Guid? GenreId { get; set; }
}
