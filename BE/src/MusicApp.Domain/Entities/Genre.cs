namespace MusicApp.Domain.Entities;

public class Genre : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Song> Songs { get; set; } = new List<Song>();
}
