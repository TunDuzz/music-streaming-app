using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicApp.Domain.Entities;

public class SongArtist
{
    public Guid SongId { get; set; }
    public Song Song { get; set; } = null!;

    public Guid ArtistId { get; set; }
    public Artist Artist { get; set; } = null!;

    public bool IsPrimary { get; set; } = true; // Default to true, false means featured/supporting
}
