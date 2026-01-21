# MusicStreamingApp

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation & Configuration](#installation--configuration)
- [Development Guide](#development-guide)

## Overview
**MusicStreamingApp** is a modern music streaming platform built to deliver a seamless and personalized music listening experience. The system allows users to discover, play, and manage their personal music library with a user-friendly interface and high performance.

Built with a robust .NET 9 backend and modern React frontend, MusicStreamingApp integrates features such as playlist management, intelligent search, seamless music playback, and personalized recommendation systems. Whether you want to create custom playlists, discover new artists, or simply enjoy your favorite music, MusicStreamingApp provides the perfect solution.

## Features

### 🎵 Music Playback
*   **High-Quality Streaming**: Stream high-quality music with low latency.
*   **Smart Queue Management**: Intelligent playback queue management with shuffle and repeat features.
*   **Seamless Playback**: Smooth transitions between songs without interruption.
*   **Audio Controls**: Volume control, seek forward/backward, and equalizer.

### 🎧 User Features
*   **Personal Library**: Manage your personal music library with albums, artists, and playlists.
*   **Custom Playlists**: Create and manage playlists based on personal preferences.
*   **Favorites System**: Mark favorite songs, albums, and artists.
*   **Listening History**: Track listening history and personal statistics.
*   **Search & Discovery**: Quick search by song title, artist, or album.

### 👤 Account Management
*   **Secure Authentication**: Secure authentication system with JWT.
*   **Profile Customization**: Customize personal information and profile picture.
*   **Subscription Plans**: Support for multiple subscription plans (Free, Premium, Family).
*   **Multi-device Support**: Sync data across multiple devices.

### 🎨 Artist & Album Management
*   **Rich Metadata**: Display comprehensive artist, album, and song information.
*   **Album Collections**: Browse and discover albums by genre.
*   **Artist Profiles**: Artist profile pages with complete discography.

### 🛠️ Admin Dashboard
*   **Content Management**: Manage songs, albums, and artists.
*   **User Management**: Control user accounts and access permissions.
*   **Analytics Dashboard**: Statistics on plays, active users, and trends.
*   **System Monitoring**: Monitor system performance and resources.

## Technology Stack

### Backend
*   **Framework**: .NET 9 (ASP.NET Core Web API)
*   **Database**: SQL Server (Entity Framework Core)
*   **Authentication**: JWT Bearer (BCrypt.Net for password hashing)
*   **Background Jobs**: Hangfire (for scheduled tasks and async processing)
*   **File Storage**: Cloud storage integration (Supabase/AWS S3)
*   **Caching**: Redis (for improved performance)

### Frontend
*   **Framework**: React 19 (via Vite 7)
*   **Styling**: Tailwind CSS 3
*   **HTTP Client**: Axios
*   **Routing**: React Router DOM 7
*   **State Management**: React Context API / Redux Toolkit
*   **Audio Player**: Howler.js / React Player

### Infrastructure & Services
*   **Storage**: Cloud storage for audio files and images
*   **CDN**: Content Delivery Network for fast media streaming
*   **Containerization**: Docker support for easy deployment

## System Architecture

MusicStreamingApp follows **Clean Architecture** principles, ensuring separation of concerns, scalability, and maintainability.

### 🏗️ Monolithic Architecture (Modular)

The solution is divided into four main projects:

1.  **MusicApp.Domain (Domain Layer)**
    *   Contains core business logic and entities.
    *   Defines interfaces for repositories and services (Repository Pattern).
    *   Has no dependencies on other layers, ensuring purity.
    *   **Entities**: Song, Album, Artist, Playlist, User, Subscription, Genre

2.  **MusicApp.Application (Application Layer)**
    *   Implements business logic (Use Cases).
    *   Contains DTOs (Data Transfer Objects), Service Interfaces, and Validation logic.
    *   Orchestrates data flow between API and Infrastructure.
    *   **Services**: PlaylistService, SongService, UserService, SearchService

3.  **MusicApp.Infrastructure (Infrastructure Layer)**
    *   Implements interfaces defined in Domain (Repositories, External Services).
    *   Manages Database Context (EF Core), File Storage, and External APIs.
    *   Handles Background Jobs (Hangfire) and Caching (Redis).
    *   **Repositories**: SongRepository, AlbumRepository, PlaylistRepository, UserRepository

4.  **MusicApp.API (Presentation Layer)**
    *   Entry point of the application (RESTful API).
    *   Handles HTTP Requests, Authentication (JWT), and Dependency Injection (DI).
    *   Exposes endpoints for Frontend.
    *   **Controllers**: AuthController, SongController, PlaylistController, UserController, AdminController

## Database Schema

The system uses **SQL Server** with a relational schema optimized for performance and data integrity.

### 1. Users Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier for user. |
| `FullName` | `nvarchar(100)` | User's full name. |
| `Email` | `nvarchar(255)` | Email (used for login). |
| `PasswordHash` | `nvarchar(max)` | Hashed password (BCrypt). |
| `Role` | `nvarchar(50)` | User role (`Admin`, `User`). |
| `SubscriptionType` | `int` | Subscription plan type (0:Free, 1:Premium, 2:Family). |
| `ProfileImageUrl` | `nvarchar(500)` | Profile image URL. |
| `IsActive` | `bit` | Account status. |
| `CreatedAt` | `datetime2` | Account creation timestamp. |
| `LastLoginAt` | `datetime2` | Last login timestamp. |

### 2. Artists Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier for artist. |
| `Name` | `nvarchar(200)` | Artist name. |
| `Bio` | `nvarchar(max)` | Artist biography. |
| `ImageUrl` | `nvarchar(500)` | Artist image URL. |
| `Country` | `nvarchar(100)` | Country. |
| `CreatedAt` | `datetime2` | Timestamp when added to system. |

### 3. Albums Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier for album. |
| `Title` | `nvarchar(200)` | Album title. |
| `ArtistId` | `int` | **FK**. Artist who owns the album. |
| `CoverImageUrl` | `nvarchar(500)` | Album cover image URL. |
| `ReleaseDate` | `datetime2` | Release date. |
| `Genre` | `nvarchar(100)` | Music genre. |
| `CreatedAt` | `datetime2` | Timestamp when added to system. |

### 4. Songs Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier for song. |
| `Title` | `nvarchar(200)` | Song title. |
| `ArtistId` | `int` | **FK**. Performing artist. |
| `AlbumId` | `int` | **FK** (nullable). Album containing the song. |
| `Duration` | `int` | Song duration (seconds). |
| `FileUrl` | `nvarchar(500)` | Audio file URL. |
| `CoverImageUrl` | `nvarchar(500)` | Cover image URL. |
| `Genre` | `nvarchar(100)` | Music genre. |
| `PlayCount` | `bigint` | Number of plays. |
| `ReleaseDate` | `datetime2` | Release date. |
| `CreatedAt` | `datetime2` | Timestamp when added to system. |

### 5. Playlists Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier for playlist. |
| `UserId` | `int` | **FK**. Playlist creator. |
| `Name` | `nvarchar(200)` | Playlist name. |
| `Description` | `nvarchar(500)` | Playlist description. |
| `CoverImageUrl` | `nvarchar(500)` | Cover image URL. |
| `IsPublic` | `bit` | Public or private playlist. |
| `CreatedAt` | `datetime2` | Creation timestamp. |
| `UpdatedAt` | `datetime2` | Last update timestamp. |

### 6. PlaylistSongs Table (Many-to-Many)
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `PlaylistId` | `int` | **PK, FK**. Composite key linking to Playlist. |
| `SongId` | `int` | **PK, FK**. Composite key linking to Song. |
| `AddedAt` | `datetime2` | Timestamp when song was added to playlist. |
| `Order` | `int` | Song order in playlist. |

### 7. UserFavorites Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `UserId` | `int` | **FK**. User who favorited. |
| `SongId` | `int` | **FK** (nullable). Favorited song. |
| `AlbumId` | `int` | **FK** (nullable). Favorited album. |
| `ArtistId` | `int` | **FK** (nullable). Favorited artist. |
| `CreatedAt` | `datetime2` | Timestamp when favorited. |

### 8. ListeningHistory Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `UserId` | `int` | **FK**. User who listened. |
| `SongId` | `int` | **FK**. Song that was played. |
| `PlayedAt` | `datetime2` | Playback timestamp. |
| `Duration` | `int` | Listen duration (seconds). |

## API Documentation

The API is documented using **Swagger/OpenAPI**. You can view the interactive documentation at `/swagger` when running the application locally.

### 🔐 Authentication (`/api/Auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user and retrieve JWT token. |
| `POST` | `/register` | Register a new user account. |
| `POST` | `/change-password` | Change user password. |
| `POST` | `/refresh-token` | Refresh access token. |

### 🎵 Songs (`/api/Song`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get list of all songs (paginated). |
| `GET` | `/{id}` | Get detailed song information. |
| `GET` | `/search` | Search songs by title, artist. |
| `GET` | `/trending` | Get list of trending songs. |
| `POST` | `/` | Add new song (Admin only). |
| `PUT` | `/{id}` | Update song information (Admin only). |
| `DELETE` | `/{id}` | Delete song (Admin only). |
| `POST` | `/{id}/play` | Record song play count. |

### 📀 Albums (`/api/Album`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get list of albums (paginated). |
| `GET` | `/{id}` | Get detailed album information. |
| `GET` | `/{id}/songs` | Get list of songs in album. |
| `POST` | `/` | Add new album (Admin only). |
| `PUT` | `/{id}` | Update album information (Admin only). |
| `DELETE` | `/{id}` | Delete album (Admin only). |

### 🎤 Artists (`/api/Artist`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get list of artists (paginated). |
| `GET` | `/{id}` | Get detailed artist information. |
| `GET` | `/{id}/songs` | Get list of artist's songs. |
| `GET` | `/{id}/albums` | Get list of artist's albums. |
| `POST` | `/` | Add new artist (Admin only). |
| `PUT` | `/{id}` | Update artist information (Admin only). |
| `DELETE` | `/{id}` | Delete artist (Admin only). |

### 📝 Playlists (`/api/Playlist`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/my-playlists` | Get user's playlists. |
| `GET` | `/{id}` | Get detailed playlist information. |
| `POST` | `/` | Create new playlist. |
| `PUT` | `/{id}` | Update playlist information. |
| `DELETE` | `/{id}` | Delete playlist. |
| `POST` | `/{id}/songs` | Add song to playlist. |
| `DELETE` | `/{id}/songs/{songId}` | Remove song from playlist. |

### 👤 User (`/api/User`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/profile` | Get user profile information. |
| `PUT` | `/profile` | Update profile information. |
| `GET` | `/favorites` | Get favorites list. |
| `POST` | `/favorites` | Add to favorites. |
| `DELETE` | `/favorites/{id}` | Remove from favorites. |
| `GET` | `/history` | Get listening history. |

### 🛡️ Admin (`/api/Admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/dashboard` | Get system overview statistics. |
| `GET` | `/users` | Get list of all users. |
| `POST` | `/users/{id}/lock` | Lock user account. |
| `POST` | `/users/{id}/unlock` | Unlock user account. |
| `DELETE` | `/users/{id}` | Delete user. |

## Installation & Configuration

### Prerequisites
Before starting, ensure your development environment is ready:

*   **Operating System**: Windows / macOS / Linux
*   **.NET 9 SDK**: [Download here](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) - Verify with `dotnet --version`
*   **SQL Server 2022+**: Local instance or Docker container.
*   **Node.js 20+**: [Download here](https://nodejs.org/) - Verify with `node --version`
*   **Docker Desktop** (Optional): For easier deployment.

### ⚙️ Backend Setup

#### 1. Clone & Restore
```bash
git clone <your-repository-url>
cd MusicStreamingApp/BE
dotnet restore
```

#### 2. Configuration (`appsettings.json`)
The backend requires configuration information to function. Open `src/MusicApp.API/appsettings.json` and configure the following sections:

**Database Connection**
Ensure SQL Server is running and accessible.
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=MusicStreamingDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

**JWT Settings**
Generate a random 32+ character string for security.
```json
"JwtSettings": {
  "Secret": "YOUR_SUPER_SECURE_SECRET_KEY_MIN_32_CHARS_HERE",
  "Issuer": "MusicStreamingApp",
  "Audience": "MusicStreamingApp",
  "ExpiryInMinutes": 60
}
```

**Storage Configuration** (Supabase/AWS S3)
```json
"Storage": {
  "Provider": "Supabase",
  "Url": "https://your-project-id.supabase.co",
  "ApiKey": "your-anon-public-key",
  "Bucket": "music-files"
}
```

**Hangfire Configuration**
```json
"Hangfire": {
  "DashboardPath": "/hangfire",
  "ServerName": "MusicStreamingApp-Server"
}
```

#### 3. Database Initialization
Apply Entity Framework Core migrations to create the database schema.
```bash
# Run from the /BE directory
dotnet ef database update -s src/MusicApp.API -p src/MusicApp.Infrastructure
```
*If this fails, install the EF Core tool globally:* `dotnet tool install --global dotnet-ef`

#### 4. Running the Application
Start the backend API.
```bash
dotnet run --project src/MusicApp.API
```

#### 5. Verification
*   **Swagger UI**: Visit `https://localhost:7266/swagger` to explore endpoints.
*   **Hangfire Dashboard**: Visit `https://localhost:7266/hangfire` to monitor background jobs.

### 💻 Frontend Setup

#### 1. Navigate to Directory
```bash
cd MusicStreamingApp/FE
```

#### 2. Install Dependencies
Install all required Node.js packages.
```bash
npm install
```

#### 3. Configuration (`.env`)
Create a `.env` file in the root of the `FE` directory to connect to your backend API.

```env
# Point to your running .NET API URL
VITE_API_URL=https://localhost:7266/api
```

#### 4. Running the Application
Start the development server.
```bash
npm run dev
```

#### 5. Usage
Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).
*   **Sign Up**: Create a new account.
*   **Login**: Access your dashboard.
*   **Explore**: Discover music, create playlists, and enjoy your favorite tunes!

## Development Guide

### 📂 Project Structure

```bash
MusicStreamingApp/
├── BE/                                     # Backend (.NET 9)
│   ├── src/
│   │   ├── MusicApp.API/                   # Presentation Layer
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.cs
│   │   │   │   ├── SongController.cs
│   │   │   │   ├── AlbumController.cs
│   │   │   │   ├── ArtistController.cs
│   │   │   │   ├── PlaylistController.cs
│   │   │   │   ├── UserController.cs
│   │   │   │   └── AdminController.cs
│   │   │   ├── Extensions/                # Service Configuration
│   │   │   │   ├── DependencyInjection.cs
│   │   │   │   ├── JwtExtensions.cs
│   │   │   │   └── CorsConfiguration.cs
│   │   │   ├── Middleware/                # Custom Middleware
│   │   │   ├── appsettings.json           # Configuration
│   │   │   └── Program.cs                 # Entry Point
│   │   │
│   │   ├── MusicApp.Application/          # Application Layer
│   │   │   ├── DTOs/                      # Data Transfer Objects
│   │   │   │   ├── Auth/
│   │   │   │   ├── Song/
│   │   │   │   ├── Album/
│   │   │   │   ├── Playlist/
│   │   │   │   └── User/
│   │   │   ├── Interfaces/                # Service Interfaces
│   │   │   └── Services/                  # Business Logic
│   │   │       ├── SongService.cs
│   │   │       ├── PlaylistService.cs
│   │   │       ├── UserService.cs
│   │   │       └── SearchService.cs
│   │   │
│   │   ├── MusicApp.Domain/               # Domain Layer
│   │   │   ├── Entities/                  # DB Models
│   │   │   │   ├── User.cs
│   │   │   │   ├── Song.cs
│   │   │   │   ├── Album.cs
│   │   │   │   ├── Artist.cs
│   │   │   │   ├── Playlist.cs
│   │   │   │   └── ...
│   │   │   ├── Enums/                     # Enumerations
│   │   │   │   ├── SubscriptionType.cs
│   │   │   │   ├── SongQuality.cs
│   │   │   │   └── UserRole.cs
│   │   │   └── Interfaces/                # Repository Interfaces
│   │   │
│   │   └── MusicApp.Infrastructure/       # Infrastructure Layer
│   │       ├── Data/                      # Database Context
│   │       │   ├── ApplicationDbContext.cs
│   │       │   └── DatabaseSeeder.cs
│   │       ├── Migrations/                # EF Core Migrations
│   │       ├── Repositories/              # Repository Implementation
│   │       │   ├── SongRepository.cs
│   │       │   ├── AlbumRepository.cs
│   │       │   ├── PlaylistRepository.cs
│   │       │   └── UserRepository.cs
│   │       └── Services/                  # External Services
│   │           ├── StorageService.cs
│   │           ├── CacheService.cs
│   │           └── EmailService.cs
│   │
│   
│
└── FE/                                     # Frontend (React)
    ├── src/
    │   ├── components/                    # Shared UI Components
    │   │   ├── AudioPlayer/
    │   │   ├── SongCard/
    │   │   ├── PlaylistCard/
    │   │   └── Navbar/
    │   ├── layouts/                       # Page Layouts
    │   │   └── MainLayout.jsx
    │   ├── pages/                         # Views
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Library.jsx
    │   │   ├── Playlist.jsx
    │   │   ├── Artist.jsx
    │   │   ├── Album.jsx
    │   │   ├── Search.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/                      # API Services
    │   │   ├── api.js                     # Axios Instance
    │   │   ├── auth.service.js
    │   │   ├── song.service.js
    │   │   ├── playlist.service.js
    │   │   └── user.service.js
    │   ├── context/                       # React Context
    │   │   ├── AuthContext.jsx
    │   │   └── PlayerContext.jsx
    │   ├── hooks/                         # Custom Hooks
    │   ├── utils/                         # Utility Functions
    │   └── App.jsx                        # Router Configuration
```

### 🎯 Development Workflow

1.  **Backend Development**:
    *   Create entities in `MusicApp.Domain/Entities/`
    *   Define repository interfaces in `MusicApp.Domain/Interfaces/`
    *   Implement repositories in `MusicApp.Infrastructure/Repositories/`
    *   Create DTOs in `MusicApp.Application/DTOs/`
    *   Implement services in `MusicApp.Application/Services/`
    *   Create controllers in `MusicApp.API/Controllers/`
    *   Run migrations: `dotnet ef migrations add <MigrationName>`

2.  **Frontend Development**:
    *   Create components in `src/components/`
    *   Create pages in `src/pages/`
    *   Implement API services in `src/services/`
    *   Manage state with Context API in `src/context/`
    *   Style with Tailwind CSS

### 🐛 Common Issues & Fixes

*   **CORS Errors**: Ensure `appsettings.json` allows the frontend URL (default `http://localhost:5173`).
*   **Database Connection Failed**: Verify SQL Server is running and connection string is correct.
*   **JWT Token Invalid**: Ensure `JwtSettings.Secret` is consistent across runs.
*   **File Upload Failed**: Check storage configuration (Supabase/S3) and bucket permissions.

### 🚀 Deployment

#### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

#### Production Build
```bash
# Backend
dotnet publish -c Release -o ./publish

# Frontend
npm run build
```

---

## 📝 License
This project is licensed under the MIT License.

## 👨‍💻 Author
Developed with ❤️ by [TunDuzz]

---

**Start building your music streaming platform with MusicStreamingApp today!** 🎵🚀