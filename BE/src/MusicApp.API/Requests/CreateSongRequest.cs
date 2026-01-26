using System.ComponentModel.DataAnnotations;

namespace MusicApp.API.Requests;

public class CreateSongRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(1, 7200)]
    public int Duration { get; set; }

    public string? Lyrics { get; set; }

    [Required]
    public IFormFile AudioFile { get; set; }

    public IFormFile? CoverFile { get; set; }

    [Required]
    public Guid ArtistId { get; set; }

    public Guid? AlbumId { get; set; }
}
