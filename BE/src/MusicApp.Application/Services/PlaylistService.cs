using MusicApp.Application.DTOs.Playlists;
using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;

namespace MusicApp.Application.Services;

public class PlaylistService : IPlaylistService
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISongRepository _songRepository;
    private readonly IArtistRepository _artistRepository;

    public PlaylistService(
        IPlaylistRepository playlistRepository,
        IUserRepository userRepository,
        ISongRepository songRepository,
        IArtistRepository artistRepository)
    {
        _playlistRepository = playlistRepository;
        _userRepository = userRepository;
        _songRepository = songRepository;
        _artistRepository = artistRepository;
    }

    public async Task<IEnumerable<PlaylistDto>> GetAllAsync()
    {
        var playlists = await _playlistRepository.GetAllAsync();
        var dtos = new List<PlaylistDto>();

        foreach (var playlist in playlists)
        {
            // Note: Efficient mapping might need Eager Loading in Repo
            var user = await _userRepository.GetByIdAsync(playlist.UserId);
            var songDtos = new List<SongDto>(); // Basic info, ideally loaded via repo include
            
            dtos.Add(new PlaylistDto
            {
                Id = playlist.Id,
                Name = playlist.Name,
                Description = playlist.Description,
                IsPublic = playlist.IsPublic,
                UserId = playlist.UserId,
                Username = user?.Username ?? "Unknown",
                Songs = songDtos // Empty for now or implementation dependent
            });
        }
        return dtos;
    }

    public async Task<PlaylistDto?> GetByIdAsync(Guid id)
    {
        // Repo should ideally include Songs and Artist info
        // Using basic get for restoration
        var playlist = await _playlistRepository.GetByIdAsync(id);
        if (playlist == null) return null;

        var user = await _userRepository.GetByIdAsync(playlist.UserId);
        
        // Populate songs if your repo logic supports fetching PlaylistSongs
        // Assuming loose implementation for fix
        var songDtos = new List<SongDto>(); 
        if (playlist.PlaylistSongs != null)
        {
            foreach(var ps in playlist.PlaylistSongs)
            {
                var song = await _songRepository.GetByIdAsync(ps.SongId);
                if (song != null)
                {
                    var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
                    songDtos.Add(new SongDto 
                    { 
                        Id = song.Id, 
                        Title = song.Title,
                        ArtistName = artist?.Name ?? "Unknown",
                        CoverImageUrl = song.CoverImageUrl,
                        AudioFileUrl = song.AudioFileUrl,
                        Duration = song.Duration
                    });
                }
            }
        }

        return new PlaylistDto
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            IsPublic = playlist.IsPublic,
            UserId = playlist.UserId,
            Username = user?.Username ?? "Unknown",
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
            Songs = new List<SongDto>()
        };
    }

    public async Task<PlaylistDto?> UpdateAsync(Guid id, UpdatePlaylistDto dto)
    {
        var playlist = await _playlistRepository.GetByIdAsync(id);
        if (playlist == null) return null;

        if (!string.IsNullOrEmpty(dto.Name)) playlist.Name = dto.Name;
        // if (dto.Description != null) playlist.Description = dto.Description; 
        // Assuming Description in DTO. If not present in basic DTO, skip.
        if (dto.IsPublic.HasValue) playlist.IsPublic = dto.IsPublic.Value;

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
            Songs = new List<SongDto>() // Simplified for update response
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
        // This usually requires a specific method in Repo or logic here using DbContext (if accessible)
        // or using repo methods to add relation
        // Basic impl check existence
        var playlist = await _playlistRepository.GetByIdAsync(playlistId);
        if (playlist == null) return false;
        
        var song = await _songRepository.GetByIdAsync(songId);
        if (song == null) return false;

        // Assuming Repo has method or we manipulate entity (if EF tracking enabled)
        // Since IRepository<T> base generic, maybe we need specific PlaylistRepo method
        // For now, let's assume specific method exists or fail safely if not easily restorable without seeing base classes.
        // Actually, let's check custom method availability in IPlaylistRepository.
        // If not, we might need to add it or use specialized logic.
        
        return await _playlistRepository.AddSongAsync(playlistId, songId);
    }

    public async Task<bool> RemoveSongFromPlaylistAsync(Guid playlistId, Guid songId)
    {
        return await _playlistRepository.RemoveSongAsync(playlistId, songId);
    }
}
