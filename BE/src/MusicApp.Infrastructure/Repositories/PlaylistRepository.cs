using Microsoft.EntityFrameworkCore;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using MusicApp.Infrastructure.Data;

namespace MusicApp.Infrastructure.Repositories;

public class PlaylistRepository : Repository<Playlist>, IPlaylistRepository
{
    public PlaylistRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Playlist>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(p => p.UserId == userId)
            .Include(p => p.User)
            .ToListAsync();
    }

    public async Task<IEnumerable<Playlist>> GetPublicPlaylistsAsync()
    {
        return await _dbSet
            .Where(p => p.IsPublic)
            .Include(p => p.User)
            .ToListAsync();
    }

    public async Task<Playlist?> GetByIdWithSongsAsync(Guid id)
    {
        return await _dbSet
            .Where(p => p.Id == id)
            .Include(p => p.User)
            .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                    .ThenInclude(s => s.SongArtists)
                        .ThenInclude(sa => sa.Artist)
            .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                    .ThenInclude(s => s.Album)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> AddSongAsync(Guid playlistId, Guid songId)
    {
        var playlist = await _dbSet.FindAsync(playlistId);
        if (playlist == null) return false;

        // Check if already exists
        var exists = await _context.PlaylistSongs
            .AnyAsync(ps => ps.PlaylistId == playlistId && ps.SongId == songId);
        
        if (exists) return true; // Already added
        
        // Calculate next position
        var maxPosition = await _context.PlaylistSongs
            .Where(ps => ps.PlaylistId == playlistId)
            .MaxAsync(ps => (int?)ps.Position) ?? -1;

        var playlistSong = new PlaylistSong
        {
            PlaylistId = playlistId,
            SongId = songId,
            Position = maxPosition + 1,
            AddedAt = DateTime.UtcNow
        };

        await _context.PlaylistSongs.AddAsync(playlistSong);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveSongAsync(Guid playlistId, Guid songId)
    {
        var playlistSong = await _context.PlaylistSongs
            .FirstOrDefaultAsync(ps => ps.PlaylistId == playlistId && ps.SongId == songId);

        if (playlistSong == null) return false;

        _context.PlaylistSongs.Remove(playlistSong);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Playlist>> SearchAsync(string query)
    {
        return await _dbSet
            .Where(p => p.Name.Contains(query) && p.IsPublic)
            .Include(p => p.User)
            .ToListAsync();
    }
}
