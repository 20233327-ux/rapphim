# BAO CAO KY THUAT CHI TIET HE THONG CINEMAHUB

Ngay cap nhat: 2026-05-18
Phien ban tai lieu: 2.0
Pham vi: Kien truc tong the, thiet ke chi tiet, data model, API contract, bao mat, van hanh va roadmap nang cap.

## 1. Tong quan ky thuat

CinemaHub la he thong quan ly rap phim gom 3 lop chinh:
- Frontend SPA bang React + TypeScript chay tren Vite.
- Backend REST API bang Express (Node.js).
- Co so du lieu PostgreSQL voi migration SQL theo mo hinh idempotent.

Muc tieu ky thuat hien tai:
- Van hanh day du cac phan he nghiep vu rap phim.
- Dong bo du lieu qua backend thay vi localStorage-only.
- Co xac thuc JWT, refresh token, va session restore sau reload.
- Dat nen tang de deploy cloud theo huong production.

## 2. Kien truc he thong

## 2.1 Kien truc logic

Layer 1 - Presentation:
- React component tree bat dau tu src/App.tsx.
- Dieu huong view theo state noi bo (khong dung react-router).
- Cac module UI theo domain nghiep vu.

Layer 2 - Application service:
- src/dataService.ts dong vai tro Data Access Gateway cho frontend.
- Quan ly token access/refresh trong localStorage.
- Bao gom co che authorizedFetch va retry sau khi refresh token.

Layer 3 - API service:
- server/index.js cung cap endpoint auth, data snapshot, resource CRUD, health.
- Chiu trach nhiem mapping du lieu DB <-> object frontend.
- Thuc thi migration startup thong qua bang schema_migrations.

Layer 4 - Persistence:
- PostgreSQL schema duoc tao boi db/migrations/001_init.sql.
- Seed du lieu boi db/seed/001_seed.sql va mat khau mau bo sung boi db/migrations/002_seed_user_passwords.sql.

## 2.2 Runtime topology

Moi truong local mac dinh:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432

Vite proxy:
- /api tren frontend duoc proxy den backend API de tranh van de CORS trong dev.

## 2.3 Luong du lieu chinh

Luong khoi dong:
1. Frontend goi GET /api/data de nap snapshot du lieu.
2. Frontend goi GET /api/auth/me neu co access token.
3. Neu token het han, frontend goi POST /api/auth/refresh va retry 1 lan.

Luong ghi du lieu:
1. User thao tac tren module UI.
2. State tong hop duoc debounce 400ms.
3. Frontend goi PUT /api/data kem token neu co.
4. Backend replace toan bo snapshot trong transaction DB.

## 3. Frontend design chi tiet

## 3.1 Cau truc module

Tep trung tam:
- src/App.tsx: app shell, auth gate, sidebar, header, render module theo activeView.
- src/dataService.ts: ham login, refresh, getCurrentUser, loadData, saveData.

Cac module domain:
- AuthModule: dang nhap bang identifier/password qua API.
- DashboardModule: tong hop KPI tu movie/showtime/booking.
- MoviesModule: quan ly danh muc phim.
- RoomsModule: quan ly phong chieu.
- ShowtimesModule: quan ly lich chieu.
- BookingModule: dat ve, ghe, tong tien.
- CustomersModule: danh sach khach hang.
- StaffModule: nhan su va ca lam.
- ReportsModule: bao cao doanh thu va so lieu tong hop.
- ConfigModule: khu vuc cau hinh he thong.

## 3.2 State management

App-level state hien tai:
- movies, rooms, showtimes, users, bookings, shifts.
- currentUser, isDataLoaded, isAuthChecked, activeView.

Kieu quan ly:
- React useState + useEffect.
- Khong su dung Redux/Zustand.
- Dong bo state -> backend theo co che snapshot.

## 3.3 DataService contract

Nhom ham xac thuc:
- login(identifier, password)
- getCurrentUser()
- refreshAccessToken()
- getAuthToken(), setAuthToken(), getRefreshToken(), setRefreshToken(), clearAuthToken()

Nhom ham du lieu:
- loadData()
- saveData(data)
- saveDataToLocal(data)
- resetData()

Dac diem quan trong:
- authorizedFetch retry toi da 1 lan sau refresh khi gap 401.
- Neu refresh that bai se xoa token va ket thuc session.

## 4. Backend design chi tiet

## 4.1 Cau truc mot file hien tai

Tat ca logic API nam trong server/index.js, gom:
- Config env va tao pg Pool.
- Token utilities (createAuthToken, createRefreshToken, authenticateToken).
- Migration runner (listSqlFiles, ensureMigrationTable, runSqlScriptsOnce, runMigrationsOnStartup).
- Mapping helper (toDateOnly, toIso).
- Data repository dang ham thu tuc (fetchAppData, replaceAllData).
- REST route handlers.

## 4.2 Authentication flow

Dang nhap:
- Tim user theo email hoac username.
- Xac minh password_hash bang bcrypt.
- Tra ve access token + refresh token + user profile.

Refresh:
- Verify refresh token bang JWT_REFRESH_SECRET.
- Kiem tra claim type = refresh.
- Lay user tu DB va cap moi cap token.

Current user:
- Verify access token.
- Lay user theo req.user.sub.

## 4.3 Data access strategy

Strategy hien tai la snapshot-based:
- fetchAppData doc toan bo bang lien quan va map thanh object frontend.
- replaceAllData xoa va insert lai toan bo du lieu trong 1 transaction.

Uu diem:
- Don gian, de dong bo voi frontend dang state-full.

Nhuoc diem:
- Khong toi uu voi dataset lon.
- Kho canh tranh ghi dong thoi.
- Khong co optimistic locking.

## 4.4 Resource CRUD strategy

Endpoint /api/resources/* hien tai van su dung fetch snapshot -> sua mang -> replace snapshot toan bo.
Do do, day la CRUD giao dien theo API, nhung ve persistence van la snapshot rewrite.

## 4.5 Error handling

Hien tai:
- Tra loi JSON message + error.message.
- Chua co ma loi nghiep vu chuan hoa.
- Chua co middleware xu ly loi tap trung.

## 5. Co so du lieu va schema

## 5.1 Bang va quan he

movies 1-n showtimes
movies 1-n movie_genres
movies 1-n movie_actors
rooms 1-n showtimes
users 1-n bookings
users 1-n shifts
showtimes 1-n bookings
bookings 1-n booking_seats

## 5.2 Rang buoc du lieu

- duration_minutes > 0
- end_date >= release_date
- end_time > start_time
- total_price >= 0
- revenue >= 0
- discount_percent trong [0, 100]
- points >= 0

## 5.3 Index hien co

- idx_showtimes_movie_id
- idx_showtimes_room_id
- idx_showtimes_start_time
- idx_bookings_user_id
- idx_bookings_showtime_id
- idx_bookings_created_at
- idx_shifts_staff_id
- idx_shifts_shift_date

## 5.4 Migration lifecycle

Bang schema_migrations luu key dang category:file_name.
Mo hinh nay dam bao:
- Khong chay lap migration da thuc thi.
- Co the bo sung migration moi theo thu tu ten file.

## 6. API contract chi tiet

## 6.1 Auth APIs

POST /api/auth/login
- Request:
  - identifier: string
  - password: string
- Response 200:
  - token: string
  - refreshToken: string
  - user: { id, name, email, role }
- Response loi:
  - 400 neu thieu input
  - 401 neu sai thong tin

POST /api/auth/refresh
- Request:
  - refreshToken: string
- Response 200:
  - token: string
  - refreshToken: string
  - user: { id, name, email, role }
- Response loi:
  - 400 neu thieu refreshToken
  - 401 neu token khong hop le/het han

GET /api/auth/me
- Header: Authorization: Bearer <token>
- Response 200: { user: { id, name, email, role } }
- Response loi:
  - 401 neu token khong hop le
  - 404 neu user khong ton tai

## 6.2 Data snapshot APIs

GET /api/data
- Response 200: AppData object

PUT /api/data
- Request body: AppData
- Response 200: { ok: true }

Ghi chu quan trong:
- Endpoint nay hien tai chua bat buoc auth o backend.

## 6.3 Resource APIs

GET /api/resources/:resource
- Read data theo resource key.

POST /api/resources/:resource
PUT /api/resources/:resource/:id
DELETE /api/resources/:resource/:id
- Yeu cau auth.
- Valid resource: movies, rooms, showtimes, users, bookings, shifts.

## 7. Bao mat he thong

## 7.1 Co che dang ap dung

- Password hash bcrypt.
- Access token ngan han.
- Refresh token dai han va rotate khi refresh.
- Frontend retry 1 lan sau refresh.

## 7.2 Diem can cung co

- Refresh token dang luu localStorage de nguy co XSS.
- Chua co token revocation list hoac session table.
- Chua co CSRF strategy neu chuyen qua cookie auth.
- Chua gioi han toc do login (rate limit).
- Chua co RBAC enforcement cho tung endpoint.

## 8. Cau hinh moi truong

Bien moi truong backend quan trong:
- API_PORT
- DATABASE_URL hoac DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD
- DB_SSL
- DB_AUTO_MIGRATE
- DB_RUN_SEED
- JWT_SECRET
- JWT_REFRESH_SECRET
- JWT_EXPIRES_IN
- JWT_REFRESH_EXPIRES_IN
- AUTH_ALLOW_PLAINTEXT_DEV
- AUTH_DEV_PASSWORD

Bien moi truong frontend quan trong:
- VITE_API_PROXY_TARGET
- VITE_API_BASE_URL

## 9. Van hanh va deploy

## 9.1 Luong startup khuyen nghi

1. Provision PostgreSQL managed service.
2. Cap env secrets cho backend.
3. Khoi dong backend voi DB_AUTO_MIGRATE=true.
4. Deploy frontend va cau hinh API endpoint.
5. Kiem tra health endpoint va auth flow.

## 9.2 Kha nang scale

Backend:
- Co the scale horizontal do stateless (token-based).
- Nhung can toi uu data layer vi replace snapshot de tranh lock lon.

Database:
- Can theo doi IOPS va lock contention khi data tang.
- Co the bo sung partition/chuyen CRUD SQL truc tiep theo bang.

## 9.3 Quan sat he thong

Hien trang:
- Log console co ban.
- Chua co structured logging.
- Chua co metrics va tracing.

De xuat:
- JSON logs + correlation id.
- Metrics endpoint (Prometheus).
- Error tracking (Sentry hoac tuong duong).

## 10. Chat luong va kiem thu

Hien co:
- Type check bang npm run lint (tsc --noEmit).

Chua co:
- Unit test cho dataService, auth flow, mapper DB.
- Integration test cho API + DB.
- E2E test cho login, booking, report.

Ke hoach de xuat:
1. Unit test (Vitest) cho frontend service va helper backend.
2. Integration test (supertest + test DB).
3. E2E (Playwright) cho luong nghiep vu chinh.
4. CI pipeline chay lint + test + migration smoke check.

## 11. Danh sach debt ky thuat

Debt muc cao:
1. PUT /api/data chua enforce auth.
2. Snapshot rewrite cho moi thao tac ghi.
3. Chua co validation schema request/response.
4. Chua co tach layer service/repository/controller.

Debt muc trung binh:
1. Chua co pagination/filtering cho endpoint read.
2. Chua co openapi spec tu dong.
3. Chua co migration rollback strategy ro rang.

## 12. Roadmap nang cap ky thuat

Giai doan 1 - Bao mat va do on dinh:
1. Chuyen refresh token sang HttpOnly Secure cookie.
2. Bat auth bat buoc cho PUT /api/data hoac loai bo endpoint nay.
3. Them request validation bang zod/joi.
4. Them login rate limit va account lockout co ban.

Giai doan 2 - Toi uu data layer:
1. Chuyen CRUD sang SQL truc tiep theo bang, bo snapshot rewrite.
2. Them transaction theo use case va conflict handling.
3. Them pagination, sorting, filtering.

Giai doan 3 - Nang luc production:
1. Structured logs + metrics + tracing.
2. Test tu dong day du va quality gate CI/CD.
3. OpenAPI + API versioning.
4. RBAC day du theo role va action.

## 13. Ket luan ky thuat

CinemaHub da hoan tat buoc chuyen doi quan trong tu frontend local-only sang mo hinh full-stack co backend, DB, auth va migration. Nen tang hien tai du de deploy va van hanh o quy mo nho-den-vua. De dat muc production manh va scale ben vung, can uu tien giam debt tai data layer, cung co bao mat token, va bo sung he thong kiem thu + quan sat.
