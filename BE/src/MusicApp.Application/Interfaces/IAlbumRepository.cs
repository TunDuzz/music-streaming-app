using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface IAlbumRepository : IRepository<Album>
{
    Task<IEnumerable<Album>> GetByArtistIdAsync(Guid artistId);
    Task<IEnumerable<Album>> SearchAsync(string query);
    Task<Album?> GetByIdWithSongsAsync(Guid id);
}
