using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;

namespace MusicApp.Application.Services;

public class ArtistService : IArtistService
{
    private readonly IArtistRepository _artistRepository;

    public ArtistService(IArtistRepository artistRepository)
    {
        _artistRepository = artistRepository;
    }

    public async Task<ArtistDto?> GetByIdAsync(Guid id)
    {
        var artist = await _artistRepository.GetByIdAsync(id);
        return artist == null ? null : MapToDto(artist);
    }

    public async Task<IEnumerable<ArtistDto>> GetAllAsync()
    {
        var artists = await _artistRepository.GetAllAsync();
        return artists.Select(MapToDto);
    }

    public async Task<ArtistDto> CreateAsync(CreateArtistDto dto)
    {
        var artist = new Artist
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Bio = dto.Bio,
            AvatarUrl = dto.AvatarUrl,
            Country = dto.Country,
            FollowerCount = 0
        };

        var created = await _artistRepository.AddAsync(artist);
        return MapToDto(created);
    }

    public async Task<ArtistDto?> UpdateAsync(Guid id, UpdateArtistDto dto)
    {
        var artist = await _artistRepository.GetByIdAsync(id);
        if (artist == null) return null;

        if (!string.IsNullOrEmpty(dto.Name))
            artist.Name = dto.Name;

        if (dto.Bio != null)
            artist.Bio = dto.Bio;

        if (dto.AvatarUrl != null)
            artist.AvatarUrl = dto.AvatarUrl;

        if (dto.Country != null)
            artist.Country = dto.Country;

        await _artistRepository.UpdateAsync(artist);
        return MapToDto(artist);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        if (!await _artistRepository.ExistsAsync(id))
            return false;

        await _artistRepository.DeleteAsync(id);
        return true;
    }

    private static ArtistDto MapToDto(Artist artist)
    {
        return new ArtistDto
        {
            Id = artist.Id,
            Name = artist.Name,
            Bio = artist.Bio,
            AvatarUrl = artist.AvatarUrl,
            Country = artist.Country,
            FollowerCount = artist.FollowerCount,
            CreatedAt = artist.CreatedAt,
            UpdatedAt = artist.UpdatedAt
        };
    }
}
