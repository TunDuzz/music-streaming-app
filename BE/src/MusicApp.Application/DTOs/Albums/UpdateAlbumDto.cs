using System.ComponentModel.DataAnnotations;
using MusicApp.Domain.Enums;

namespace MusicApp.Application.DTOs.Albums;

public class UpdateAlbumDto
{
    public AlbumType? Type { get; set; }
    [StringLength(100)]
    public string? Title { get; set; }

    public DateTime? ReleaseDate { get; set; }

    [Url]
    public string? CoverImageUrl { get; set; }
    
    public Guid? ArtistId { get; set; }
}
