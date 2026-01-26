using MusicApp.Application.DTOs.Genres;

namespace MusicApp.Application.Interfaces;

public interface IGenreService
{
    Task<IEnumerable<GenreDto>> GetAllAsync();
    Task<GenreDto?> GetByIdAsync(Guid id);
    Task<GenreDto> CreateAsync(CreateGenreDto dto);
    Task<GenreDto?> UpdateAsync(Guid id, UpdateGenreDto dto);
    Task<bool> DeleteAsync(Guid id);
}
