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
        string audioObjectKey = "";
        string coverObjectKey = "";
        string bucket = "Songs"; 
        // Use "Songs" bucket (folder) in Cloudinary


        try 
        {
            var titleSlug = SanitizeFileName(request.Title);
            
            // 1. Upload Audio
            // Structure: {SongTitleSlug}/audio/{Guid}{ext} (Relative to bucket "Songs")
            var audioParams = GetFileParams(request.AudioFile);
            audioObjectKey = $"{titleSlug}/audio/{Guid.NewGuid()}{audioParams.Extension}";
            
            using var audioStream = request.AudioFile.OpenReadStream();
            var audioResult = await _fileStorageService.UploadFileAsync(audioStream, audioObjectKey, request.AudioFile.ContentType, bucket);
            var audioUrl = audioResult.Url;
            var duration = (int)audioResult.Duration;

            // 2. Upload Cover (if any)
            string? coverUrl = null;
            if (request.CoverFile != null)
            {
                var coverParams = GetFileParams(request.CoverFile);
                coverObjectKey = $"{titleSlug}/cover/{Guid.NewGuid()}{coverParams.Extension}";
                
                using var coverStream = request.CoverFile.OpenReadStream();
                var coverResult = await _fileStorageService.UploadFileAsync(coverStream, coverObjectKey, request.CoverFile.ContentType, bucket);
                coverUrl = coverResult.Url;
            }

            // 3. Create Song in DB
            var dto = new CreateSongDto
            {
                Title = request.Title,
                Duration = duration > 0 ? duration : request.Duration,
                ArtistIds = request.ArtistIds,
                AlbumId = request.AlbumId,
                GenreId = request.GenreId,
                Lyrics = request.Lyrics,
                AudioFileUrl = audioUrl,
                AudioObjectKey = audioObjectKey,
                CoverImageUrl = coverUrl,
                CoverObjectKey = coverObjectKey
            };

            var song = await _songService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = song.Id }, song);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CreateWithUpload] Error: {ex.Message}. Rolling back files...");
            // Rollback
            if (!string.IsNullOrEmpty(audioObjectKey))
                await _fileStorageService.DeleteFileAsync(bucket, audioObjectKey);
            
            if (!string.IsNullOrEmpty(coverObjectKey))
                await _fileStorageService.DeleteFileAsync(bucket, coverObjectKey);

            return StatusCode(500, $"Internal Server Error: {ex.Message}");
        }
    }

    private string SanitizeFileName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "untitled";
        
        var invalidChars = System.IO.Path.GetInvalidFileNameChars();
        var sanitized = new string(name
            .Where(ch => !invalidChars.Contains(ch))
            .ToArray());
            
        return sanitized.Trim().ToLower().Replace(" ", "-");
    }

    private (string FileName, string Extension) GetFileParams(IFormFile file)
    {
        var original = System.IO.Path.GetFileName(file.FileName);
        var ext = System.IO.Path.GetExtension(file.FileName).ToLower();
        return (original, ext);
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
