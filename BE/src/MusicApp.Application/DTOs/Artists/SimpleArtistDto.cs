namespace MusicApp.Application.DTOs.Artists;

public class SimpleArtistDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}
