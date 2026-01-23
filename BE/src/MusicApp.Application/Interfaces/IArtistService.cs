using MusicApp.Application.DTOs.Artists;

namespace MusicApp.Application.Interfaces;

public interface IArtistService
{
    Task<ArtistDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ArtistDto>> GetAllAsync();
    Task<ArtistDto> CreateAsync(CreateArtistDto dto);
    Task<ArtistDto?> UpdateAsync(Guid id, UpdateArtistDto dto);
    Task<bool> DeleteAsync(Guid id);
}
