namespace MusicApp.Application.DTOs;

public class FileUploadResult
{
    public string Url { get; set; } = string.Empty;
    public double Duration { get; set; } // Duration in seconds (for audio/video)
}
