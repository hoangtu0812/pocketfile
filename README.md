# PocketFile

Ứng dụng web quản lý file với các tính năng upload, quản lý version và tạo QR code cho đường dẫn download.

## Tính năng

- ✅ Đăng nhập/Đăng ký với phân quyền Admin và User
- ✅ Đăng ký lần đầu tự động tạo tài khoản Admin
- ✅ Trang quản trị Admin: thêm/sửa/xóa user
- ✅ Upload file lên server (tối đa 100MB)
- ✅ Quản lý file với thông tin: dự án, version, thời gian upload
- ✅ Tạo QR code chứa đường dẫn download
- ✅ Copy đường dẫn download vào clipboard
- ✅ Triển khai qua Docker

## Cấu trúc dự án

```
PocketFile/
├── backend/          # Backend API (Node.js/Express)
├── frontend/         # Frontend (React)
└── docker-compose.yml
```

## Yêu cầu

- Docker và Docker Compose
- Node.js 18+ (nếu chạy local)

## Cài đặt và chạy với Docker (môi trường DEV)

1. Clone repository hoặc giải nén project

2. Chạy ứng dụng:
```bash
docker compose up -d
```

3. Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

4. Đăng ký tài khoản đầu tiên (sẽ tự động là Admin)

## Chạy local (development)

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend sẽ chạy tại http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại http://localhost:5173

## Triển khai Production (PRD)

### 1. Chuẩn bị server

- **Hệ điều hành**: Ubuntu 22.04 LTS (khuyến nghị) hoặc tương đương
- Cài đặt:
  - Docker
  - Docker Compose v2 (`docker compose` CLI)
- Tạo domain, ví dụ: `pocketfile.yourdomain.com`

### 2. Cấu hình biến môi trường PRD

- Mở file `docker-compose.yml` và kiểm tra/điều chỉnh:
  - **Database**
    - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - **Backend**
    - `DB_HOST`: nên giữ `postgres` (tên service)
    - `DB_NAME`, `DB_USER`, `DB_PASSWORD`: trùng với PostgreSQL
    - `JWT_SECRET`: **bắt buộc đổi** sang chuỗi ngẫu nhiên dài, ví dụ 64 ký tự
    - `NODE_ENV`: `production`
  - **Ports**
    - Nếu deploy sau reverse proxy (Nginx/Traefik), có thể map port nội bộ (vd: `3001:3001`, `3000:80`) và để reverse proxy listen cổng 80/443.

Ví dụ thiết lập JWT secret mạnh (chạy trên máy dev):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Sau đó dán vào `JWT_SECRET`.

### 3. Build và chạy stack

```bash
docker compose pull        # nếu đã push image lên registry riêng
docker compose build       # hoặc build trực tiếp trên server
docker compose up -d
```

Kiểm tra dịch vụ:

```bash
docker compose ps
docker compose logs backend -f
docker compose logs postgres -f
```

### 4. Reverse proxy + HTTPS (gợi ý nhanh)

Nếu đã có Nginx ở ngoài:

- Proxy domain `pocketfile.yourdomain.com` tới `frontend` (container) port `80`
- Sử dụng Certbot/Let’s Encrypt để lấy SSL cho domain

Ví dụ server block đơn giản (trên host, không phải trong container):

```nginx
server {
    listen 80;
    server_name pocketfile.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Sau khi cấu hình HTTPS, bạn chỉ cần trỏ mobile app tới URL download dạng:

`https://pocketfile.yourdomain.com/uploads/<tên_file>.apk`

hoặc dùng link copy từ Dashboard.

## Cấu hình

Các biến môi trường có thể được cấu hình trong `docker-compose.yml` hoặc tạo file `.env`:

- `DB_HOST`: Host của PostgreSQL
- `DB_PORT`: Port của PostgreSQL
- `DB_NAME`: Tên database
- `DB_USER`: Username database
- `DB_PASSWORD`: Password database
- `JWT_SECRET`: Secret key cho JWT (nên thay đổi trong production)
- `PORT`: Port của backend API

## Sử dụng

1. **Đăng ký/Đăng nhập**: Truy cập trang login để đăng ký (lần đầu sẽ là Admin) hoặc đăng nhập
2. **Upload File**: Vào trang Upload File để upload file mới với thông tin version và dự án
3. **Xem danh sách**: Dashboard hiển thị tất cả files đã upload
4. **Download**: Click "Tải về" để download file
5. **Copy Link**: Click "Copy Link" để copy đường dẫn vào clipboard
6. **QR Code**: Click "QR Code" để tạo và xem QR code chứa đường dẫn download
7. **Quản trị** (Admin): Vào trang Quản trị để quản lý users

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify` - Verify token

### Users (Admin only)
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Files
- `GET /api/files` - Lấy danh sách files
- `GET /api/files/:id` - Lấy thông tin file
- `POST /api/files/upload` - Upload file
- `DELETE /api/files/:id` - Xóa file
- `GET /api/files/:id/qrcode` - Tạo QR code
- `GET /api/files/projects` - Lấy danh sách projects
- `POST /api/files/projects` - Tạo project mới

## Lưu ý

- File được lưu trong thư mục `backend/uploads/`
- Trong production, nên thay đổi `JWT_SECRET` và các thông tin database
- File upload giới hạn 100MB
- Đường dẫn download có thể được sử dụng trực tiếp từ mobile app để download APK

