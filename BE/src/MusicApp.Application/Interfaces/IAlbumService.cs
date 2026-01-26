using MusicApp.Application.DTOs.Albums;

namespace MusicApp.Application.Interfaces;

public interface IAlbumService
{
    Task<IEnumerable<AlbumDto>> GetAllAsync();
    Task<AlbumDto?> GetByIdAsync(Guid id);
    Task<AlbumDto> CreateAsync(CreateAlbumDto dto);
    Task<AlbumDto?> UpdateAsync(Guid id, UpdateAlbumDto dto);
    Task<bool> DeleteAsync(Guid id);
}
