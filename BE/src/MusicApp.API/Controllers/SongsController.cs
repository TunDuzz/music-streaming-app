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
        string bucket = "music-app"; // Requirement says MusicDB, but code uses 'music-app'. I should probably update this to 'MusicDB' to match requirement OR user input? User said "I use only 1 bucket" but didn't correct the name. I will stick to "music-app" or what is in config? 
        // Wait, user said "Bucket: MusicDB" in the request. I should probably switch to "MusicDB" or use config. 
        // The existing code has "music-app". I'll use "MusicDB" as per requirement.
        bucket = "musicdb"; // MinIO requires lowercase bucket names

        try 
        {
            var titleSlug = SanitizeFileName(request.Title);
            
            // 1. Upload Audio
            // Structure: songs/{SongTitleSlug}/audio/{Guid}{ext}
            var audioParams = GetFileParams(request.AudioFile);
            audioObjectKey = $"songs/{titleSlug}/audio/{Guid.NewGuid()}{audioParams.Extension}";
            
            using var audioStream = request.AudioFile.OpenReadStream();
            var audioUrl = await _fileStorageService.UploadFileAsync(audioStream, audioObjectKey, request.AudioFile.ContentType, bucket);

            // 2. Upload Cover (if any)
            string? coverUrl = null;
            if (request.CoverFile != null)
            {
                var coverParams = GetFileParams(request.CoverFile);
                coverObjectKey = $"songs/{titleSlug}/cover/{Guid.NewGuid()}{coverParams.Extension}";
                
                using var coverStream = request.CoverFile.OpenReadStream();
                coverUrl = await _fileStorageService.UploadFileAsync(coverStream, coverObjectKey, request.CoverFile.ContentType, bucket);
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
