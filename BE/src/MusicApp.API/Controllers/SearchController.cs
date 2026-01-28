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

    public SearchController(ISongService songService, IArtistService artistService)
    {
        _songService = songService;
        _artistService = artistService;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        Console.WriteLine($"[SearchController] Searching for: '{q}'");

        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { songs = new List<object>(), artists = new List<object>() });

        try 
        {
            // Sequential search (DbContext is not thread-safe)
            var songs = await _songService.SearchAsync(q);
            
            // Use optimized Artist Search (prioritizes StartsWith)
            var artists = await _artistService.SearchAsync(q);
            
            Console.WriteLine($"[SearchController] Found {songs.Count()} songs and {artists.Count()} artists.");

            return Ok(new 
            {
                songs = songs.Take(5).Select(s => new {
                    s.Id,
                    s.Title,
                    s.CoverImageUrl,
                    s.AudioFileUrl, // Added for playback
                    Type = "song",
                    ArtistName = s.ArtistName ?? "Unknown"
                }),
                artists = artists.Take(5).Select(a => new {
                    a.Id,
                    Title = a.Name ?? "Unknown", // Unified 'Title'
                    CoverImageUrl = a.AvatarUrl,
                    Type = "artist"
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
