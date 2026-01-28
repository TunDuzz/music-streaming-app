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

        // Sort in memory to prioritize "Starts With"
        return artists
            .OrderByDescending(a => a.Name.StartsWith(name, StringComparison.OrdinalIgnoreCase))
            .ThenBy(a => a.Name)
            .ToList();
    }
}
