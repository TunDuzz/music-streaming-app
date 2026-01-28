using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace MusicApp.Application.Services;

public class ArtistService : IArtistService
{
    private readonly IArtistRepository _artistRepository;
    private readonly IConfiguration _configuration;

    public ArtistService(IArtistRepository artistRepository, IConfiguration configuration)
    {
        _artistRepository = artistRepository;
        _configuration = configuration;
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
            AvatarObjectKey = dto.AvatarObjectKey,
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
        {
            artist.AvatarUrl = dto.AvatarUrl;
            if(!string.IsNullOrEmpty(dto.AvatarObjectKey)) artist.AvatarObjectKey = dto.AvatarObjectKey;
        }

        if (dto.Country != null)
            artist.Country = dto.Country;

        if (dto.ArtistImageObjectKeys != null)
            artist.ArtistImageObjectKeys = dto.ArtistImageObjectKeys;

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

    public async Task<IEnumerable<ArtistDto>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<ArtistDto>();

        var artists = await _artistRepository.SearchByNameAsync(query);
        return artists.Select(MapToDto);
    }

    private ArtistDto MapToDto(Artist artist)
    {
        var dto = new ArtistDto
        {
            Id = artist.Id,
            Name = artist.Name,
            Bio = artist.Bio,
            AvatarUrl = artist.AvatarUrl, // This could be enhanced to be a full URL if AvatarUrl is just a relative path or we use ObjectKey
            AvatarObjectKey = artist.AvatarObjectKey,
            Country = artist.Country,
            FollowerCount = artist.FollowerCount,
            ArtistImageObjectKeys = artist.ArtistImageObjectKeys,
            CreatedAt = artist.CreatedAt,
            UpdatedAt = artist.UpdatedAt
        };

        if (!string.IsNullOrEmpty(artist.ArtistImageObjectKeys))
        {
            try
            {
                var keys = System.Text.Json.JsonSerializer.Deserialize<List<string>>(artist.ArtistImageObjectKeys);
                if (keys != null)
                {
                    var endpoint = _configuration["Minio:Endpoint"];
                    var useSSLStr = _configuration["Minio:UseSSL"];
                    var useSSL = !string.IsNullOrEmpty(useSSLStr) && bool.Parse(useSSLStr);
                    var protocol = useSSL ? "https" : "http";
                    var bucket = "musicdb";

                    dto.ImageUrls = keys.Select(k => $"{protocol}://{endpoint}/{bucket}/{k}").ToList();
                }
            }
            catch { }
        }

        return dto;
    }
}
