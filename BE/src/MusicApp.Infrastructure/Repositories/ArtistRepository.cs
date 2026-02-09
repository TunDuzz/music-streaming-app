using Microsoft.EntityFrameworkCore;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using MusicApp.Infrastructure.Data;

namespace MusicApp.Infrastructure.Repositories;

public class ArtistRepository : Repository<Artist>, IArtistRepository
{
    public ArtistRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Artist>> SearchByNameAsync(string name)
    {
        var artists = await _dbSet
            .Where(a => a.Name.Contains(name))
            .ToListAsync();

        return artists
            .OrderByDescending(a => a.Name.StartsWith(name, StringComparison.OrdinalIgnoreCase))
            .ThenBy(a => a.Name)
            .ToList();
    }

    public async Task<Artist?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _dbSet
            .Where(a => a.Id == id)
            .Include(a => a.Albums)
            .Include(a => a.SongArtists)
                .ThenInclude(sa => sa.Song)
                    .ThenInclude(s => s.Album)
            .Include(a => a.SongArtists)
                .ThenInclude(sa => sa.Song)
                    .ThenInclude(s => s.SongArtists)
                        .ThenInclude(sa => sa.Artist)
            .FirstOrDefaultAsync();
    }
}
