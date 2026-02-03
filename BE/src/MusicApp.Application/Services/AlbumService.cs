using MusicApp.Application.DTOs.Albums;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;

namespace MusicApp.Application.Services;

public class AlbumService : IAlbumService
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IArtistRepository _artistRepository;
    private readonly IFileStorageService _fileStorageService;

    public AlbumService(IAlbumRepository albumRepository, IArtistRepository artistRepository, IFileStorageService fileStorageService)
    {
        _albumRepository = albumRepository;
        _artistRepository = artistRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<IEnumerable<AlbumDto>> GetAllAsync()
    {
        var albums = await _albumRepository.GetAllAsync();
        var albumDtos = new List<AlbumDto>();

        foreach (var album in albums)
        {
            var artist = await _artistRepository.GetByIdAsync(album.ArtistId);
            albumDtos.Add(new AlbumDto
            {
                Id = album.Id,
                Title = album.Title,
                ReleaseDate = album.ReleaseDate,
                CoverImageUrl = album.CoverImageUrl,
                ArtistId = album.ArtistId,
                ArtistName = artist?.Name ?? "Unknown",
                Type = album.Type.ToString()
            });
        }
        return albumDtos.AsEnumerable();
    }

    public async Task<AlbumDto?> GetByIdAsync(Guid id)
    {
        var album = await _albumRepository.GetByIdAsync(id);
        if (album == null) return null;

        var artist = await _artistRepository.GetByIdAsync(album.ArtistId);
        return new AlbumDto
        {
            Id = album.Id,
            Title = album.Title,
            ReleaseDate = album.ReleaseDate,
            CoverImageUrl = album.CoverImageUrl,
            ArtistId = album.ArtistId,
            ArtistName = artist?.Name ?? "Unknown",
            Type = album.Type.ToString()
        };
    }

    public async Task<AlbumDto> CreateAsync(CreateAlbumDto dto)
    {
        var album = new Album
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            ReleaseDate = dto.ReleaseDate,
            CoverImageUrl = dto.CoverImageUrl,
            ArtistId = dto.ArtistId,
            Type = dto.Type
        };

        var created = await _albumRepository.AddAsync(album);
        var artist = await _artistRepository.GetByIdAsync(created.ArtistId);

        return new AlbumDto
        {
            Id = created.Id,
            Title = created.Title,
            ReleaseDate = created.ReleaseDate,
            CoverImageUrl = created.CoverImageUrl,
            ArtistId = created.ArtistId,
            ArtistName = artist?.Name ?? "Unknown",
            Type = created.Type.ToString()
        };
    }

    public async Task<AlbumDto?> UpdateAsync(Guid id, UpdateAlbumDto dto)
    {
        var album = await _albumRepository.GetByIdAsync(id);
        if (album == null) return null;

        if (!string.IsNullOrEmpty(dto.Title)) album.Title = dto.Title;
        if (dto.ReleaseDate.HasValue) album.ReleaseDate = dto.ReleaseDate.Value;
        if (!string.IsNullOrEmpty(dto.CoverImageUrl)) album.CoverImageUrl = dto.CoverImageUrl;
        if (dto.ArtistId.HasValue) album.ArtistId = dto.ArtistId.Value;
        if (dto.Type.HasValue) album.Type = dto.Type.Value;

        await _albumRepository.UpdateAsync(album);
        var artist = await _artistRepository.GetByIdAsync(album.ArtistId);

        return new AlbumDto
        {
            Id = album.Id,
            Title = album.Title,
            ReleaseDate = album.ReleaseDate,
            CoverImageUrl = album.CoverImageUrl,
            ArtistId = album.ArtistId,
            ArtistName = artist?.Name ?? "Unknown",
            Type = album.Type.ToString()
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        if (!await _albumRepository.ExistsAsync(id)) return false;
        await _albumRepository.DeleteAsync(id);
        return true;
    }

    public async Task<string> UploadCoverImageAsync(Guid id, System.IO.Stream fileStream, string fileName, string contentType)
    {
        var album = await _albumRepository.GetByIdAsync(id);
        if (album == null)
        {
            throw new KeyNotFoundException($"Album with ID {id} not found.");
        }

        var folder = album.Type == MusicApp.Domain.Enums.AlbumType.Single ? "singles" : "albums";
        var objectName = $"{folder}/{id}/{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var result = await _fileStorageService.UploadFileAsync(fileStream, objectName, contentType, "music-app");
        var url = result.Url;

        album.CoverImageUrl = url;
        await _albumRepository.UpdateAsync(album);

        return url;
    }

    public async Task<IEnumerable<AlbumDto>> SearchAsync(string query)
    {
        var albums = await _albumRepository.SearchAsync(query);
        var albumDtos = new List<AlbumDto>();

        foreach (var album in albums)
        {
            var artist = await _artistRepository.GetByIdAsync(album.ArtistId);
            albumDtos.Add(new AlbumDto
            {
                Id = album.Id,
                Title = album.Title,
                ReleaseDate = album.ReleaseDate,
                CoverImageUrl = album.CoverImageUrl,
                ArtistId = album.ArtistId,
                ArtistName = artist?.Name ?? "Unknown",
                Type = album.Type.ToString()
            });
        }
        return albumDtos;
    }
}
