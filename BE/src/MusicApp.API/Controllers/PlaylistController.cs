using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Playlists;
using MusicApp.Application.Interfaces;
using System.Security.Claims;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistController : ControllerBase
{
    private readonly IPlaylistService _playlistService;

    public PlaylistController(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var playlists = await _playlistService.GetAllAsync();
        return Ok(playlists);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var playlist = await _playlistService.GetByIdAsync(id);
        if (playlist == null) return NotFound();
        return Ok(playlist);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(Guid userId)
    {
        var playlists = await _playlistService.GetByUserIdAsync(userId);
        return Ok(playlists);
    }

    [HttpGet("my-playlists")]
    [Authorize]
    public async Task<IActionResult> GetMyPlaylists()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var playlists = await _playlistService.GetByUserIdAsync(Guid.Parse(userId));
        return Ok(playlists);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var created = await _playlistService.CreateAsync(dto, Guid.Parse(userId));
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePlaylistDto dto)
    {
        // Ideally check ownership here
        var updated = await _playlistService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        // Ideally check ownership here
        var success = await _playlistService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/songs/{songId}")]
    [Authorize]
    public async Task<IActionResult> AddSong(Guid id, Guid songId)
    {
        // Ideally check ownership here
        var result = await _playlistService.AddSongToPlaylistAsync(id, songId);
        if (!result) return BadRequest("Could not add song to playlist");
        return Ok(new { message = "Song added to playlist" });
    }

    [HttpDelete("{id}/songs/{songId}")]
    [Authorize]
    public async Task<IActionResult> RemoveSong(Guid id, Guid songId)
    {
        // Ideally check ownership here
        var result = await _playlistService.RemoveSongFromPlaylistAsync(id, songId);
        if (!result) return NotFound("Song not found in playlist");
        return NoContent();
    }

    [HttpPost("{id}/image")]
    [Authorize]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        // Ideally check ownership here
        try
        {
            using var stream = file.OpenReadStream();
            var url = await _playlistService.UploadCoverImageAsync(id, stream, file.FileName, file.ContentType);
            return Ok(new { url });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Playlist not found");
        }
        catch (Exception ex) 
        {
             return BadRequest(ex.Message);
        }
    }


    [HttpGet("liked")]
    [Authorize]
    public async Task<IActionResult> GetLikedSongsPlaylist()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var playlist = await _playlistService.GetLikedSongsPlaylistAsync(Guid.Parse(userId));
        return Ok(playlist);
    }
}
