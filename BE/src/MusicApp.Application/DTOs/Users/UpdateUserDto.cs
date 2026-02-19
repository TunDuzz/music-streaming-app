using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Users;

public class UpdateUserDto
{
    [StringLength(100)]
    public string? DisplayName { get; set; }

    [StringLength(50)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public string? AvatarUrl { get; set; }

    public string? CurrentPassword { get; set; }

    [StringLength(100, MinimumLength = 6)]
    public string? Password { get; set; }

    public string? Role { get; set; }
}
