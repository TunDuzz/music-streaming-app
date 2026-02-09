using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicApp.Application.Interfaces;

namespace MusicApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;

    public FilesController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    [HttpPost("upload")]
    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string bucket = "musicdb")
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty");

        // Simple validation
        var allowedExtensions = new[] { ".mp3", ".wav", ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest($"Extension {ext} not allowed");

        // Unique filename to prevent collision
        var objectName = $"{Guid.NewGuid()}{ext}";

        try 
        {
            using var stream = file.OpenReadStream();
            var result = await _fileStorageService.UploadFileAsync(stream, objectName, file.ContentType, bucket);
            return Ok(new { url = result.Url, duration = result.Duration });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
