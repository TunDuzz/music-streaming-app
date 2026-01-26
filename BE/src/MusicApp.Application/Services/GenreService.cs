using MusicApp.Application.DTOs.Genres;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;

namespace MusicApp.Application.Services;

public class GenreService : IGenreService
{
    private readonly IGenreRepository _genreRepository;

    public GenreService(IGenreRepository genreRepository)
    {
        _genreRepository = genreRepository;
    }

    public async Task<IEnumerable<GenreDto>> GetAllAsync()
    {
        var genres = await _genreRepository.GetAllAsync();
        
        return genres.Select(g => new GenreDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            SongCount = g.Songs?.Count ?? 0
        });
    }

    public async Task<GenreDto?> GetByIdAsync(Guid id)
    {
        MusicApp.Domain.Entities.Genre? genre = await _genreRepository.GetByIdAsync(id);
        if (genre == null) return null;

        return new GenreDto
        {
            Id = genre.Id,
            Name = genre.Name,
            Description = genre.Description,
             SongCount = genre.Songs?.Count ?? 0
        };
    }

    public async Task<GenreDto> CreateAsync(CreateGenreDto dto)
    {
        var genre = new MusicApp.Domain.Entities.Genre
        {
            Name = dto.Name,
            Description = dto.Description
        };

        var created = await _genreRepository.AddAsync(genre);
        return new GenreDto
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            SongCount = 0
        };
    }

    public async Task<GenreDto?> UpdateAsync(Guid id, UpdateGenreDto dto)
    {
        var genre = await _genreRepository.GetByIdAsync(id);
        if (genre == null) return null;

        genre.Name = dto.Name;
        genre.Description = dto.Description;

        await _genreRepository.UpdateAsync(genre);
        
        return new GenreDto
        {
            Id = genre.Id,
            Name = genre.Name,
            Description = genre.Description,
            SongCount = genre.Songs?.Count ?? 0
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var genre = await _genreRepository.GetByIdAsync(id);
        if (genre == null) return false;

        await _genreRepository.DeleteAsync(id);
        return true;
    }
}
