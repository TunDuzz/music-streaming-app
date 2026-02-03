using Microsoft.EntityFrameworkCore;
using MusicApp.Domain.Entities;

namespace MusicApp.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<Song> Songs { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<PlaylistSong> PlaylistSongs { get; set; }
    public DbSet<SongArtist> SongArtists { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<UserFollowsArtist> UserFollowsArtists { get; set; }
    public DbSet<UserLikesSong> UserLikesSongs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PlaylistSong>()
            .HasKey(ps => new { ps.PlaylistId, ps.SongId });

        modelBuilder.Entity<SongArtist>()
            .HasKey(sa => new { sa.SongId, sa.ArtistId });

        modelBuilder.Entity<UserFollowsArtist>()
            .HasKey(ufa => new { ufa.UserId, ufa.ArtistId });

        modelBuilder.Entity<UserLikesSong>()
            .HasKey(uls => new { uls.UserId, uls.SongId });

        ConfigureUserRelationships(modelBuilder);
        ConfigureArtistRelationships(modelBuilder);
        ConfigureAlbumRelationships(modelBuilder);
        ConfigureSongRelationships(modelBuilder);
        ConfigurePlaylistRelationships(modelBuilder);
    }

    private void ConfigureUserRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasMany(u => u.Playlists)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }

    private void ConfigureArtistRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Artist>()
            .HasMany(a => a.Albums)
            .WithOne(al => al.Artist)
            .HasForeignKey(al => al.ArtistId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Artist>()
            .HasMany(a => a.SongArtists)
            .WithOne(sa => sa.Artist)
            .HasForeignKey(sa => sa.ArtistId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureAlbumRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Album>()
            .HasMany(al => al.Songs)
            .WithOne(s => s.Album)
            .HasForeignKey(s => s.AlbumId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private void ConfigureSongRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Song>()
            .HasMany(s => s.PlaylistSongs)
            .WithOne(ps => ps.Song)
            .HasForeignKey(ps => ps.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Song>()
            .HasMany(s => s.SongArtists)
            .WithOne(sa => sa.Song)
            .HasForeignKey(sa => sa.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Song>()
            .HasMany(s => s.LikedByUsers)
            .WithOne(uls => uls.Song)
            .HasForeignKey(uls => uls.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Song>()
            .HasOne(s => s.Genre)
            .WithMany(g => g.Songs)
            .HasForeignKey(s => s.GenreId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private void ConfigurePlaylistRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Playlist>()
            .HasMany(p => p.PlaylistSongs)
            .WithOne(ps => ps.Playlist)
            .HasForeignKey(ps => ps.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Modified)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
