using Microsoft.EntityFrameworkCore;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using MusicApp.Infrastructure.Data;

namespace MusicApp.Infrastructure.Repositories;

public class SongRepository : Repository<Song>, ISongRepository
{
    public SongRepository(AppDbContext context) : base(context) { }

    public async override Task<IEnumerable<Song>> GetAllAsync()
    {
        return await _dbSet
            .Include(s => s.SongArtists)
                .ThenInclude(sa => sa.Artist)
            .Include(s => s.Album)
            .Include(s => s.Genre)
            .ToListAsync();
    }

    public async override Task<Song?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(s => s.SongArtists)
                .ThenInclude(sa => sa.Artist)
            .Include(s => s.Album)
            .Include(s => s.Genre)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Song>> GetByArtistIdAsync(Guid artistId)
    {
        return await _dbSet
            .Where(s => s.SongArtists.Any(sa => sa.ArtistId == artistId))
            .Include(s => s.SongArtists)
                .ThenInclude(sa => sa.Artist)
            .Include(s => s.Album)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetByAlbumIdAsync(Guid albumId)
    {
        return await _dbSet
            .Where(s => s.AlbumId == albumId)
            .Include(s => s.SongArtists)
                .ThenInclude(sa => sa.Artist)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> SearchByTitleAsync(string title)
    {
        var songs = await _dbSet
            .Where(s => s.Title.Contains(title))
            .Include(s => s.SongArtists)
                .ThenInclude(sa => sa.Artist)
            .Include(s => s.Album)
            .ToListAsync();

        return songs
            .OrderByDescending(s => s.Title.StartsWith(title, StringComparison.OrdinalIgnoreCase))
            .ThenBy(s => s.Title)
            .ToList();
    }
}
