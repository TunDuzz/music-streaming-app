using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
