using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using MusicApp.Application.Interfaces;

namespace MusicApp.Infrastructure.Services;

public class MinioStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly IConfiguration _configuration;

    public MinioStorageService(IMinioClient minioClient, IConfiguration configuration)
    {
        _minioClient = minioClient;
        _configuration = configuration;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string bucketName)
    {
        try
        {
            Console.WriteLine($"[MinIO] Starting upload. Bucket: {bucketName}, File: {fileName}, ContentType: {contentType}");
            
            // 1. Ensure bucket exists
            var foundArgs = new BucketExistsArgs().WithBucket(bucketName);
            bool found = await _minioClient.BucketExistsAsync(foundArgs);
            if (!found)
            {
                Console.WriteLine($"[MinIO] Bucket {bucketName} not found. Creating...");
                var makeArgs = new MakeBucketArgs().WithBucket(bucketName);
                await _minioClient.MakeBucketAsync(makeArgs);
                
                // Set basic public read policy
                string policyJson = $@"{{
                    ""Version"": ""2012-10-17"",
                    ""Statement"": [
                        {{
                            ""Effect"": ""Allow"",
                            ""Principal"": {{""AWS"": ""*""}},
                            ""Action"": [""s3:GetObject""],
                            ""Resource"": [""arn:aws:s3:::{bucketName}/*""]
                        }}
                    ]
                }}";
                
                await _minioClient.SetPolicyAsync(new SetPolicyArgs().WithBucket(bucketName).WithPolicy(policyJson));
                Console.WriteLine($"[MinIO] Bucket created and policy set.");
            }

            // 2. Upload file
            if (fileStream.Position > 0)
                fileStream.Position = 0;

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(fileName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            Console.WriteLine($"[MinIO] Uploading object via PutObjectAsync...");
            await _minioClient.PutObjectAsync(putObjectArgs);
            Console.WriteLine($"[MinIO] Upload success.");

            // 3. Return Public URL
            var endpoint = _configuration["Minio:Endpoint"];
            var useSSLStr = _configuration["Minio:UseSSL"];
            var useSSL = !string.IsNullOrEmpty(useSSLStr) && bool.Parse(useSSLStr);
            var protocol = useSSL ? "https" : "http";
            
            var url = $"{protocol}://{endpoint}/{bucketName}/{fileName}";
            Console.WriteLine($"[MinIO] Generated URL: {url}");
            return url;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[MinIO] ERROR: {ex.Message}");
            Console.WriteLine($"[MinIO] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
                 Console.WriteLine($"[MinIO] Inner: {ex.InnerException.Message}");
            throw;
        }
    }

    public async Task DeleteFileAsync(string bucketName, string objectName)
    {
        var args = new RemoveObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName);
        await _minioClient.RemoveObjectAsync(args);
    }
}
