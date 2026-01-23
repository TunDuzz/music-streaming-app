using Microsoft.EntityFrameworkCore;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using MusicApp.Infrastructure.Data;

namespace MusicApp.Infrastructure.Repositories;

public class SongRepository : Repository<Song>, ISongRepository
{
    public SongRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Song>> GetByArtistIdAsync(Guid artistId)
    {
        return await _dbSet
            .Where(s => s.ArtistId == artistId)
            .Include(s => s.Artist)
            .Include(s => s.Album)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetByAlbumIdAsync(Guid albumId)
    {
        return await _dbSet
            .Where(s => s.AlbumId == albumId)
            .Include(s => s.Artist)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> SearchByTitleAsync(string title)
    {
        return await _dbSet
            .Where(s => s.Title.Contains(title))
            .Include(s => s.Artist)
            .Include(s => s.Album)
            .ToListAsync();
    }
}
