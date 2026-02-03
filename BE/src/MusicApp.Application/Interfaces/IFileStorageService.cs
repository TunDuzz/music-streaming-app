using MusicApp.Application.DTOs;

namespace MusicApp.Application.Interfaces;

public interface IFileStorageService
{
    Task<FileUploadResult> UploadFileAsync(Stream fileStream, string fileName, string contentType, string bucketName);
    Task DeleteFileAsync(string bucketName, string objectName);
}
