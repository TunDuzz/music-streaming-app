using MusicApp.Application.DTOs.Playlists;
using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using System.IO;

namespace MusicApp.Application.Services;

public class PlaylistService : IPlaylistService
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISongRepository _songRepository;
    private readonly IArtistRepository _artistRepository;
    private readonly IFileStorageService _fileStorageService;

    public PlaylistService(
        IPlaylistRepository playlistRepository,
        IUserRepository userRepository,
        ISongRepository songRepository,
        IArtistRepository artistRepository,
        IFileStorageService fileStorageService)
    {
        _playlistRepository = playlistRepository;
        _userRepository = userRepository;
        _songRepository = songRepository;
        _artistRepository = artistRepository;
        _fileStorageService = fileStorageService;
    }

    // ... (GetAll, GetById, GetByUserId, Create hidden for brevity) ...

    public async Task<PlaylistDto?> UpdateAsync(Guid id, UpdatePlaylistDto dto)
    {
        var playlist = await _playlistRepository.GetByIdAsync(id);
        if (playlist == null) return null;

        if (!string.IsNullOrEmpty(dto.Name)) playlist.Name = dto.Name;
        if (dto.Description != null) playlist.Description = dto.Description; 
        if (dto.IsPublic.HasValue) playlist.IsPublic = dto.IsPublic.Value;
        if (dto.CoverImageUrl != null) playlist.CoverImageUrl = dto.CoverImageUrl;

        await _playlistRepository.UpdateAsync(playlist);
        var user = await _userRepository.GetByIdAsync(playlist.UserId);

        return new PlaylistDto
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            IsPublic = playlist.IsPublic,
            UserId = playlist.UserId,
            Username = user?.Username ?? "Unknown",
            CoverImageUrl = playlist.CoverImageUrl,
            Songs = new List<SongDto>() // Simplified for update response
        };
    }

    public async Task<string> UploadCoverImageAsync(Guid id, Stream fileStream, string fileName, string contentType)
    {
        var playlist = await _playlistRepository.GetByIdAsync(id);
        if (playlist == null) throw new KeyNotFoundException("Playlist not found");

        var bucket = "musicdb"; // Reverted to musicdb as requested
        var objectKey = $"playlist/{id}/cover_{DateTime.UtcNow.Ticks}{Path.GetExtension(fileName)}";
        
        var result = await _fileStorageService.UploadFileAsync(fileStream, objectKey, contentType, bucket);
        var url = result.Url;
        
        // Delete old if exists
        if (!string.IsNullOrEmpty(playlist.CoverObjectKey))
        {
             await _fileStorageService.DeleteFileAsync(bucket, playlist.CoverObjectKey);
        }

        playlist.CoverImageUrl = url;
        playlist.CoverObjectKey = objectKey;
        
        await _playlistRepository.UpdateAsync(playlist);
        return url;
    }

    public async Task<IEnumerable<PlaylistDto>> GetAllAsync()
    {
        var playlists = await _playlistRepository.GetAllAsync();
        var dtos = new List<PlaylistDto>();

        foreach (var playlist in playlists)
        {

            var user = await _userRepository.GetByIdAsync(playlist.UserId);
            var songDtos = new List<SongDto>();
            
            dtos.Add(new PlaylistDto
            {
                Id = playlist.Id,
                Name = playlist.Name,
                Description = playlist.Description,
                IsPublic = playlist.IsPublic,
                UserId = playlist.UserId,
                Username = user?.Username ?? "Unknown",
                CoverImageUrl = playlist.CoverImageUrl,
                Songs = songDtos
            });
        }
        return dtos;
    }

    public async Task<PlaylistDto?> GetByIdAsync(Guid id)
    {
        var playlist = await _playlistRepository.GetByIdWithSongsAsync(id);
        if (playlist == null) return null;

        var user = await _userRepository.GetByIdAsync(playlist.UserId);
        
        var songDtos = playlist.PlaylistSongs
            .OrderBy(ps => ps.Position) // Corrected property name
            .Select(ps => 
            {
                var s = ps.Song;
                return new SongDto 
                { 
                    Id = s.Id, 
                    Title = s.Title,
                    CoverImageUrl = s.CoverImageUrl,
                    AudioFileUrl = s.AudioFileUrl,
                    Duration = s.Duration,
                    AlbumId = s.AlbumId,
                    Artists = s.SongArtists.Select(sa => new SimpleArtistDto
                    {
                        Id = sa.ArtistId,
                        Name = sa.Artist?.Name ?? "Unknown",
                        IsPrimary = sa.IsPrimary
                    }).ToList()
                };
            })
            .ToList();

        return new PlaylistDto
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            IsPublic = playlist.IsPublic,
            UserId = playlist.UserId,
            Username = user?.Username ?? "Unknown",
            CoverImageUrl = playlist.CoverImageUrl,
            Songs = songDtos
        };
    }
    
    public async Task<IEnumerable<PlaylistDto>> GetByUserIdAsync(Guid userId)
    {
        var playlists = await _playlistRepository.GetByUserIdAsync(userId);
         var dtos = new List<PlaylistDto>();

        foreach (var playlist in playlists)
        {
            var user = await _userRepository.GetByIdAsync(playlist.UserId);
            dtos.Add(new PlaylistDto
            {
                Id = playlist.Id,
                Name = playlist.Name,
                Description = playlist.Description,
                IsPublic = playlist.IsPublic,
                UserId = playlist.UserId,
                Username = user?.Username ?? "Unknown",
                CoverImageUrl = playlist.CoverImageUrl,
                Songs = new List<SongDto>()
            });
        }
        return dtos;
    }

    public async Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto, Guid userId)
    {
        var playlist = new Playlist
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            IsPublic = dto.IsPublic,
            UserId = userId
        };

        var created = await _playlistRepository.AddAsync(playlist);
        var user = await _userRepository.GetByIdAsync(userId);

        return new PlaylistDto
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            IsPublic = created.IsPublic,
            UserId = created.UserId,
            Username = user?.Username ?? "Unknown",
            CoverImageUrl = created.CoverImageUrl,
            Songs = new List<SongDto>()
        };
    }



    public async Task<bool> DeleteAsync(Guid id)
    {
        if (!await _playlistRepository.ExistsAsync(id)) return false;
        await _playlistRepository.DeleteAsync(id);
        return true;
    }

    public async Task<bool> AddSongToPlaylistAsync(Guid playlistId, Guid songId)
    {

        
        return await _playlistRepository.AddSongAsync(playlistId, songId);
    }

    public async Task<bool> RemoveSongFromPlaylistAsync(Guid playlistId, Guid songId)
    {
        return await _playlistRepository.RemoveSongAsync(playlistId, songId);
    }

    public async Task<IEnumerable<PlaylistDto>> SearchAsync(string query)
    {
        var playlists = await _playlistRepository.SearchAsync(query);
        var dtos = new List<PlaylistDto>();

        foreach (var playlist in playlists)
        {
            var user = await _userRepository.GetByIdAsync(playlist.UserId);
            dtos.Add(new PlaylistDto
            {
                Id = playlist.Id,
                Name = playlist.Name,
                Description = playlist.Description,
                IsPublic = playlist.IsPublic,
                UserId = playlist.UserId,
                Username = user?.Username ?? "Unknown",
                CoverImageUrl = playlist.CoverImageUrl,
                Songs = new List<SongDto>()
            });
        }
        return dtos;
    }
}
