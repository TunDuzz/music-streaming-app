using MusicApp.Domain.Entities;

namespace MusicApp.Application.Interfaces;

public interface ISongRepository : IRepository<Song>
{
    Task<IEnumerable<Song>> GetByArtistIdAsync(Guid artistId);
    Task<IEnumerable<Song>> GetByAlbumIdAsync(Guid albumId);
    Task<IEnumerable<Song>> SearchByTitleAsync(string title);
    Task<bool> ToggleLikeAsync(Guid songId, Guid userId);
    Task<IEnumerable<Guid>> GetLikedSongIdsAsync(Guid userId);
    Task<IEnumerable<Song>> GetLikedSongsByUserIdAsync(Guid userId);
    Task<IEnumerable<(Song Song, DateTime LikedAt)>> GetLikedSongsWithTimestampAsync(Guid userId);
}
