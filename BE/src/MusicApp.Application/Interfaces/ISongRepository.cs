using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface ISongRepository : IRepository<Song>
{
    Task<IEnumerable<Song>> GetByArtistIdAsync(Guid artistId);
    Task<IEnumerable<Song>> GetByAlbumIdAsync(Guid albumId);
    Task<IEnumerable<Song>> SearchByTitleAsync(string title);
}
