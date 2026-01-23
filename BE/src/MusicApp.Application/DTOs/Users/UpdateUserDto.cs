using System.ComponentModel.DataAnnotations;

namespace MusicApp.Application.DTOs.Users;

public class UpdateUserDto
{
    [StringLength(100)]
    public string? DisplayName { get; set; }

    public string? AvatarUrl { get; set; }

    [StringLength(100, MinimumLength = 6)]
    public string? Password { get; set; }
}
