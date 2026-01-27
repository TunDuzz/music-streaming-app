using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarObjectKeyToArtist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarObjectKey",
                table: "Artists",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarObjectKey",
                table: "Artists");
        }
    }
}
