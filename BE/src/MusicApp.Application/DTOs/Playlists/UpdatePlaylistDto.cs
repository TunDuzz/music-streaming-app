using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Playlists;

public class UpdatePlaylistDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public bool? IsPublic { get; set; }
}
