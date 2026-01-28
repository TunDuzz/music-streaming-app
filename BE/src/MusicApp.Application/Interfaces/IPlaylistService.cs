using MusicApp.Application.DTOs.Playlists;

namespace MusicApp.Application.Interfaces;

public interface IPlaylistService
{
    Task<IEnumerable<PlaylistDto>> GetAllAsync();
    Task<PlaylistDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PlaylistDto>> GetByUserIdAsync(Guid userId);
    Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto, Guid userId); // userId from claims
    Task<PlaylistDto?> UpdateAsync(Guid id, UpdatePlaylistDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> AddSongToPlaylistAsync(Guid playlistId, Guid songId);
    Task<bool> RemoveSongFromPlaylistAsync(Guid playlistId, Guid songId);
    Task<string> UploadCoverImageAsync(Guid id, System.IO.Stream fileStream, string fileName, string contentType);
}
