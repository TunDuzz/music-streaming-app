using System.ComponentModel.DataAnnotations;
using MusicApp.Domain.Enums;

namespace MusicApp.Application.DTOs.Albums;

public class CreateAlbumDto
{
    [Required]
    public AlbumType Type { get; set; } = AlbumType.Album;
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    [Required]
    public DateTime ReleaseDate { get; set; }

    [Required]
    public Guid ArtistId { get; set; }
}
