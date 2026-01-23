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
}
