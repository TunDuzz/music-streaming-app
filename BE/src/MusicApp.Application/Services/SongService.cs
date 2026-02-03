using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.Interfaces;
using MusicApp.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace MusicApp.Application.Services;

public class SongService : ISongService
{
    private readonly ISongRepository _songRepository;
    private readonly IArtistRepository _artistRepository;
    private readonly IGenreRepository _genreRepository;
    private readonly IAlbumRepository _albumRepository;

    private readonly IFileStorageService _fileStorageService;

    public SongService(ISongRepository songRepository, IArtistRepository artistRepository, IGenreRepository genreRepository, IAlbumRepository albumRepository, IFileStorageService fileStorageService)
    {
        _songRepository = songRepository;
        _artistRepository = artistRepository;
        _genreRepository = genreRepository;
        _albumRepository = albumRepository;

        _fileStorageService = fileStorageService;
    }

    public async Task<SongDto?> GetByIdAsync(Guid id)
    {
        var song = await _songRepository.GetByIdAsync(id);
        if (song == null) return null;
        
        // Ensure we load necessary relations or rely on LoadAndMapSong to handle missing data


        return await LoadAndMapSong(song);
    }

    public async Task<IEnumerable<SongDto>> GetAllAsync()
    {
        var songs = await _songRepository.GetAllAsync();

        var songDtos = new List<SongDto>();
        foreach (var song in songs)
        {
            songDtos.Add(await LoadAndMapSong(song));
        }
        return songDtos;
    }

    public async Task<IEnumerable<SongDto>> GetByArtistIdAsync(Guid artistId)
    {
        // This method was implemented in SongRepository with Includes!
        var songs = await _songRepository.GetByArtistIdAsync(artistId);
        var dtos = new List<SongDto>();
        foreach(var song in songs) dtos.Add(await MapToDto(song));
        return dtos;
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
            AlbumId = dto.AlbumId,
            GenreId = dto.GenreId,
            PlayCount = 0,
            LikeCount = 0
        };

        // Handle Artists
        if (dto.ArtistIds != null && dto.ArtistIds.Any())
        {
            foreach (var artistId in dto.ArtistIds)
            {
                song.SongArtists.Add(new SongArtist 
                { 
                    SongId = song.Id, 
                    ArtistId = artistId,
                    IsPrimary = true // Logic to distinguish primary? For now assume all valid.
                    // Could Assume First is Primary, others Featured.
                });
            }
            // Mark non-first as featured?
            if (song.SongArtists.Count > 1)
            {
                var first = true;
                foreach(var sa in song.SongArtists)
                {
                    sa.IsPrimary = first;
                    first = false;
                }
            }
        }

        var created = await _songRepository.AddAsync(song);
        return await LoadAndMapSong(created);
    }

    public async Task<SongDto?> UpdateAsync(Guid id, UpdateSongDto dto)
    {
        var song = await _songRepository.GetByIdAsync(id);
        if (song == null) return null;

        if (!string.IsNullOrEmpty(dto.Title)) song.Title = dto.Title;
        if (dto.Duration.HasValue) song.Duration = dto.Duration.Value;
        if (dto.Lyrics != null) song.Lyrics = dto.Lyrics;
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
        if (dto.AlbumId.HasValue) song.AlbumId = dto.AlbumId;
        if (dto.GenreId.HasValue) song.GenreId = dto.GenreId;

        // Update Artists
        if (dto.ArtistIds != null)
        {
            // Rebuild artists list
            song.SongArtists.Clear(); 

            var newArtists = new List<SongArtist>();
            var isFirst = true;
            foreach (var artistId in dto.ArtistIds)
            {
                newArtists.Add(new SongArtist 
                { 
                    SongId = song.Id, 
                    ArtistId = artistId, 
                    IsPrimary = isFirst 
                });
                isFirst = false;
            }
            song.SongArtists = newArtists;
        }

        await _songRepository.UpdateAsync(song);
        return await LoadAndMapSong(song);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var song = await _songRepository.GetByIdAsync(id);
        if (song == null) return false;

        var bucket = "Songs";
        if (!string.IsNullOrEmpty(song.AudioObjectKey))
        {
            try { await _fileStorageService.DeleteFileAsync(bucket, song.AudioObjectKey); } catch {}
        }
        if (!string.IsNullOrEmpty(song.CoverObjectKey))
        {
            try { await _fileStorageService.DeleteFileAsync(bucket, song.CoverObjectKey); } catch {}
        }

        await _songRepository.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<SongDto>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<SongDto>();
        var songs = await _songRepository.SearchByTitleAsync(query);
        
        // Fallback: artist search
        if (!songs.Any())
        {
            var artists = await _artistRepository.SearchByNameAsync(query);
            var topArtist = artists.FirstOrDefault();
            if (topArtist != null)
            {
                songs = await _songRepository.GetByArtistIdAsync(topArtist.Id);
            }
        }

        var dtos = new List<SongDto>();
        foreach(var song in songs) dtos.Add(await MapToDto(song));
        return dtos;
    }

    // Helper to safely load relations if needed and map
    private async Task<SongDto> LoadAndMapSong(Song song)
    {
        // Ideally we check if relations are loaded.
        // For Album and Genre, we can fetch if null.
        // For SongArtists, it's a collection.
        
        // Fetch Album
        string albumTitle = "Unknown";
        if (song.Album != null) albumTitle = song.Album.Title;
        else if (song.AlbumId.HasValue)
        {
            var album = await _albumRepository.GetByIdAsync(song.AlbumId.Value);
            if (album != null) albumTitle = album.Title;
        }

        // Fetch Genre
        string genreName = "Unknown";
        if (song.Genre != null) genreName = song.Genre.Name;
        else if (song.GenreId.HasValue)
        {
            var genre = await _genreRepository.GetByIdAsync(song.GenreId.Value);
            if (genre != null) genreName = genre.Name;
        }

        return await MapToDto(song, albumTitle, genreName);
    }

    private async Task<SongDto> MapToDto(Song song, string albumTitle = "Unknown", string genreName = "Unknown")
    {
        // Map Artists
        var simpleArtists = new List<SimpleArtistDto>();
        if (song.SongArtists != null && song.SongArtists.Any())
        {
            foreach (var sa in song.SongArtists)
            {
               // If sa.Artist is loaded, use it. Else fetch.
               var artistName = sa.Artist?.Name;
               if (string.IsNullOrEmpty(artistName))
               {
                   var a = await _artistRepository.GetByIdAsync(sa.ArtistId);
                   artistName = a?.Name ?? "Unknown";
               }
               
               simpleArtists.Add(new SimpleArtistDto
               {
                   Id = sa.ArtistId,
                   Name = artistName,
                   IsPrimary = sa.IsPrimary
               });
            }
        }
        else
        {
        }

        var audioUrl = song.AudioFileUrl;
        var coverUrl = song.CoverImageUrl;

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
            Artists = simpleArtists,
            ArtistName = string.Join(", ", simpleArtists.Select(a => a.Name)),
            AlbumId = song.AlbumId,
            AlbumTitle = albumTitle,
            GenreId = song.GenreId,
            GenreName = genreName,
            CreatedAt = song.CreatedAt,
            UpdatedAt = song.UpdatedAt
        };
    }
}
