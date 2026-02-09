using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface IArtistRepository : IRepository<Artist>
{
    Task<IEnumerable<Artist>> SearchByNameAsync(string name);
    Task<Artist?> GetByIdWithDetailsAsync(Guid id);
}
