using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace MusicApp.Application.Services;

public class ArtistService : IArtistService
{
    private readonly IArtistRepository _artistRepository;
    private readonly IConfiguration _configuration;
    private readonly IFileStorageService _fileStorageService;

    public ArtistService(IArtistRepository artistRepository, IConfiguration configuration, IFileStorageService fileStorageService)
    {
        _artistRepository = artistRepository;
        _configuration = configuration;
        _fileStorageService = fileStorageService;
    }

    public async Task<ArtistDto?> GetByIdAsync(Guid id)
    {
        var artist = await _artistRepository.GetByIdWithDetailsAsync(id);
        if (artist == null) return null;
        
        var dto = MapToDto(artist);
        
        // Map Albums
        dto.Albums = artist.Albums.Select(a => new MusicApp.Application.DTOs.Albums.AlbumDto
        {
            Id = a.Id,
            Title = a.Title,
            ReleaseDate = a.ReleaseDate,
            CoverImageUrl = a.CoverImageUrl,
            ArtistId = a.ArtistId,
            ArtistName = artist.Name,
            Type = a.Type.ToString()
        }).ToList();

        // Map Songs (from SongArtists)
        // Filter to ensure we don't have duplicates if data is weird, though implicit it shouldn't be.
        // Also prioritize songs where this artist is Primary? Design didn't specify, but usually we show all.
        dto.Songs = artist.SongArtists.Select(sa => sa.Song).Select(s => new MusicApp.Application.DTOs.Songs.SongDto
        {
            Id = s.Id,
            Title = s.Title,
            Duration = s.Duration,
            CoverImageUrl = s.CoverImageUrl,
            AudioFileUrl = s.AudioFileUrl,
            AlbumId = s.AlbumId,
            AlbumTitle = s.Album?.Title,
            Artists = s.SongArtists.Select(x => new SimpleArtistDto
            {
                Id = x.ArtistId,
                Name = x.Artist.Name,
                IsPrimary = x.IsPrimary
            }).ToList()
        }).ToList();

        return dto;
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



        await _artistRepository.UpdateAsync(artist);
        return MapToDto(artist);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var artist = await _artistRepository.GetByIdAsync(id);
        if (artist == null) return false;

        var bucket = "Artists";

        // 1. Delete Avatar
        if (!string.IsNullOrEmpty(artist.AvatarObjectKey))
        {
            try
            {
                 await _fileStorageService.DeleteFileAsync(bucket, artist.AvatarObjectKey);
            }
            catch(Exception ex) 
            {
                Console.WriteLine($"Error deleting avatar for artist {id}: {ex.Message}");
            }
        }



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
            AvatarUrl = artist.AvatarUrl,
            AvatarObjectKey = artist.AvatarObjectKey,
            Country = artist.Country,
            FollowerCount = artist.FollowerCount,

            CreatedAt = artist.CreatedAt,
            UpdatedAt = artist.UpdatedAt
        };



        return dto;
    }
}
