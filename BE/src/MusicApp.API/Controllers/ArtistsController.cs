using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistsController : ControllerBase
{
    private readonly IArtistService _artistService;

    public ArtistsController(IArtistService artistService)
    {
        _artistService = artistService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArtistDto>>> GetAll()
    {
        var artists = await _artistService.GetAllAsync();
        return Ok(artists);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ArtistDto>> GetById(Guid id)
    {
        var artist = await _artistService.GetByIdAsync(id);
        if (artist == null)
            return NotFound();

        return Ok(artist);
    }

    [HttpPost]
    public async Task<ActionResult<ArtistDto>> Create([FromBody] CreateArtistDto dto)
    {
        var artist = await _artistService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = artist.Id }, artist);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ArtistDto>> Update(Guid id, [FromBody] UpdateArtistDto dto)
    {
        var artist = await _artistService.UpdateAsync(id, dto);
        if (artist == null)
            return NotFound();

        return Ok(artist);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _artistService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
