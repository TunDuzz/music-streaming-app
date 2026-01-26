using MusicApp.Application.DTOs.Albums;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;

namespace MusicApp.Application.Services;

public class AlbumService : IAlbumService
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IArtistRepository _artistRepository;

    public AlbumService(IAlbumRepository albumRepository, IArtistRepository artistRepository)
    {
        _albumRepository = albumRepository;
        _artistRepository = artistRepository;
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
                ArtistName = artist?.Name ?? "Unknown"
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
            ArtistName = artist?.Name ?? "Unknown"
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
            ArtistId = dto.ArtistId
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
            ArtistName = artist?.Name ?? "Unknown"
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

        await _albumRepository.UpdateAsync(album);
        var artist = await _artistRepository.GetByIdAsync(album.ArtistId);

        return new AlbumDto
        {
            Id = album.Id,
            Title = album.Title,
            ReleaseDate = album.ReleaseDate,
            CoverImageUrl = album.CoverImageUrl,
            ArtistId = album.ArtistId,
            ArtistName = artist?.Name ?? "Unknown"
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        if (!await _albumRepository.ExistsAsync(id)) return false;
        await _albumRepository.DeleteAsync(id);
        return true;
    }
}
