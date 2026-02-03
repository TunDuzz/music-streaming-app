using MusicApp.Application.DTOs.Albums;

namespace MusicApp.Application.Interfaces;

public interface IAlbumService
{
    Task<IEnumerable<AlbumDto>> GetAllAsync();
    Task<AlbumDto?> GetByIdAsync(Guid id);
    Task<AlbumDto> CreateAsync(CreateAlbumDto dto);
    Task<AlbumDto?> UpdateAsync(Guid id, UpdateAlbumDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<string> UploadCoverImageAsync(Guid id, System.IO.Stream fileStream, string fileName, string contentType);
    Task<IEnumerable<AlbumDto>> SearchAsync(string query);
}
