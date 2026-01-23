using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Artists;

public class UpdateArtistDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(1000)]
    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }
}
