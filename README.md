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

Built with a robust **.NET 9** backend and modern **React 19** frontend, MusicStreamingApp integrates features such as playlist management, intelligent search, seamless music playback, and personalized recommendation systems. Whether you want to create custom playlists, discover new artists, or simply enjoy your favorite music, MusicStreamingApp provides the perfect solution.

## Features

### 🎵 Music Playback
*   **High-Quality Streaming**: Gapless streaming with reliable audio delivery stored via MinIO.
*   **Modern Player UI**:
    *   **Radius Sliders**: Smooth interactive sliders for seek and volume.
    *   **Responsive Controls**: Play, Pause, Skip, Shuffle, Repeat (One/All).
*   **Smart Queue Management**: Intelligent playback queue management with shuffle and repeat features.
*   **Seamless Playback**: Smooth transitions between songs without interruption.

### 🎧 User Features
*   **Personal Library**: Manage your personal music library with albums, artists, and playlists.
*   **Custom Playlists**: Create and manage playlists based on personal preferences.
*   **Favorites System**: Mark favorite songs, albums, and artists.
*   **Listening History**: Track listening history and personal statistics.
*   **Search & Discovery**:
    *   **Search History**: Instantly access recently played songs from the search dropdown.
    *   **Browse Categories**: Discover music by genre (Pop, Rock, Ballad, etc.) when search is idle.
    *   **Smart Search**: Find songs by title or artist with ease.

### 👤 Account Management
*   **Secure Authentication**: Secure authentication system with JWT.
*   **Profile Customization**: Customize personal information and profile picture.
*   **Subscription Plans**: Support for multiple subscription plans (Free, Premium, Family).
*   **Multi-device Support**: Sync data across multiple devices.

### 🎨 Artist & Album Management
*   **Rich Metadata**: Display comprehensive artist, album, and song information.
*   **Album Collections**: Browse and discover albums by genre.
*   **Artist Profiles**: Artist profile pages with complete discography and bio.

### 🛠️ Admin Dashboard
*   **Content Management**: Manage songs, albums, and artists.
    *   Upload Audio & Covers to MinIO storage.
    *   Manage Artist Avatars.
*   **User Management**: Control user accounts and access permissions.
*   **Analytics Dashboard**: Statistics on plays, users, and content.
*   **System Monitoring**: Monitor system performance.

## Technology Stack

### Backend
*   **Framework**: .NET 9 (ASP.NET Core Web API)
*   **Database**: SQL Server 2022+ (Entity Framework Core 9)
*   **Authentication**: JWT Bearer (BCrypt.Net for password hashing)
*   **Object Storage**: MinIO (S3 Compatible) for Audio & Images
*   **Background Jobs**: Hangfire (for scheduled tasks and async processing)
*   **Caching**: Redis (for improved performance)

### Frontend
*   **Framework**: React 19 (via Vite 7)
*   **Styling**: Tailwind CSS 3 (with `tailwind-merge`, `clsx`)
*   **UI Components**: Radix UI Primitives (Slider, Dialog, Dropdown)
*   **Icons**: Lucide React
*   **HTTP Client**: Fetch API / Axios
*   **Routing**: React Router DOM 7
*   **State Management**: React Context API

### Infrastructure & Services
*   **Storage**: MinIO (Self-hosted S3 compatible storage)
*   **Containerization**: Docker support for easy deployment
*   **Source Control**: Git

## System Architecture

MusicStreamingApp follows a **Modular Monolith** architecture based on **Clean Architecture** principles, ensuring separation of concerns, scalability, and maintainability.

### 🏗️ Project Structure

1.  **MusicApp.Domain (Domain Layer)**
    *   Contains core business logic and entities.
    *   Defines interfaces for repositories and services (Repository Pattern).
    *   Has no dependencies on other layers.
    *   **Entities**: `Song`, `Album`, `Artist`, `Playlist`, `User`, `Subscription`

2.  **MusicApp.Application (Application Layer)**
    *   Implements business logic (Use Cases).
    *   Contains DTOs (Data Transfer Objects), Service Interfaces, and Validation logic.
    *   Orchestrates data flow between API and Infrastructure.
    *   **Services**: `SongService`, `PlaylistService`, `SearchService`

3.  **MusicApp.Infrastructure (Infrastructure Layer)**
    *   Implements interfaces defined in Domain.
    *   Manages Database Context (EF Core), File Storage (MinIO), and External APIs.
    *   **Repositories**: `SongRepository`, `ArtistRepository`, `PlaylistRepository`
    *   **Services**: `MinioStorageService`

4.  **MusicApp.API (Presentation Layer)**
    *   Entry point of the application (RESTful API).
    *   Handles HTTP Requests, Authentication (JWT), and Dependency Injection (DI).
    *   **Controllers**: `AuthController`, `SongsController`, `ArtistsController`, `SearchController`

## Database Schema

The system uses **SQL Server** with a relational schema optimized for performance.

### 1. Users Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier for user. |
| `FullName` | `nvarchar(100)` | User's full name. |
| `Email` | `nvarchar(255)` | Email (used for login). |
| `PasswordHash` | `nvarchar(max)` | Hashed password. |
| `Role` | `nvarchar(50)` | User role (`Admin`, `User`). |
| `SubscriptionType` | `int` | Plan type (0:Free, 1:Premium). |
| `ProfileImageUrl` | `nvarchar(500)` | Profile image URL. |
| `CreatedAt` | `datetime2` | Account creation timestamp. |

### 2. Artists Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `Name` | `nvarchar(200)` | Artist name. |
| `Bio` | `nvarchar(max)` | Artist biography. |
| `AvatarObjectKey` | `nvarchar(500)` | **[New]** MinIO Object Key for avatar. |
| `ImageUrl` | `nvarchar(500)` | Public URL for avatar. |
| `CreatedAt` | `datetime2` | Timestamp when added. |

### 3. Songs Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `Title` | `nvarchar(200)` | Song title. |
| `ArtistId` | `int` | **FK**. Performing artist. |
| `AlbumId` | `int` | **FK** (nullable). Album. |
| `Duration` | `int` | Song duration (seconds). |
| `AudioObjectKey` | `nvarchar(500)` | **[New]** MinIO Object Key for audio. |
| `CoverObjectKey` | `nvarchar(500)` | **[New]** MinIO Object Key for cover. |
| `PlayCount` | `bigint` | Number of plays. |
| `CreatedAt` | `datetime2` | Timestamp when added. |

### 4. Playlists Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `UserId` | `int` | **FK**. Playlist creator. |
| `Name` | `nvarchar(200)` | Playlist name. |
| `Description` | `nvarchar(500)` | Playlist description. |
| `IsPublic` | `bit` | Public or private status. |

### 5. PlaylistSongs Table (Many-to-Many)
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `PlaylistId` | `int` | **PK, FK**. Composite key. |
| `SongId` | `int` | **PK, FK**. Composite key. |
| `Order` | `int` | Song order in playlist. |
| `AddedAt` | `datetime2` | Timestamp when added. |

## API Documentation

The API is documented using **Swagger/OpenAPI**. View at `/swagger` when running locally.

### 🔐 Authentication (`/api/Auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/login` | Authenticate and get JWT. |
| `POST` | `/register` | Register new account. |

### 🎵 Songs (`/api/Songs`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get all songs (paginated). |
| `GET` | `/{id}` | Get song details. |
| `GET` | `/search` | Search songs by title/artist. |
| `POST` | `/` | Add new song (Admin, with file upload). |
| `POST` | `/{id}/play` | Increment play count. |

### 🎤 Artists (`/api/Artists`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get all artists. |
| `GET` | `/{id}` | Get artist details. |
| `POST` | `/` | Add new artist (Admin). |

### 📝 Playlists (`/api/Playlists`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/my-playlists` | Get user's playlists. |
| `POST` | `/` | Create playlist. |
| `POST` | `/{id}/songs` | Add song to playlist. |

### ️ Admin (`/api/Admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/dashboard` | System statistics. |
| `GET` | `/users` | Manage users. |

## Installation & Configuration

### Prerequisites
*   **Operating System**: Windows / macOS / Linux
*   **.NET 9 SDK**: [Download](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
*   **Node.js 20+**: [Download](https://nodejs.org/)
*   **SQL Server 2022+**: Local or Docker.
*   **MinIO**: Local or Docker.

### 1. Infrastructure Setup (Docker)
We recommend Docker Compose for databases and storage.

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "YourStrong!Password"
    ports:
      - "1433:1433"
```

### 2. Backend Setup (`/BE`)

#### Configuration (`appsettings.json`)
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=MusicStreamingDb;User Id=sa;Password=YourStrong!Password;TrustServerCertificate=True;"
},
"Minio": {
  "Endpoint": "localhost:9000",
  "AccessKey": "minioadmin",
  "SecretKey": "minioadmin",
  "Bucket": "musicdb",
  "UseSSL": "false"
},
"JwtSettings": {
  "Secret": "YOUR_SUPER_SECURE_SECRET_KEY_MIN_32_CHARS",
  "Issuer": "MusicApp",
  "Audience": "MusicApp",
  "ExpiryInMinutes": 120
}
```

#### Run Migrations & Start
```bash
cd BE
dotnet ef database update -s src/MusicApp.API -p src/MusicApp.Infrastructure
dotnet run --project src/MusicApp.API
```

### 3. Frontend Setup (`/FE`)

#### Install & Run
```bash
cd FE
npm install
npm run dev
```

#### Configuration (`.env`)
```env
VITE_API_URL=https://localhost:7266/api
```

## Development Guide

### Folder Structure

```bash
MusicStreamingApp/
├── BE/                                     # Backend (.NET 9)
│   ├── src/
│   │   ├── MusicApp.API/                   # Controllers, Setup
│   │   ├── MusicApp.Application/           # Services, DTOs
│   │   ├── MusicApp.Domain/                # Entities, Interfaces
│   │   └── MusicApp.Infrastructure/        # EF Core, MinIO
│
└── FE/                                     # Frontend (React 19)
    ├── src/
    │   ├── components/                     # Reusable UI
    │   ├── pages/                          # Application Views
    │   ├── contexts/                       # Player & Auth State
    │   └── services/                       # API integration
```

---

## 📝 License
This project is licensed under the MIT License.

## 👨‍💻 Author
Developed with ❤️ by [TunDuzz]

---
**Start building your music streaming platform with MusicStreamingApp today!** 🎵🚀
