using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.DTOs.Artists;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistsController : ControllerBase
{
    private readonly IArtistService _artistService;
    private readonly IFileStorageService _fileStorageService;

    public ArtistsController(IArtistService artistService, IFileStorageService fileStorageService)
    {
        _artistService = artistService;
        _fileStorageService = fileStorageService;
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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ArtistDto>> Create([FromBody] CreateArtistDto dto)
    {
        var artist = await _artistService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = artist.Id }, artist);
    }

    [HttpPost("with-upload")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ArtistDto>> CreateWithUpload([FromForm] CreateArtistRequest request)
    {
        string avatarObjectKey = "";
        string bucket = "musicdb";

        try 
        {
            string? avatarUrl = null;
            if (request.AvatarFile != null)
            {
                var titleSlug = SanitizeFileName(request.Name);
                var ext = Path.GetExtension(request.AvatarFile.FileName).ToLower();
                // Structure: artists/{ArtistName}/avatar/{Guid}.ext
                avatarObjectKey = $"artists/{titleSlug}/avatar/{Guid.NewGuid()}{ext}";
                
                using var stream = request.AvatarFile.OpenReadStream();
                avatarUrl = await _fileStorageService.UploadFileAsync(stream, avatarObjectKey, request.AvatarFile.ContentType, bucket);
            }

            var dto = new CreateArtistDto
            {
                Name = request.Name,
                Bio = request.Bio,
                Country = request.Country,
                AvatarUrl = avatarUrl,
                AvatarObjectKey = avatarObjectKey
            };

            var artist = await _artistService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = artist.Id }, artist);
        }
        catch (Exception ex)
        {
             if (!string.IsNullOrEmpty(avatarObjectKey))
                await _fileStorageService.DeleteFileAsync(bucket, avatarObjectKey);
            return StatusCode(500, ex.Message);
        }
    }

    public class CreateArtistRequest 
    {
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? Country { get; set; }
        public IFormFile? AvatarFile { get; set; }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ArtistDto>> Update(Guid id, [FromBody] UpdateArtistDto dto)
    {
        var artist = await _artistService.UpdateAsync(id, dto);
        if (artist == null)
            return NotFound();

        return Ok(artist);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _artistService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/images")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadImages(Guid id, [FromForm] List<IFormFile> files)
    {
        var artist = await _artistService.GetByIdAsync(id);
        if (artist == null) return NotFound("Artist not found");

        var bucket = "musicdb";
        var titleSlug = SanitizeFileName(artist.Name);
        var uploadedKeys = new List<string>();

        // Deserialize existing keys if any
        if (!string.IsNullOrEmpty(artist.ArtistImageObjectKeys))
        {
            try 
            {
                var existing = System.Text.Json.JsonSerializer.Deserialize<List<string>>(artist.ArtistImageObjectKeys);
                if(existing != null) uploadedKeys.AddRange(existing);
            }
            catch {}
        }

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            var ext = Path.GetExtension(file.FileName).ToLower();
            // Structure: artists/{ArtistName}/images/{Guid}{ext}
            var objectKey = $"artists/{titleSlug}/images/{Guid.NewGuid()}{ext}";

            using var stream = file.OpenReadStream();
            await _fileStorageService.UploadFileAsync(stream, objectKey, file.ContentType, bucket);
            uploadedKeys.Add(objectKey);
        }

        // Update Artist with new keys
        var updateDto = new UpdateArtistDto
        {
            ArtistImageObjectKeys = System.Text.Json.JsonSerializer.Serialize(uploadedKeys)
        };

        await _artistService.UpdateAsync(id, updateDto);

        return Ok(new { Message = "Images uploaded", Keys = uploadedKeys });
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
}
