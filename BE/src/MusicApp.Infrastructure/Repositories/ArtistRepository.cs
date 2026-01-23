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
        return await _dbSet
            .Where(a => a.Name.Contains(name))
            .ToListAsync();
    }
}
