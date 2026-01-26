using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Songs;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly ISongService _songService;
    private readonly IFileStorageService _fileStorageService;

    public SongsController(ISongService songService, IFileStorageService fileStorageService)
    {
        _songService = songService;
        _fileStorageService = fileStorageService;
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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SongDto>> Create([FromBody] CreateSongDto dto)
    {
        var song = await _songService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
    }

    [HttpPost("with-upload")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SongDto>> CreateWithUpload([FromForm] MusicApp.API.Requests.CreateSongRequest request)
    {
        string audioObjectName = "";
        string coverObjectName = "";
        string bucket = "music-app";

        try 
        {
            // 1. Upload Audio
            var audioExt = Path.GetExtension(request.AudioFile.FileName).ToLower();
            audioObjectName = $"{Guid.NewGuid()}{audioExt}";
            using var audioStream = request.AudioFile.OpenReadStream();
            var audioUrl = await _fileStorageService.UploadFileAsync(audioStream, audioObjectName, request.AudioFile.ContentType, bucket);

            // 2. Upload Cover (if any)
            string? coverUrl = null;
            if (request.CoverFile != null)
            {
                var coverExt = Path.GetExtension(request.CoverFile.FileName).ToLower();
                coverObjectName = $"{Guid.NewGuid()}{coverExt}";
                using var coverStream = request.CoverFile.OpenReadStream();
                coverUrl = await _fileStorageService.UploadFileAsync(coverStream, coverObjectName, request.CoverFile.ContentType, bucket);
            }

            // 3. Create Song in DB
            var dto = new CreateSongDto
            {
                Title = request.Title,
                Duration = request.Duration,
                ArtistId = request.ArtistId,
                AlbumId = request.AlbumId,
                Lyrics = request.Lyrics,
                AudioFileUrl = audioUrl,
                CoverImageUrl = coverUrl
            };

            var song = await _songService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CreateWithUpload] Error: {ex.Message}. Rolling back files...");
            // Rollback
            if (!string.IsNullOrEmpty(audioObjectName))
                await _fileStorageService.DeleteFileAsync(bucket, audioObjectName);
            
            if (!string.IsNullOrEmpty(coverObjectName))
                await _fileStorageService.DeleteFileAsync(bucket, coverObjectName);

            return StatusCode(500, $"Internal Server Error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SongDto>> Update(Guid id, [FromBody] UpdateSongDto dto)
    {
        var song = await _songService.UpdateAsync(id, dto);
        if (song == null)
            return NotFound();

        return Ok(song);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _songService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<SongDto>>> Search([FromQuery] string q)
    {
        var songs = await _songService.SearchAsync(q);
        return Ok(songs);
    }
}
