# SRS - Đặc Tả Yêu Cầu Phần Mềm

Project: CinemaHub - Cinema Management System  
Version: 1.0  
Date: 2026-05-18

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này đặc tả yêu cầu chức năng và phi chức năng cho hệ thống CinemaHub, làm cơ sở cho phát triển, kiểm thử và triển khai.

### 1.2 Phạm vi
CinemaHub hỗ trợ:
- Quản lý phim, phòng chiếu, lịch chiếu.
- Quản lý đặt vé, khách hàng, nhân sự, ca làm.
- Báo cáo tổng hợp doanh thu/cơ cấu dữ liệu.
- Xác thực người dùng bằng JWT và refresh token.

### 1.3 Định nghĩa
- Access Token: JWT ngắn hạn dùng cho xác thực API.
- Refresh Token: JWT dài hạn dùng để cấp mới access token.
- Snapshot API: endpoint đọc/ghi toàn bộ AppData.

## 2. Mô tả tổng quan

### 2.1 Bối cảnh sản phẩm
Hệ thống gồm 3 thành phần:
- Frontend SPA (React + TypeScript).
- Backend REST API (Express).
- Cơ sở dữ liệu PostgreSQL.

### 2.2 Nhóm người dùng
- Admin: quyền cao nhất, quản lý toàn bộ.
- Manager: quản lý vận hành nghiệp vụ.
- Staff: thao tác tác nghiệp hằng ngày.
- Customer: người dùng đặt vé.

### 2.3 Môi trường vận hành
- Frontend: trình duyệt hiện đại.
- Backend: Node.js 18+.
- Database: PostgreSQL 16+.
- Local setup: Docker Compose cho DB.

### 2.4 Ràng buộc
- Đang sử dụng mô hình snapshot rewrite cho ghi dữ liệu.
- Refresh token đang lưu localStorage.
- Chưa có RBAC chi tiết trên từng endpoint.

## 3. Yêu cầu chức năng

### FR-01 Xác thực
- Hệ thống phải cho phép đăng nhập qua identifier (email/username) và password.
- Hệ thống phải trả về access token và refresh token khi đăng nhập thành công.
- Hệ thống phải cấp mới token qua endpoint refresh.
- Hệ thống phải trả về thông tin user hiện tại qua endpoint /api/auth/me.

### FR-02 Quản lý phiên
- Frontend phải lưu token để giữ phiên.
- Frontend phải tự động khôi phục session sau reload.
- Nếu access token hết hạn, frontend phải thử refresh và retry request tối đa 1 lần.

### FR-03 Nạp dữ liệu
- Hệ thống phải cung cấp endpoint GET /api/data trả về AppData đầy đủ.
- Frontend phải nạp dữ liệu từ API; nếu lỗi thì fallback localStorage.

### FR-04 Ghi dữ liệu
- Hệ thống phải cho phép frontend ghi AppData qua PUT /api/data.
- Backend phải ghi dữ liệu trong transaction để đảm bảo nhất quán.

### FR-05 CRUD tài nguyên
- Hệ thống phải cung cấp CRUD cho các resource:
  - movies
  - rooms
  - showtimes
  - users
  - bookings
  - shifts
- Các endpoint ghi (POST/PUT/DELETE resources) phải yêu cầu token hợp lệ.

### FR-06 Migration cơ sở dữ liệu
- Backend phải tự động tạo bảng schema_migrations nếu chưa có.
- Backend phải chạy migration chưa được đánh dấu khi startup.
- Backend có thể chạy seed nếu DB_RUN_SEED=true.

### FR-07 Hỗ trợ báo cáo
- Hệ thống phải cung cấp dữ liệu đầu vào cho dashboard và reports module.

## 4. Yêu cầu phi chức năng

### NFR-01 Hiệu năng
- API /api/data phản hồi <= 2s với dữ liệu nhỏ đến trung bình (mục tiêu local/staging).

### NFR-02 Độ tin cậy
- Ghi dữ liệu phải transaction-safe.
- Migration phải idempotent và không chạy lặp.

### NFR-03 Bảo mật
- Password phải lưu dạng hash bcrypt.
- Access token phải có TTL ngắn (mặc định 15m).
- Refresh token phải có TTL dài hơn (mặc định 7d).
- Các endpoint ghi resource phải xác thực Bearer token.

### NFR-04 Khả năng bảo trì
- Mã nguồn phải TypeScript check thành công.
- Tài liệu kỹ thuật phải cập nhật theo thay đổi API/schema.

### NFR-05 Khả năng triển khai
- Hệ thống phải chạy được với cấu hình env rõ ràng.
- Hỗ trợ deploy tách frontend/backend với managed PostgreSQL.

## 5. Yêu cầu giao tiếp ngoài

### 5.1 API Interface
- REST JSON theo OpenAPI 3.0.3 (xem openapi.yaml).

### 5.2 Database Interface
- PostgreSQL qua node-postgres (pg Pool).

### 5.3 User Interface
- Giao diện SPA với kiến trúc module và sidebar.

## 6. Yêu cầu dữ liệu

### 6.1 Thực thể lõi
- Movie, Room, Showtime, User, Booking, Shift, Promotion.

### 6.2 Quy tắc toàn vẹn
- Giá trị số không âm cho các cột giá/revenue/points.
- Ràng buộc thời gian hợp lệ cho phim và suất chiếu.
- Ràng buộc khóa ngoại giữa booking-user-showtime-movie.

## 7. Tiêu chí chấp nhận

- Đăng nhập thành công nhận được token và refreshToken.
- Reload trang vẫn đăng nhập nếu token hợp lệ.
- Hết hạn access token vẫn tiếp tục request sau refresh token.
- CRUD resource ghi thành công khi có token hợp lệ.
- Migration startup tạo schema đầy đủ trên DB ở trạng thái mới.

## 8. Ngoài phạm vi (phiên bản hiện tại)

- Payment gateway tích hợp thật (VNPay/MoMo live).
- Notification realtime.
- RBAC chi tiết theo action/domain.
- Audit trail đầy đủ và tích hợp SIEM.
