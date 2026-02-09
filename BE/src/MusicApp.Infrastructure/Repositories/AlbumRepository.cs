using Microsoft.EntityFrameworkCore;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using MusicApp.Infrastructure.Data;

namespace MusicApp.Infrastructure.Repositories;

public class AlbumRepository : Repository<Album>, IAlbumRepository
{
    public AlbumRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Album>> GetByArtistIdAsync(Guid artistId)
    {
        return await _dbSet
            .Where(a => a.ArtistId == artistId)
            .Include(a => a.Artist)
            .ToListAsync();
    }

    public async Task<IEnumerable<Album>> SearchAsync(string query)
    {
        return await _dbSet
            .Where(a => a.Title.Contains(query))
            .Include(a => a.Artist)
            .ToListAsync();
    }

    public async Task<Album?> GetByIdWithSongsAsync(Guid id)
    {
        return await _dbSet
            .Include(a => a.Artist)
            .Include(a => a.Songs)
                .ThenInclude(s => s.SongArtists)
                    .ThenInclude(sa => sa.Artist)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
}
