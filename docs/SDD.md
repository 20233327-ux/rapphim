# SDD - Tài Liệu Thiết Kế Phần Mềm

Project: CinemaHub - Cinema Management System  
Version: 1.0  
Date: 2026-05-18

## 1. Thiết kế kiến trúc

### 1.1 Kiến trúc mức cao
- Client Layer: React SPA.
- Service Layer: Express REST API.
- Persistence Layer: PostgreSQL.

### 1.2 Topology triển khai
- Frontend: Vite static host/app server.
- Backend: Node process mở cổng 4000.
- DB: PostgreSQL service tại cổng 5432.

### 1.3 Quyết định thiết kế chính
- Đơn giản hóa backend trong 1 entry file (server/index.js) để tăng tốc MVP.
- Snapshot-based persistence để đồng bộ nhanh với state frontend hiện có.
- JWT + refresh token cho mô hình xác thực stateless.
- SQL migration file-based + bảng đánh dấu schema_migrations.

## 2. Thiết kế frontend

### 2.1 Composition Root
- src/App.tsx là root component quản lý:
  - auth gate
  - app-level state
  - module rendering
  - debounce save flow

### 2.2 Ranh giới module
- AuthModule: form đăng nhập + xử lý lỗi.
- DashboardModule/ReportsModule: analytics UI dạng đọc.
- Các module CRUD (Movies/Rooms/Showtimes/Customers/Staff/Booking): thao tác state.

### 2.3 Tầng truy cập dữ liệu
- src/dataService.ts:
  - quản lý token (access + refresh)
  - login, refresh, me
  - authorizedFetch với auto-refresh và retry 1 lần
  - load/save AppData

### 2.4 Chiến lược state và đồng bộ
- State nằm tại App-level useState.
- Sau thao tác module, App debounce 400ms rồi gọi saveData.
- saveData gọi PUT /api/data và fallback localStorage khi lỗi.

## 3. Thiết kế backend

### 3.1 Thành phần chính trong server/index.js
- Configuration và bootstrapping.
- JWT helpers:
  - createAuthToken
  - createRefreshToken
  - authenticateToken middleware
- Migration runner:
  - listSqlFiles
  - ensureMigrationTable
  - runSqlScriptsOnce
  - runMigrationsOnStartup
- Data mapper:
  - fetchAppData (DB -> AppData)
  - replaceAllData (AppData -> DB)
- Route handlers.

### 3.2 Thiết kế xác thực
- Login:
  - Query user theo email/username.
  - Verify bcrypt hash.
  - Cấp access + refresh token.
- Refresh:
  - Verify refresh token + type claim.
  - Nạp user và rotate cả 2 token.
- Me:
  - Verify access token.
  - Trả user profile.

### 3.3 Thiết kế Resource API
- Dynamic route /api/resources/:resource với whitelist RESOURCE_CONFIG.
- POST/PUT/DELETE yêu cầu authenticateToken.
- Read operation (GET) hiện đang public.

### 3.4 Mẫu xử lý lỗi
- try/catch tại từng route.
- Trả JSON { message, error } khi lỗi.
- Chưa có centralized error middleware.

## 4. Thiết kế cơ sở dữ liệu

### 4.1 Schema
- Main tables:
  - movies, movie_genres, movie_actors
  - rooms, showtimes
  - users
  - bookings, booking_seats
  - shifts, promotions
  - schema_migrations

### 4.2 Toàn vẹn tham chiếu
- showtimes.movie_id -> movies.id
- showtimes.room_id -> rooms.id
- bookings.user_id -> users.id
- bookings.showtime_id -> showtimes.id
- bookings.movie_id -> movies.id
- shifts.staff_id -> users.id
- booking_seats.booking_id -> bookings.id

### 4.3 Chiến lược index
- Query-hot fields đã index:
  - showtimes(movie_id, room_id, start_time)
  - bookings(user_id, showtime_id, created_at)
  - shifts(staff_id, shift_date)

### 4.4 Chiến lược migration
- SQL migration idempotent.
- Theo dõi thực thi bằng schema_migrations.
- Seed tùy chọn qua env toggle.

## 5. Thiết kế bảo mật

### 5.1 Đã triển khai
- bcrypt cho password hash.
- Access/refresh JWT với secret riêng.
- Refresh rotation tại endpoint refresh.
- Auth middleware cho endpoint ghi resource.

### 5.2 Rủi ro đã biết
- refresh token lưu localStorage (rủi ro XSS).
- PUT /api/data chưa bắt buộc auth.
- Chưa có role-action authorization layer (RBAC chưa đầy đủ).

### 5.3 Đề xuất hardening
- Chuyển refresh token sang HttpOnly Secure cookie.
- Enforce auth (và role checks) cho snapshot write endpoint.
- Thêm request schema validation và rate limiting.

## 6. Thiết kế vận hành

### 6.1 Trình tự khởi động
1. Initialize DB pool.
2. Run migrations nếu bật.
3. Start Express listener.

### 6.2 Ma trận cấu hình
- Required trong production:
  - DATABASE_URL
  - JWT_SECRET
  - JWT_REFRESH_SECRET
- Optional toggles:
  - DB_AUTO_MIGRATE
  - DB_RUN_SEED
  - DB_SSL

### 6.3 Trạng thái quan sát hệ thống
- Hiện tại: console logging cơ bản.
- Còn thiếu: structured logs, metrics, tracing, error aggregation.

## 7. Thiết kế chất lượng và kiểm thử

### 7.1 Hiện tại
- TypeScript check qua tsc --noEmit.

### 7.2 Test pyramid đề xuất
- Unit:
  - token utilities
  - dataService auth-refresh flow
- Integration:
  - API route + test DB
- E2E:
  - login -> session restore -> CRUD flow

## 8. Kế hoạch tiến hóa

### Phase A - Security
- Cookie-based refresh token.
- RBAC middleware.
- Request validation.

### Phase B - Data Layer
- Thay snapshot rewrite bằng SQL CRUD theo từng thực thể.
- Bổ sung pagination/filter/sort endpoints.

### Phase C - Platform
- OpenTelemetry + metrics.
- CI/CD quality gates.
- OpenAPI-driven code generation (optional).
