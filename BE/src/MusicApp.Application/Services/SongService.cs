using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using Microsoft.Extensions.Configuration; // Added missing using

namespace MusicApp.Application.Services;

public class SongService : ISongService
{
    private readonly ISongRepository _songRepository;
    private readonly IArtistRepository _artistRepository;
    private readonly IGenreRepository _genreRepository; // Restored field
    private readonly IConfiguration _configuration;

    public SongService(ISongRepository songRepository, IArtistRepository artistRepository, IGenreRepository genreRepository, IConfiguration configuration)
    {
        _songRepository = songRepository;
        _artistRepository = artistRepository;
        _genreRepository = genreRepository;
        _configuration = configuration;
    }

    public async Task<SongDto?> GetByIdAsync(Guid id)
    {
        var song = await _songRepository.GetByIdAsync(id);
        if (song == null) return null;

        var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
        string genreName = "Unknown";
        if (song.GenreId.HasValue)
        {
             MusicApp.Domain.Entities.Genre? genre = await _genreRepository.GetByIdAsync(song.GenreId.Value);
             genreName = genre?.Name ?? "Unknown";
        }

        return MapToDto(song, artist?.Name ?? "Unknown", genreName);
    }

    public async Task<IEnumerable<SongDto>> GetAllAsync()
    {
        var songs = await _songRepository.GetAllAsync();
        var songDtos = new List<SongDto>();

        foreach (var song in songs)
        {
            var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
            string genreName = "Unknown";
            if (song.GenreId.HasValue)
            {
                var genre = await _genreRepository.GetByIdAsync(song.GenreId.Value);
                genreName = genre?.Name ?? "Unknown";
            }
            songDtos.Add(MapToDto(song, artist?.Name ?? "Unknown", genreName));
        }

        return songDtos;
    }

    public async Task<IEnumerable<SongDto>> GetByArtistIdAsync(Guid artistId)
    {
        var songs = await _songRepository.GetByArtistIdAsync(artistId);
        var artist = await _artistRepository.GetByIdAsync(artistId);
        
        var songDtos = new List<SongDto>();
        foreach (var song in songs)
        {
             string genreName = "Unknown";
            if (song.GenreId.HasValue)
            {
                var genre = await _genreRepository.GetByIdAsync(song.GenreId.Value);
                genreName = genre?.Name ?? "Unknown";
            }
             songDtos.Add(MapToDto(song, artist?.Name ?? "Unknown", genreName));
        }
        return songDtos;
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
            AudioObjectKey = dto.AudioObjectKey,
            CoverImageUrl = dto.CoverImageUrl,
            CoverObjectKey = dto.CoverObjectKey,
            ArtistId = dto.ArtistId,
            AlbumId = dto.AlbumId,
            GenreId = dto.GenreId,
            PlayCount = 0,
            LikeCount = 0
        };

        var created = await _songRepository.AddAsync(song);
        var artist = await _artistRepository.GetByIdAsync(created.ArtistId);
        
        string genreName = "Unknown";
        if (created.GenreId.HasValue)
        {
            var genre = await _genreRepository.GetByIdAsync(created.GenreId.Value);
            genreName = genre?.Name ?? "Unknown";
        }
        
        return MapToDto(created, artist?.Name ?? "Unknown", genreName);
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
        {
            song.AudioFileUrl = dto.AudioFileUrl;
            if(!string.IsNullOrEmpty(dto.AudioObjectKey)) song.AudioObjectKey = dto.AudioObjectKey;
        }

        if (dto.CoverImageUrl != null)
        {
            song.CoverImageUrl = dto.CoverImageUrl;
            if(!string.IsNullOrEmpty(dto.CoverObjectKey)) song.CoverObjectKey = dto.CoverObjectKey;
        }

        if (dto.AlbumId.HasValue)
            song.AlbumId = dto.AlbumId;

        if (dto.ArtistId.HasValue)
            song.ArtistId = dto.ArtistId.Value;

        if (dto.GenreId.HasValue)
            song.GenreId = dto.GenreId;

        await _songRepository.UpdateAsync(song);
        var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
        
        string genreName = "Unknown";
        if (song.GenreId.HasValue)
        {
            var genre = await _genreRepository.GetByIdAsync(song.GenreId.Value);
            genreName = genre?.Name ?? "Unknown";
        }

        return MapToDto(song, artist?.Name ?? "Unknown", genreName);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        if (!await _songRepository.ExistsAsync(id))
            return false;

        await _songRepository.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<SongDto>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<SongDto>();

        var songs = await _songRepository.SearchByTitleAsync(query);

        // Fallback: If no songs found by title, try to find songs by the top matching artist
        if (!songs.Any())
        {
            // Search for artists matching the query
            var artists = await _artistRepository.SearchByNameAsync(query);
            var topArtist = artists.FirstOrDefault();

            if (topArtist != null)
            {
                // If an artist is found, get their songs
                songs = await _songRepository.GetByArtistIdAsync(topArtist.Id);
            }
        }

        var songDtos = new List<SongDto>();

        foreach (var song in songs)
        {
            var artist = await _artistRepository.GetByIdAsync(song.ArtistId);
             string genreName = "Unknown";
            if (song.GenreId.HasValue)
            {
                var genre = await _genreRepository.GetByIdAsync(song.GenreId.Value);
                genreName = genre?.Name ?? "Unknown";
            }
            songDtos.Add(MapToDto(song, artist?.Name ?? "Unknown", genreName));
        }

        return songDtos;
    }

    private SongDto MapToDto(Song song, string artistName, string genreName)
    {
        // Robust URL Generation using Configuration
        var endpoint = _configuration["Minio:Endpoint"];
        var useSSLStr = _configuration["Minio:UseSSL"];
        var useSSL = !string.IsNullOrEmpty(useSSLStr) && bool.Parse(useSSLStr);
        var protocol = useSSL ? "https" : "http";
        var bucket = "musicdb"; // Could also be config

        var audioUrl = song.AudioFileUrl;
        if ((string.IsNullOrEmpty(audioUrl) || !audioUrl.StartsWith("http")) && !string.IsNullOrEmpty(song.AudioObjectKey))
        {
            audioUrl = $"{protocol}://{endpoint}/{bucket}/{song.AudioObjectKey}";
        }

        var coverUrl = song.CoverImageUrl;
         if ((string.IsNullOrEmpty(coverUrl) || !coverUrl.StartsWith("http")) && !string.IsNullOrEmpty(song.CoverObjectKey))
        {
            coverUrl = $"{protocol}://{endpoint}/{bucket}/{song.CoverObjectKey}";
        }

        return new SongDto
        {
            Id = song.Id,
            Title = song.Title,
            Duration = song.Duration,
            Lyrics = song.Lyrics,
            AudioFileUrl = audioUrl,
            CoverImageUrl = coverUrl,
            PlayCount = song.PlayCount,
            LikeCount = song.LikeCount,
            ArtistId = song.ArtistId,
            ArtistName = artistName,
            AlbumId = song.AlbumId,
            GenreId = song.GenreId,
            GenreName = genreName,
            CreatedAt = song.CreatedAt,
            UpdatedAt = song.UpdatedAt
        };
    }
}
