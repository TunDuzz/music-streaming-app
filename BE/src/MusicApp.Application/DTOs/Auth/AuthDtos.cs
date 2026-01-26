using MusicApp.Application.DTOs.Users;

namespace MusicApp.Application.DTOs.Auth;

public class LoginDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}

public class RegisterDto
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string DisplayName { get; set; }
}

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required UserDto User { get; set; }
}
