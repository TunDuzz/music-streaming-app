using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Albums;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumController : ControllerBase
{
    private readonly IAlbumService _albumService;

    public AlbumController(IAlbumService albumService)
    {
        _albumService = albumService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var albums = await _albumService.GetAllAsync();
        return Ok(albums);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var album = await _albumService.GetByIdAsync(id);
        if (album == null) return NotFound();
        return Ok(album);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAlbumDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var created = await _albumService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAlbumDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _albumService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _albumService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
         if (file == null || file.Length == 0)
            return BadRequest("File is empty");

        try
        {
            using var stream = file.OpenReadStream();
            var url = await _albumService.UploadCoverImageAsync(id, stream, file.FileName, file.ContentType);
            return Ok(new { url });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Album not found");
        }
        catch (Exception ex) 
        {
             return BadRequest(ex.Message);
        }
    }
}
