using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface IAlbumRepository : IRepository<Album>
{
    Task<IEnumerable<Album>> GetByArtistIdAsync(Guid artistId);
}
