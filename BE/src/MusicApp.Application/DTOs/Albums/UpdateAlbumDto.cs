using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Albums;

public class UpdateAlbumDto
{
    [StringLength(100)]
    public string? Title { get; set; }

    public DateTime? ReleaseDate { get; set; }

    [Url]
    public string? CoverImageUrl { get; set; }
    
    public Guid? ArtistId { get; set; }
}
