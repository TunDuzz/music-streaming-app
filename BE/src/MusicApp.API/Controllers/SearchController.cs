using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly ISongService _songService;
    private readonly IArtistService _artistService;
    private readonly IAlbumService _albumService;
    private readonly IPlaylistService _playlistService;

    public SearchController(
        ISongService songService, 
        IArtistService artistService,
        IAlbumService albumService,
        IPlaylistService playlistService)
    {
        _songService = songService;
        _artistService = artistService;
        _albumService = albumService;
        _playlistService = playlistService;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        Console.WriteLine($"[SearchController] Searching for: '{q}'");

        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { songs = new List<object>(), artists = new List<object>(), albums = new List<object>(), playlists = new List<object>() });

        try 
        {
            // Sequential search (DbContext is not thread-safe if sharing context)
            var songs = await _songService.SearchAsync(q);
            var artists = await _artistService.SearchAsync(q);
            var albums = await _albumService.SearchAsync(q);
            var playlists = await _playlistService.SearchAsync(q);
            
            Console.WriteLine($"[SearchController] Found {songs.Count()} songs, {artists.Count()} artists, {albums.Count()} albums, {playlists.Count()} playlists.");

            return Ok(new 
            {
                songs = songs.Take(5).Select(s => new {
                    s.Id,
                    s.Title,
                    s.CoverImageUrl,
                    s.AudioFileUrl,
                    Type = "song",
                    ArtistName = s.Artists != null && s.Artists.Any() 
                        ? string.Join(", ", s.Artists.Select(a => a.Name)) 
                        : "Unknown",
                    s.Artists,
                    s.Duration
                }),
                artists = artists.Take(5).Select(a => new {
                    a.Id,
                    Title = a.Name ?? "Unknown",
                    CoverImageUrl = a.AvatarUrl,
                    Type = "artist"
                }),
                albums = albums.Take(5).Select(a => new {
                    a.Id,
                    Title = a.Title,
                    CoverImageUrl = a.CoverImageUrl,
                    Type = "album",
                    ArtistName = a.ArtistName
                }),
                playlists = playlists.Take(5).Select(p => new {
                    p.Id,
                    Title = p.Name,
                    CoverImageUrl = p.CoverImageUrl,
                    Type = "playlist",
                    Owner = p.Username
                })
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SearchController] Error: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred during search" });
        }
    }
}
