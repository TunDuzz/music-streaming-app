using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly ISongService _songService;

    public SongsController(ISongService songService)
    {
        _songService = songService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SongDto>>> GetAll()
    {
        var songs = await _songService.GetAllAsync();
        return Ok(songs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SongDto>> GetById(Guid id)
    {
        var song = await _songService.GetByIdAsync(id);
        if (song == null)
            return NotFound();

        return Ok(song);
    }

    [HttpGet("artist/{artistId}")]
    public async Task<ActionResult<IEnumerable<SongDto>>> GetByArtistId(Guid artistId)
    {
        var songs = await _songService.GetByArtistIdAsync(artistId);
        return Ok(songs);
    }

    [HttpPost]
    public async Task<ActionResult<SongDto>> Create([FromBody] CreateSongDto dto)
    {
        var song = await _songService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SongDto>> Update(Guid id, [FromBody] UpdateSongDto dto)
    {
        var song = await _songService.UpdateAsync(id, dto);
        if (song == null)
            return NotFound();

        return Ok(song);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _songService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
