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
    public async Task<bool> ToggleLikeAsync(Guid songId, Guid userId)
    {
        var existing = await _context.UserLikesSongs
            .FirstOrDefaultAsync(x => x.SongId == songId && x.UserId == userId);

        if (existing != null)
        {
            _context.UserLikesSongs.Remove(existing);
            
            // Decrement like count
            var song = await _dbSet.FindAsync(songId);
            if (song != null) 
            {
                song.LikeCount = Math.Max(0, song.LikeCount - 1);
            }

            await _context.SaveChangesAsync();
            return false;
        }
        else
        {
            var like = new UserLikesSong
            {
                UserId = userId,
                SongId = songId,
                LikedAt = DateTime.UtcNow
            };
            _context.UserLikesSongs.Add(like);

            // Increment like count
            var song = await _dbSet.FindAsync(songId);
            if (song != null) 
            {
                song.LikeCount++;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<IEnumerable<Guid>> GetLikedSongIdsAsync(Guid userId)
    {
        return await _context.UserLikesSongs
            .Where(x => x.UserId == userId)
            .Select(x => x.SongId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetLikedSongsByUserIdAsync(Guid userId)
    {
        return await _context.UserLikesSongs
            .Where(uls => uls.UserId == userId)
            .Include(uls => uls.Song)
                .ThenInclude(s => s.SongArtists)
                    .ThenInclude(sa => sa.Artist)
            .Include(uls => uls.Song.Album)
            .OrderByDescending(uls => uls.LikedAt)
            .Select(uls => uls.Song)
            .ToListAsync();
    }

    public async Task<IEnumerable<(Song Song, DateTime LikedAt)>> GetLikedSongsWithTimestampAsync(Guid userId)
    {
        var result = await _context.UserLikesSongs
            .Where(uls => uls.UserId == userId)
            .Include(uls => uls.Song)
                .ThenInclude(s => s.SongArtists)
                    .ThenInclude(sa => sa.Artist)
            .Include(uls => uls.Song.Album)
            .OrderByDescending(uls => uls.LikedAt)
            .Select(uls => new { uls.Song, uls.LikedAt })
            .ToListAsync();

        return result.Select(x => (x.Song, x.LikedAt));
    }
}
