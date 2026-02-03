using System.ComponentModel.DataAnnotations;

namespace MusicApp.API.Requests;

public class CreateSongRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public int Duration { get; set; } = 0;

    public string? Lyrics { get; set; }

    [Required]
    public IFormFile AudioFile { get; set; }

    public IFormFile? CoverFile { get; set; }

    [Required]
    public List<Guid> ArtistIds { get; set; } = new();

    public Guid? AlbumId { get; set; }

    public Guid? GenreId { get; set; }
}
