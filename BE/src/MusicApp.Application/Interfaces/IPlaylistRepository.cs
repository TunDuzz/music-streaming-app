using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface IPlaylistRepository : IRepository<Playlist>
{
    Task<IEnumerable<Playlist>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Playlist>> GetPublicPlaylistsAsync();
    Task<bool> AddSongAsync(Guid playlistId, Guid songId);
    Task<bool> RemoveSongAsync(Guid playlistId, Guid songId);
}
