using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Artists;

public class CreateArtistDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }
    public string? AvatarObjectKey { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }
}
