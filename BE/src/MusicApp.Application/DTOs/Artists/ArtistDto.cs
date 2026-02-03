namespace MusicApp.Application.DTOs.Artists;

public class ArtistDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AvatarObjectKey { get; set; }
    public string? Country { get; set; }
    public int FollowerCount { get; set; }

    public List<string> ImageUrls { get; set; } = new List<string>();
}
