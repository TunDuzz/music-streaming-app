using MusicApp.Application.DTOs.Songs;

namespace MusicApp.Application.Interfaces;

public interface ISongService
{
    Task<SongDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<SongDto>> GetAllAsync();
    Task<IEnumerable<SongDto>> GetByArtistIdAsync(Guid artistId);
    Task<SongDto> CreateAsync(CreateSongDto dto);
    Task<SongDto?> UpdateAsync(Guid id, UpdateSongDto dto);
    Task<bool> DeleteAsync(Guid id);
}
