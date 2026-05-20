# Hướng dẫn triển khai lên Render

Tài liệu này hướng dẫn cách deploy CinemaHub lên Render từng bước.

## Yêu cầu trước

- Repo GitHub: https://github.com/20233327-ux/rapphim
- Tài khoản Render: https://render.com (đăng ký miễn phí)
- Card tín dụng (Render yêu cầu để kích hoạt một số dịch vụ)

## Bước 1: Chuẩn bị repo GitHub

1. Đảm bảo repo của bạn đã push tất cả thay đổi lên `main`:
   ```bash
   git status
   git push origin main
   ```

2. Để Render có thể trigger CI/CD tự động từ GitHub Actions, bạn cần cấp quyền. Có thể bỏ qua bước này nếu chỉ muốn deploy một lần.

## Bước 2: Tạo PostgreSQL trên Render

1. Đăng nhập https://render.com
2. Trên dashboard, chọn **New +** → **PostgreSQL**
3. Điền thông tin:
   - **Name**: `cinemahub-db` (hoặc tên khác)
   - **Database**: `cinemahub`
   - **User**: `cinemahub`
   - Giữ các tùy chọn mặc định khác
4. Bấm **Create Database**
5. Chờ khoảng 1-2 phút để database khởi động
6. Vào trang chi tiết database, tab **Info**
7. Sao chép **Internal Database URL** (dạng `postgres://cinemahub:PASSWORD@localhost:5432/cinemahub`)
   - Lưu ý: sử dụng **Internal URL** chứ không phải **External Database URL**

## Bước 3: Tạo Web Service từ Blueprint

1. Trên dashboard Render, chọn **New +** → **Blueprint**
2. Kết nối GitHub (nếu chưa kết nối):
   - Chọn **Connect your GitHub account**
   - Cho phép Render truy cập repo
3. Sau khi kết nối, chọn repo `20233327-ux/rapphim`
4. Render sẽ đọc file `render.yaml` trong repo
5. Bấm **Create New Resources**
6. Chờ Render phân tích blueprint

## Bước 4: Cấu hình Environment Variables

Sau khi chọn blueprint, bạn sẽ thấy phần **Environment** để thêm biến.

Thêm các biến bắt buộc:
- **DATABASE_URL**: dán Internal Database URL từ bước 2
- **JWT_SECRET**: sinh chuỗi ngẫu nhiên dài (ví dụ: `openssl rand -hex 32`)
- **JWT_REFRESH_SECRET**: sinh chuỗi ngẫu nhiên dài khác

Thêm các biến khuyến nghị:
- **NODE_ENV**: `production`
- **DB_AUTO_MIGRATE**: `true`
- **DB_RUN_SEED**: `false`
- **AUTH_ALLOW_PLAINTEXT_DEV**: `false`

### Cách sinh JWT secrets

Chạy lệnh dưới đây trên máy tính của bạn để sinh 2 chuỗi ngẫu nhiên:

**Linux/macOS:**
```bash
openssl rand -hex 32
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
-join (1..32 | % {'{0:x}' -f (Get-Random -Max 16)})
-join (1..32 | % {'{0:x}' -f (Get-Random -Max 16)})
```

Hoặc sử dụng một dịch vụ như: https://www.random.org/strings/

## Bước 5: Deploy

1. Sau khi đã điền xong tất cả biến môi trường, bấm **Deploy** hoặc **Create Service**
2. Render sẽ bắt đầu build:
   - Pull code từ GitHub
   - Build Docker image
   - Chạy migration DB tự động
   - Khởi động web service
3. Chờ cho đến khi bạn thấy:
   - Service status: **Live**
   - URL dạng: `https://cinemahub-xxx.onrender.com`

## Bước 6: Kiểm tra Health Checks

Sau khi service live, kiểm tra 3 endpoint health:

1. **Liveness Check** (dành cho load balancer):
   ```
   https://cinemahub-xxx.onrender.com/api/health/live
   ```
   Kỳ vọng: `{"ok":true,"status":"live","timestamp":"..."}`

2. **Readiness Check** (với DB latency):
   ```
   https://cinemahub-xxx.onrender.com/api/health
   ```
   Kỳ vọng: `{"ok":true,"status":"ok","service":"...","checks":{"database":{"ok":true,"latencyMs":...}}}`

3. **Version Endpoint**:
   ```
   https://cinemahub-xxx.onrender.com/api/version
   ```
   Kỳ vọng: `{"service":"...","version":"0.0.0","environment":"production"}`

## Bước 7: Kiểm tra Web UI

Mở URL chính của service trong trình duyệt:
```
https://cinemahub-xxx.onrender.com
```

Bạn sẽ thấy giao diện CinemaHub. Thử đăng nhập với tài khoản mặc định:
- Email: `admin@cinema.com`
- Password: `Admin@123`

## Bước 8: Setup Auto-Deploy từ GitHub Actions (tùy chọn)

Để mỗi lần push lên `main` là tự động deploy lên Render:

1. Trên Render dashboard, vào service đó
2. Tab **Settings** → **Deploy Hooks**
3. Bấm **Create Deploy Hook**
4. Chọn **Redeploy latest commit**
5. Copy URL của hook (dạng: `https://api.render.com/deploy/srv-xxxxx?key=xxx`)

6. Trên GitHub, đi tới repo `20233327-ux/rapphim`
7. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
8. Thêm secret:
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: dán URL từ bước 5

9. Workflow `.github/workflows/deploy.yml` sẽ tự động gọi hook này sau khi CI thành công

## Troubleshooting

### Deploy lỗi "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Nguyên nhân**: `DATABASE_URL` chưa được set hoặc DB chưa tạo

**Cách khắc phục** (quan trọng - theo thứ tự):
1. **Bước 1: Tạo PostgreSQL trước** - Vào Render, tạo Database service, chờ 1-2 phút để khởi động
2. **Bước 2: Copy Internal Database URL** - Từ database info, sao chép URL (không phải External URL)
3. **Bước 3: Điền DATABASE_URL vào env** - Trước khi tạo Web Service, thêm biến `DATABASE_URL` với giá trị từ bước 2
4. **Bước 4: Deploy Web Service** - Sau đó tạo/deploy Web Service

**Nếu đã deploy mà quên DATABASE_URL**:
- Vào service → **Environment**
- Thêm/sửa `DATABASE_URL` thành Internal URL
- Bấm **Save**
- Render sẽ tự động redeploy

### Deploy lỗi "Database connection failed" (sau khi set DATABASE_URL)

**Nguyên nhân**: URL sai format hoặc DB chưa ready

**Cách khắc phục**:
- Kiểm tra `DATABASE_URL` bắt đầu bằng `postgres://` hoặc `postgresql://`
- Không dùng **External Database URL** (nó chỉ cho kết nối từ bên ngoài)
- Dùng **Internal Database URL** (cho kết nối từ services bên trong Render)
- Trong database info, xác nhận status là **Available** (không phải Building)
- Nếu DB vừa mới tạo, chờ thêm 30 giây rồi thử lại

### Deploy lỗi "Health check failed"

**Nguyên nhân**: Service bị restart vì health check fail

**Cách khắc phục**:
- Vào **Logs** xem error chi tiết
- Đảm bảo `DATABASE_URL` chính xác (xem hướng dẫn trên)
- Tạm thời set `DB_AUTO_MIGRATE=false` trong env để bỏ qua auto-migration, deploy lại
- Sau khi service live, sửa `DB_AUTO_MIGRATE=true` rồi thử lại

### Build lỗi npm

**Nguyên nhân**: package không tương thích

**Cách khắc phục**:
- Trong Render dashboard, vào **Logs** để xem chi tiết
- Thử xóa `package-lock.json` từ repo rồi push lại
- Hoặc chạy `npm ci` trên máy cá nhân để kiểm tra

### Service restart liên tục

**Nguyên nhân**: Lỗi trong server hoặc health check fail

**Cách khắc phục**:
- Vào **Logs** xem error message
- Đảm bảo `DATABASE_URL` chính xác
- Đặt `DB_AUTO_MIGRATE=false` để vô hiệu hóa migration tự động trong lần deploy đầu

## Rollback (Quay lại phiên bản cũ)

Nếu deployment mới gây lỗi:

1. Trong Render, vào service
2. Tab **Deployments**
3. Tìm deployment thành công lần trước
4. Bấm **Redeploy**
5. Service sẽ quay lại code cũ trong vài phút

## Giới hạn Render Free Plan

- **Web Service**: 750 giờ/tháng (≈ 24/7 liên tục)
- **PostgreSQL**: đã hết free tier (chỉ có paid)
- **Bandwidth**: giới hạn, có thể gây chậm nếu quá tải

Nếu cần production seri, nâng cấp lên tier trả phí.

## Tài liệu thêm

- Render docs: https://render.com/docs
- GitHub Actions deployment: Xem `.github/workflows/deploy.yml`
- API health endpoint: Xem `server/index.js`
