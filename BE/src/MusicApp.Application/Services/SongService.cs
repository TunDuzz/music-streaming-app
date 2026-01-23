using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;

namespace MusicApp.Application.Services;

public class SongService : ISongService
{
    private readonly ISongRepository _songRepository;
    private readonly IArtistRepository _artistRepository;

    public SongService(ISongRepository songRepository, IArtistRepository artistRepository)
    {
        _songRepository = songRepository;
        _artistRepository = artistRepository;
    }

    public async Task<SongDto?> GetByIdAsync(Guid id)
    {
        var song = await _songRepository.GetByIdAsync(id);
        if (song == null) return null;

        var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
        return MapToDto(song, artist?.Name ?? "Unknown");
    }

    public async Task<IEnumerable<SongDto>> GetAllAsync()
    {
        var songs = await _songRepository.GetAllAsync();
        var songDtos = new List<SongDto>();

        foreach (var song in songs)
        {
            var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
            songDtos.Add(MapToDto(song, artist?.Name ?? "Unknown"));
        }

        return songDtos;
    }

    public async Task<IEnumerable<SongDto>> GetByArtistIdAsync(Guid artistId)
    {
        var songs = await _songRepository.GetByArtistIdAsync(artistId);
        var artist = await _artistRepository.GetByIdAsync(artistId);
        return songs.Select(s => MapToDto(s, artist?.Name ?? "Unknown"));
    }

    public async Task<SongDto> CreateAsync(CreateSongDto dto)
    {
        var song = new Song
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Duration = dto.Duration,
            Lyrics = dto.Lyrics,
            AudioFileUrl = dto.AudioFileUrl,
            CoverImageUrl = dto.CoverImageUrl,
            ArtistId = dto.ArtistId,
            AlbumId = dto.AlbumId,
            PlayCount = 0,
            LikeCount = 0
        };

        var created = await _songRepository.AddAsync(song);
        var artist = await _artistRepository.GetByIdAsync(created.ArtistId);
        return MapToDto(created, artist?.Name ?? "Unknown");
    }

    public async Task<SongDto?> UpdateAsync(Guid id, UpdateSongDto dto)
    {
        var song = await _songRepository.GetByIdAsync(id);
        if (song == null) return null;

        if (!string.IsNullOrEmpty(dto.Title))
            song.Title = dto.Title;

        if (dto.Duration.HasValue)
            song.Duration = dto.Duration.Value;

        if (dto.Lyrics != null)
            song.Lyrics = dto.Lyrics;

        if (dto.AudioFileUrl != null)
            song.AudioFileUrl = dto.AudioFileUrl;

        if (dto.CoverImageUrl != null)
            song.CoverImageUrl = dto.CoverImageUrl;

        if (dto.AlbumId.HasValue)
            song.AlbumId = dto.AlbumId;

        await _songRepository.UpdateAsync(song);
        var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
        return MapToDto(song, artist?.Name ?? "Unknown");
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        if (!await _songRepository.ExistsAsync(id))
            return false;

        await _songRepository.DeleteAsync(id);
        return true;
    }

    private static SongDto MapToDto(Song song, string artistName)
    {
        return new SongDto
        {
            Id = song.Id,
            Title = song.Title,
            Duration = song.Duration,
            Lyrics = song.Lyrics,
            AudioFileUrl = song.AudioFileUrl,
            CoverImageUrl = song.CoverImageUrl,
            PlayCount = song.PlayCount,
            LikeCount = song.LikeCount,
            ArtistId = song.ArtistId,
            ArtistName = artistName,
            AlbumId = song.AlbumId,
            CreatedAt = song.CreatedAt,
            UpdatedAt = song.UpdatedAt
        };
    }
}
