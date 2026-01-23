using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Playlists;

public class CreatePlaylistDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public bool IsPublic { get; set; } = true;

    [Required]
    public Guid UserId { get; set; }
}
