using Microsoft.EntityFrameworkCore;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using MusicApp.Infrastructure.Data;

namespace MusicApp.Infrastructure.Repositories;

public class GenreRepository : Repository<Genre>, IGenreRepository
{
    public GenreRepository(AppDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Genre>> GetAllAsync()
    {
        return await _dbSet
            .Include(g => g.Songs)
            .ToListAsync();
    }

    public override async Task<Genre?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(g => g.Songs)
            .FirstOrDefaultAsync(g => g.Id == id);
    }
}
