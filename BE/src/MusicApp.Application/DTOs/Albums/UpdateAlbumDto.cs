using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Albums;

public class UpdateAlbumDto
{
    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public DateTime? ReleaseDate { get; set; }
}
