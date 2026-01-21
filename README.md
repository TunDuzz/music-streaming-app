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
**MusicStreamingApp** là một nền tảng phát nhạc trực tuyến hiện đại, được xây dựng với mục tiêu mang đến trải nghiệm nghe nhạc mượt mà và cá nhân hóa cho người dùng. Hệ thống cho phép người dùng khám phá, phát và quản lý thư viện nhạc cá nhân với giao diện thân thiện và hiệu suất cao.

Được phát triển với backend .NET 9 mạnh mẽ và frontend React hiện đại, MusicStreamingApp tích hợp các tính năng như quản lý playlist, tìm kiếm thông minh, phát nhạc liền mạch, và hệ thống đề xuất cá nhân hóa. Dù bạn muốn tạo playlist riêng, khám phá nghệ sĩ mới, hay đơn giản là thưởng thức âm nhạc yêu thích, MusicStreamingApp cung cấp giải pháp hoàn hảo.

## Features

### 🎵 Music Playback
*   **High-Quality Streaming**: Phát nhạc chất lượng cao với độ trễ thấp.
*   **Smart Queue Management**: Quản lý hàng đợi phát nhạc thông minh với tính năng shuffle và repeat.
*   **Seamless Playback**: Chuyển đổi giữa các bài hát mượt mà không gián đoạn.
*   **Audio Controls**: Điều khiển âm lượng, tua nhanh/lùi, và equalizer.

### 🎧 User Features
*   **Personal Library**: Quản lý thư viện nhạc cá nhân với albums, artists, và playlists.
*   **Custom Playlists**: Tạo và quản lý playlist theo sở thích cá nhân.
*   **Favorites System**: Đánh dấu bài hát, album, và nghệ sĩ yêu thích.
*   **Listening History**: Theo dõi lịch sử nghe nhạc và thống kê cá nhân.
*   **Search & Discovery**: Tìm kiếm nhanh chóng theo tên bài hát, nghệ sĩ, hoặc album.

### 👤 Account Management
*   **Secure Authentication**: Hệ thống xác thực an toàn với JWT.
*   **Profile Customization**: Tùy chỉnh thông tin cá nhân và ảnh đại diện.
*   **Subscription Plans**: Hỗ trợ nhiều gói đăng ký (Free, Premium, Family).
*   **Multi-device Support**: Đồng bộ dữ liệu trên nhiều thiết bị.

### 🎨 Artist & Album Management
*   **Rich Metadata**: Hiển thị đầy đủ thông tin nghệ sĩ, album, và bài hát.
*   **Album Collections**: Duyệt và khám phá albums theo thể loại.
*   **Artist Profiles**: Trang cá nhân nghệ sĩ với discography đầy đủ.

### 🛠️ Admin Dashboard
*   **Content Management**: Quản lý bài hát, albums, và nghệ sĩ.
*   **User Management**: Kiểm soát tài khoản người dùng và quyền truy cập.
*   **Analytics Dashboard**: Thống kê lượt nghe, người dùng hoạt động, và xu hướng.
*   **System Monitoring**: Giám sát hiệu suất hệ thống và tài nguyên.

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

MusicStreamingApp tuân theo nguyên tắc **Clean Architecture**, đảm bảo tách biệt các mối quan tâm, khả năng mở rộng và dễ bảo trì.

### 🏗️ Monolithic Architecture (Modular)

Giải pháp được chia thành bốn project chính:

1.  **MusicApp.Domain (Domain Layer)**
    *   Chứa logic nghiệp vụ cốt lõi và entities.
    *   Định nghĩa interfaces cho repositories và services (Repository Pattern).
    *   Không phụ thuộc vào bất kỳ layer nào khác, đảm bảo tính thuần túy.
    *   **Entities**: Song, Album, Artist, Playlist, User, Subscription, Genre

2.  **MusicApp.Application (Application Layer)**
    *   Triển khai business logic (Use Cases).
    *   Chứa DTOs (Data Transfer Objects), Service Interfaces, và Validation logic.
    *   Điều phối luồng dữ liệu giữa API và Infrastructure.
    *   **Services**: PlaylistService, SongService, UserService, SearchService

3.  **MusicApp.Infrastructure (Infrastructure Layer)**
    *   Triển khai interfaces được định nghĩa trong Domain (Repositories, External Services).
    *   Quản lý Database Context (EF Core), File Storage, và External APIs.
    *   Xử lý Background Jobs (Hangfire) và Caching (Redis).
    *   **Repositories**: SongRepository, AlbumRepository, PlaylistRepository, UserRepository

4.  **MusicApp.API (Presentation Layer)**
    *   Entry point của ứng dụng (RESTful API).
    *   Xử lý HTTP Requests, Authentication (JWT), và Dependency Injection (DI).
    *   Expose endpoints cho Frontend.
    *   **Controllers**: AuthController, SongController, PlaylistController, UserController, AdminController

## Database Schema

Hệ thống sử dụng **SQL Server** với schema quan hệ được tối ưu hóa cho hiệu suất và tính toàn vẹn dữ liệu.

### 1. Users Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier cho user. |
| `FullName` | `nvarchar(100)` | Tên đầy đủ của người dùng. |
| `Email` | `nvarchar(255)` | Email (dùng để đăng nhập). |
| `PasswordHash` | `nvarchar(max)` | Mật khẩu đã hash (BCrypt). |
| `Role` | `nvarchar(50)` | Vai trò (`Admin`, `User`). |
| `SubscriptionType` | `int` | Loại gói đăng ký (0:Free, 1:Premium, 2:Family). |
| `ProfileImageUrl` | `nvarchar(500)` | URL ảnh đại diện. |
| `IsActive` | `bit` | Trạng thái tài khoản. |
| `CreatedAt` | `datetime2` | Thời gian tạo tài khoản. |
| `LastLoginAt` | `datetime2` | Lần đăng nhập cuối. |

### 2. Artists Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier cho artist. |
| `Name` | `nvarchar(200)` | Tên nghệ sĩ. |
| `Bio` | `nvarchar(max)` | Tiểu sử nghệ sĩ. |
| `ImageUrl` | `nvarchar(500)` | URL ảnh nghệ sĩ. |
| `Country` | `nvarchar(100)` | Quốc gia. |
| `CreatedAt` | `datetime2` | Thời gian thêm vào hệ thống. |

### 3. Albums Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier cho album. |
| `Title` | `nvarchar(200)` | Tên album. |
| `ArtistId` | `int` | **FK**. Nghệ sĩ sở hữu album. |
| `CoverImageUrl` | `nvarchar(500)` | URL ảnh bìa album. |
| `ReleaseDate` | `datetime2` | Ngày phát hành. |
| `Genre` | `nvarchar(100)` | Thể loại nhạc. |
| `CreatedAt` | `datetime2` | Thời gian thêm vào hệ thống. |

### 4. Songs Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier cho bài hát. |
| `Title` | `nvarchar(200)` | Tên bài hát. |
| `ArtistId` | `int` | **FK**. Nghệ sĩ thể hiện. |
| `AlbumId` | `int` | **FK** (nullable). Album chứa bài hát. |
| `Duration` | `int` | Độ dài bài hát (giây). |
| `FileUrl` | `nvarchar(500)` | URL file audio. |
| `CoverImageUrl` | `nvarchar(500)` | URL ảnh bìa. |
| `Genre` | `nvarchar(100)` | Thể loại. |
| `PlayCount` | `bigint` | Số lượt phát. |
| `ReleaseDate` | `datetime2` | Ngày phát hành. |
| `CreatedAt` | `datetime2` | Thời gian thêm vào hệ thống. |

### 5. Playlists Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier cho playlist. |
| `UserId` | `int` | **FK**. Người tạo playlist. |
| `Name` | `nvarchar(200)` | Tên playlist. |
| `Description` | `nvarchar(500)` | Mô tả playlist. |
| `CoverImageUrl` | `nvarchar(500)` | URL ảnh bìa. |
| `IsPublic` | `bit` | Playlist công khai hay riêng tư. |
| `CreatedAt` | `datetime2` | Thời gian tạo. |
| `UpdatedAt` | `datetime2` | Lần cập nhật cuối. |

### 6. PlaylistSongs Table (Many-to-Many)
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `PlaylistId` | `int` | **PK, FK**. Composite key linking to Playlist. |
| `SongId` | `int` | **PK, FK**. Composite key linking to Song. |
| `AddedAt` | `datetime2` | Thời gian thêm bài hát vào playlist. |
| `Order` | `int` | Thứ tự bài hát trong playlist. |

### 7. UserFavorites Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `UserId` | `int` | **FK**. User đánh dấu yêu thích. |
| `SongId` | `int` | **FK** (nullable). Bài hát yêu thích. |
| `AlbumId` | `int` | **FK** (nullable). Album yêu thích. |
| `ArtistId` | `int` | **FK** (nullable). Nghệ sĩ yêu thích. |
| `CreatedAt` | `datetime2` | Thời gian đánh dấu. |

### 8. ListeningHistory Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `Id` | `int` | **PK**. Unique identifier. |
| `UserId` | `int` | **FK**. User nghe nhạc. |
| `SongId` | `int` | **FK**. Bài hát được nghe. |
| `PlayedAt` | `datetime2` | Thời gian phát. |
| `Duration` | `int` | Thời lượng nghe (giây). |

## API Documentation

API được document bằng **Swagger/OpenAPI**. Bạn có thể xem interactive documentation tại `/swagger` khi chạy ứng dụng locally.

### 🔐 Authentication (`/api/Auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/login` | Đăng nhập và nhận JWT token. |
| `POST` | `/register` | Đăng ký tài khoản mới. |
| `POST` | `/change-password` | Đổi mật khẩu người dùng. |
| `POST` | `/refresh-token` | Làm mới access token. |

### 🎵 Songs (`/api/Song`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách tất cả bài hát (có phân trang). |
| `GET` | `/{id}` | Lấy thông tin chi tiết bài hát. |
| `GET` | `/search` | Tìm kiếm bài hát theo tên, nghệ sĩ. |
| `GET` | `/trending` | Lấy danh sách bài hát trending. |
| `POST` | `/` | Thêm bài hát mới (Admin only). |
| `PUT` | `/{id}` | Cập nhật thông tin bài hát (Admin only). |
| `DELETE` | `/{id}` | Xóa bài hát (Admin only). |
| `POST` | `/{id}/play` | Ghi nhận lượt phát bài hát. |

### 📀 Albums (`/api/Album`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách albums (có phân trang). |
| `GET` | `/{id}` | Lấy thông tin chi tiết album. |
| `GET` | `/{id}/songs` | Lấy danh sách bài hát trong album. |
| `POST` | `/` | Thêm album mới (Admin only). |
| `PUT` | `/{id}` | Cập nhật thông tin album (Admin only). |
| `DELETE` | `/{id}` | Xóa album (Admin only). |

### 🎤 Artists (`/api/Artist`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách nghệ sĩ (có phân trang). |
| `GET` | `/{id}` | Lấy thông tin chi tiết nghệ sĩ. |
| `GET` | `/{id}/songs` | Lấy danh sách bài hát của nghệ sĩ. |
| `GET` | `/{id}/albums` | Lấy danh sách albums của nghệ sĩ. |
| `POST` | `/` | Thêm nghệ sĩ mới (Admin only). |
| `PUT` | `/{id}` | Cập nhật thông tin nghệ sĩ (Admin only). |
| `DELETE` | `/{id}` | Xóa nghệ sĩ (Admin only). |

### 📝 Playlists (`/api/Playlist`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/my-playlists` | Lấy danh sách playlist của user. |
| `GET` | `/{id}` | Lấy thông tin chi tiết playlist. |
| `POST` | `/` | Tạo playlist mới. |
| `PUT` | `/{id}` | Cập nhật thông tin playlist. |
| `DELETE` | `/{id}` | Xóa playlist. |
| `POST` | `/{id}/songs` | Thêm bài hát vào playlist. |
| `DELETE` | `/{id}/songs/{songId}` | Xóa bài hát khỏi playlist. |

### 👤 User (`/api/User`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/profile` | Lấy thông tin profile người dùng. |
| `PUT` | `/profile` | Cập nhật thông tin profile. |
| `GET` | `/favorites` | Lấy danh sách yêu thích. |
| `POST` | `/favorites` | Thêm vào danh sách yêu thích. |
| `DELETE` | `/favorites/{id}` | Xóa khỏi danh sách yêu thích. |
| `GET` | `/history` | Lấy lịch sử nghe nhạc. |

### 🛡️ Admin (`/api/Admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/dashboard` | Lấy thống kê tổng quan hệ thống. |
| `GET` | `/users` | Lấy danh sách tất cả users. |
| `POST` | `/users/{id}/lock` | Khóa tài khoản user. |
| `POST` | `/users/{id}/unlock` | Mở khóa tài khoản user. |
| `DELETE` | `/users/{id}` | Xóa user. |

## Installation & Configuration

### Prerequisites
Trước khi bắt đầu, đảm bảo môi trường phát triển của bạn đã sẵn sàng:

*   **Operating System**: Windows / macOS / Linux
*   **.NET 9 SDK**: [Download here](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) - Kiểm tra với `dotnet --version`
*   **SQL Server 2022+**: Local instance hoặc Docker container.
*   **Node.js 20+**: [Download here](https://nodejs.org/) - Kiểm tra với `node --version`
*   **Docker Desktop** (Optional): Cho việc deploy dễ dàng hơn.

### ⚙️ Backend Setup

#### 1. Clone & Restore
```bash
git clone <your-repository-url>
cd MusicStreamingApp/BE
dotnet restore
```

#### 2. Configuration (`appsettings.json`)
Backend yêu cầu các thông tin cấu hình để hoạt động. Mở `src/MusicApp.API/appsettings.json` và cấu hình các phần sau:

**Database Connection**
Đảm bảo SQL Server đang chạy và có thể truy cập.
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=MusicStreamingDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

**JWT Settings**
Tạo một chuỗi ngẫu nhiên 32+ ký tự cho bảo mật.
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
Áp dụng Entity Framework Core migrations để tạo database schema.
```bash
# Chạy từ thư mục /BE
dotnet ef database update -s src/MusicApp.API -p src/MusicApp.Infrastructure
```
*Nếu lỗi, cài đặt EF Core tool globally:* `dotnet tool install --global dotnet-ef`

#### 4. Running the Application
Khởi động backend API.
```bash
dotnet run --project src/MusicApp.API
```

#### 5. Verification
*   **Swagger UI**: Truy cập `https://localhost:7266/swagger` để explore endpoints.
*   **Hangfire Dashboard**: Truy cập `https://localhost:7266/hangfire` để monitor background jobs.

### 💻 Frontend Setup

#### 1. Navigate to Directory
```bash
cd MusicStreamingApp/FE
```

#### 2. Install Dependencies
Cài đặt tất cả Node.js packages cần thiết.
```bash
npm install
```

#### 3. Configuration (`.env`)
Tạo file `.env` trong thư mục root của `FE` để kết nối với backend API.

```env
# Point to your running .NET API URL
VITE_API_URL=https://localhost:7266/api
```

#### 4. Running the Application
Khởi động development server.
```bash
npm run dev
```

#### 5. Usage
Mở browser và truy cập URL hiển thị trong terminal (thường là `http://localhost:5173`).
*   **Sign Up**: Tạo tài khoản mới.
*   **Login**: Truy cập dashboard.
*   **Explore**: Khám phá nhạc, tạo playlist, và thưởng thức âm nhạc!

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
    *   Tạo entities trong `MusicApp.Domain/Entities/`
    *   Định nghĩa repository interfaces trong `MusicApp.Domain/Interfaces/`
    *   Implement repositories trong `MusicApp.Infrastructure/Repositories/`
    *   Tạo DTOs trong `MusicApp.Application/DTOs/`
    *   Implement services trong `MusicApp.Application/Services/`
    *   Tạo controllers trong `MusicApp.API/Controllers/`
    *   Chạy migrations: `dotnet ef migrations add <MigrationName>`

2.  **Frontend Development**:
    *   Tạo components trong `src/components/`
    *   Tạo pages trong `src/pages/`
    *   Implement API services trong `src/services/`
    *   Quản lý state với Context API trong `src/context/`
    *   Style với Tailwind CSS

### 🐛 Common Issues & Fixes

*   **CORS Errors**: Đảm bảo `appsettings.json` cho phép frontend URL (default `http://localhost:5173`).
*   **Database Connection Failed**: Kiểm tra SQL Server đang chạy và connection string đúng.
*   **JWT Token Invalid**: Kiểm tra `JwtSettings.Secret` giống nhau giữa các lần chạy.
*   **File Upload Failed**: Kiểm tra storage configuration (Supabase/S3) và bucket permissions.

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