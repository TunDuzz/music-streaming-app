using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using MusicApp.Application.DTOs;
using MusicApp.Application.Interfaces;

namespace MusicApp.Infrastructure.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(IConfiguration configuration)
    {
        var section = configuration.GetSection("Cloudinary");
        var account = new Account(
            section["CloudName"],
            section["ApiKey"],
            section["ApiSecret"]
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<FileUploadResult> UploadFileAsync(Stream fileStream, string fileName, string contentType, string bucketName)
    {
        if (fileStream.Position > 0)
            fileStream.Position = 0;

        // 1. Setup default params for Raw (Generic files)
        // For Raw files, we keep the extension in the PublicId
        var uploadParams = new RawUploadParams()
        {
            File = new FileDescription(fileName, fileStream),
            Folder = bucketName,
            PublicId = fileName, 
            Overwrite = true
        };

        UploadResult uploadResult;
        
        if (contentType.StartsWith("image/"))
        {
            // For Images, Cloudinary manages extension/format, so we use name without extension
            // BUT we must preserve the folder structure if 'fileName' contains path (e.g. "artist/avatar/uid.jpg")
            var ext = Path.GetExtension(fileName);
            var nameWithoutExt = fileName;
             if (fileName.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
            {
                nameWithoutExt = fileName.Substring(0, fileName.Length - ext.Length);
            }
            // Normalize path separators to forward slash for Cloudinary
            nameWithoutExt = nameWithoutExt.Replace("\\", "/");

            var imageParams = new ImageUploadParams()
            {
                File = new FileDescription(fileName, fileStream),
                Folder = bucketName,
                PublicId = nameWithoutExt,
                Overwrite = true
            };
            uploadResult = await _cloudinary.UploadAsync(imageParams);
        }
        else if (contentType.StartsWith("audio/") || contentType.StartsWith("video/"))
        {
             // For Video/Audio, similar to images
            var ext = Path.GetExtension(fileName);
            var nameWithoutExt = fileName;
             if (fileName.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
            {
                nameWithoutExt = fileName.Substring(0, fileName.Length - ext.Length);
            }
             nameWithoutExt = nameWithoutExt.Replace("\\", "/");

            var videoParams = new VideoUploadParams()
            {
                File = new FileDescription(fileName, fileStream),
                Folder = bucketName,
                PublicId = nameWithoutExt,
                Overwrite = true
            };
            uploadResult = await _cloudinary.UploadAsync(videoParams);
        }
        else 
        {
             // Default to Raw
             uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }

        double duration = 0;
        if (uploadResult is VideoUploadResult videoResult)
        {
            duration = videoResult.Duration;
        }

        if (uploadResult.Error != null)
        {
            throw new Exception($"Cloudinary Upload Error: {uploadResult.Error.Message}");
        }

        return new FileUploadResult 
        { 
            Url = uploadResult.SecureUrl.ToString(),
            Duration = duration
        };
    }

    public async Task DeleteFileAsync(string bucketName, string objectName)
    {
        // Cloudinary PublicId logic needs to match Upload logic:
        // 1. Raw files (non-media) -> PublicId = "bucket/filename.ext" (Keep extension)
        // 2. Media files (image/video/audio) -> PublicId = "bucket/filename" (No extension)
        
        // Normalize slashes to forward slash
        objectName = objectName.Replace("\\", "/");
        
        var ext = Path.GetExtension(objectName).ToLower();
        var isMedia = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".mp3", ".wav", ".mp4", ".mov", ".avi", ".mkv" }.Contains(ext);

        string publicId;
        ResourceType resourceType;

        if (isMedia)
        {
            // Media: Remove extension from the end of objectName
            // Note: We can't use Path.GetFileNameWithoutExtension because it strips the folder path.
            // We need to remove the extension from the full path.
            
            var nameWithoutExt = objectName;
            if (objectName.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
            {
                nameWithoutExt = objectName.Substring(0, objectName.Length - ext.Length);
            }
            
            publicId = $"{bucketName}/{nameWithoutExt}";
            
             if (new[] { ".mp3", ".wav", ".mp4", ".mov", ".avi", ".mkv" }.Contains(ext))
             {
                 resourceType = ResourceType.Video; 
             }
             else
             {
                 resourceType = ResourceType.Image;
             }
        }
        else
        {
            // Raw: Keep extension
            publicId = $"{bucketName}/{objectName}";
            resourceType = ResourceType.Raw;
        }

        var deletionParams = new DeletionParams(publicId)
        {
            ResourceType = resourceType
        };
        
        await _cloudinary.DestroyAsync(deletionParams);
    }
}
