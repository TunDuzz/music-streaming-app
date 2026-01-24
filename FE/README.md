# Music Streaming App - Frontend

Ứng dụng phát nhạc trực tuyến với giao diện đạt chuẩn doanh nghiệp, được xây dựng bằng React + Vite.

## Tính năng

- 🎵 Phát nhạc với player đầy đủ tính năng
- 🔍 Tìm kiếm bài hát và nghệ sĩ
- 📚 Thư viện bài hát với sắp xếp linh hoạt
- 🎨 Giao diện dark theme chuyên nghiệp
- 📱 Responsive design cho mọi thiết bị
- ⚡ Tích hợp đầy đủ với Backend API

## Công nghệ sử dụng

- **React 19** - UI Framework
- **React Router** - Routing
- **Vite** - Build tool
- **Lucide React** - Icons
- **CSS Variables** - Design System

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Cấu hình

Tạo file `.env` trong thư mục `FE` với nội dung:

```
VITE_API_URL=http://localhost:5125/api
```

Hoặc sử dụng giá trị mặc định (http://localhost:5125/api)

## Cấu trúc thư mục

```
src/
├── components/      # Các component tái sử dụng
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Player.jsx
│   ├── SongCard.jsx
│   ├── ArtistCard.jsx
│   └── SongListItem.jsx
├── pages/           # Các trang chính
│   ├── Home.jsx
│   ├── Search.jsx
│   └── Library.jsx
├── services/        # API services
│   └── api.js
├── hooks/           # Custom hooks
│   └── useAudioPlayer.js
├── contexts/        # React Contexts
│   └── PlayerContext.jsx
└── utils/           # Utilities
```

## API Endpoints

Ứng dụng sử dụng các API endpoints từ Backend:

- `GET /api/Songs` - Lấy danh sách bài hát
- `GET /api/Songs/{id}` - Lấy chi tiết bài hát
- `GET /api/Songs/artist/{artistId}` - Lấy bài hát theo nghệ sĩ
- `GET /api/Artists` - Lấy danh sách nghệ sĩ
- `GET /api/Artists/{id}` - Lấy chi tiết nghệ sĩ
- `GET /api/Users` - Lấy danh sách người dùng

## Yêu cầu Backend

Đảm bảo Backend đang chạy trên port 5125 (hoặc cập nhật `VITE_API_URL` trong file `.env`).

Backend cần được cấu hình CORS để cho phép frontend gọi API.

## Tính năng chính

### Trang chủ
- Hiển thị bài hát nổi bật
- Nghệ sĩ phổ biến
- Bài hát mới phát hành

### Tìm kiếm
- Tìm kiếm theo tên bài hát, nghệ sĩ, album
- Lọc kết quả theo bài hát hoặc nghệ sĩ
- Hiển thị kết quả real-time

### Thư viện
- Danh sách tất cả bài hát
- Sắp xếp theo tiêu đề, nghệ sĩ, thời lượng, lượt phát, lượt thích
- Phát nhạc trực tiếp từ danh sách

### Player
- Điều khiển phát/tạm dừng
- Thanh tiến trình có thể tương tác
- Điều chỉnh âm lượng
- Hiển thị thông tin bài hát đang phát

## Design System

Ứng dụng sử dụng CSS Variables để quản lý theme:

- **Colors**: Dark theme với accent color xanh lá (#1db954)
- **Spacing**: Hệ thống spacing nhất quán
- **Typography**: Font system hiện đại
- **Components**: Các component có thể tái sử dụng

## Phát triển

```bash
# Chạy với hot reload
npm run dev

# Kiểm tra lỗi linting
npm run lint

# Preview build production
npm run preview
```

## License

MIT
