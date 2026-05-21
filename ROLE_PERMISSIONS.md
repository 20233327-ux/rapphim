# 🔐 Role-Based Access Control (RBAC)

## Phân Quyền Người Dùng - CinemaHub

---

## 📋 **Tóm Tắt Quyền**

| Quyền | Admin | Manager | Staff | Customer |
|------|-------|---------|-------|----------|
| Quản lý phim | ✅ | ✅ | ❌ | ❌ |
| Quản lý phòng | ✅ | ✅ | ❌ | ❌ |
| Quản lý suất chiếu | ✅ | ✅ | ❌ | ❌ |
| Quản lý nhân viên | ✅ | ✅ | ❌ | ❌ |
| Quản lý ca làm | ✅ | ✅ | ✅ | ❌ |
| Xem báo cáo | ✅ | ✅ | ✅ | ❌ |
| Đặt vé | ✅ | ✅ | ✅ | ✅ |
| Xem lịch sử vé | ✅ | ✅ | ✅ | ✅ |
| Quản lý người dùng | ✅ | ❌ | ❌ | ❌ |

---

## 👤 **Chi Tiết Từng Role**

### **1. ADMIN (Quản Trị Viên)**
**ID User:** `U1`  
**Email:** `admin@cinema.com`  
**Password:** `Admin@123`

**Quyền:**
- ✅ Tạo/Sửa/Xóa phim
- ✅ Tạo/Sửa/Xóa phòng chiếu
- ✅ Tạo/Sửa/Xóa suất chiếu
- ✅ Tạo/Sửa/Xóa người dùng (tất cả role)
- ✅ Quản lý ca làm việc
- ✅ Xem báo cáo toàn hệ thống
- ✅ Đặt vé cho khách
- ✅ Quản lý khuyến mãi
- ✅ Quản lý cấu hình hệ thống

**Ví dụ API:**
```bash
# Tạo user mới với role tùy ý
POST /api/resources/users
Authorization: Bearer <admin_token>
{
  "id": "U5",
  "name": "New Manager",
  "email": "manager@cinema.com",
  "phone": "0912345678",
  "role": "manager",  # Admin chỉ định
  "password_hash": "..." # Admin set password
}
```

---

### **2. MANAGER (Quản Lý)**
**ID User:** Được admin tạo  
**Email:** Tùy admin  
**Password:** Tùy admin

**Quyền:**
- ✅ Tạo/Sửa/Xóa phim
- ✅ Tạo/Sửa/Xóa phòng chiếu
- ✅ Tạo/Sửa/Xóa suất chiếu
- ✅ Tạo/Sửa staff
- ✅ Quản lý ca làm việc
- ✅ Xem báo cáo
- ✅ Đặt vé cho khách

**Giới Hạn:**
- ❌ Không thể xóa/sửa admin/manager khác
- ❌ Không thể sửa cấu hình hệ thống
- ❌ Không thể tạo admin/manager

---

### **3. STAFF (Nhân Viên)**
**ID User:** Được admin/manager tạo  
**Email:** Tùy admin/manager  
**Password:** Tùy admin/manager

**Quyền:**
- ✅ Quản lý ca làm việc (của mình)
- ✅ Xem báo cáo ca
- ✅ Đặt vé cho khách
- ✅ Xem lịch sử đặt vé
- ✅ Quản lý booking

**Giới Hạn:**
- ❌ Không thể tạo/sửa phim, phòng, suất chiếu
- ❌ Không thể tạo user
- ❌ Không thể xem báo cáo toàn hệ thống (chỉ ca của mình)

---

### **4. CUSTOMER (Khách Hàng)**
**Đối Tượng:** Người dùng tự đăng ký hoặc được admin tạo

**Quyền:**
- ✅ Đặt vé xem phim
- ✅ Xem lịch sử đặt vé của mình
- ✅ Quản lý thông tin tài khoản cá nhân
- ✅ Xem điểm thành viên

**Giới Hạn:**
- ❌ Không thể tạo/sửa bất kì gì
- ❌ Không thể xem dữ liệu người dùng khác
- ❌ Không thể xem báo cáo

---

## 🔑 **Authorization Policies**

### **1. Đăng Ký Tài Khoản (Self-Registration)**
```
POST /api/auth/register

💡 POLICY:
├─ Người dùng tự đăng ký → role = "customer" (cứng)
├─ Không thể chọn role khác
├─ Không thể yêu cầu role admin/manager/staff
└─ Server sẽ từ chối và log attempt nếu request role khác
```

**Ví dụ yêu cầu:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "MyPass123",
  "phone": "0901234567"
  // ⚠️ KHÔNG thể gửi "role" - nó sẽ bị bỏ qua
}
```

**Kết quả:**
```json
{
  "token": "...",
  "user": {
    "id": "U1621234567890",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "customer"  // ✓ Luôn là "customer"
  }
}
```

---

### **2. Tạo User (Admin/Manager Chỉ)**
```
POST /api/resources/users
Authorization: Bearer <token>

💡 POLICY:
├─ Yêu cầu role = admin hoặc manager
├─ Có thể chỉ định role = customer, staff, manager
├─ Admin có thể tạo admin/manager mới
├─ Manager chỉ có thể tạo staff/customer
└─ Log: {"action": "create_user", "by": "admin@...", "role": "staff"}
```

---

### **3. Xóa/Sửa User**
```
PATCH/DELETE /api/resources/users/:id
Authorization: Bearer <token>

💡 POLICY:
├─ Admin: Có thể sửa/xóa bất kì user nào
├─ Manager: Chỉ có thể sửa staff/customer (không được sửa admin/manager)
├─ Staff: Chỉ có thể sửa thông tin của mình
├─ Customer: Chỉ có thể sửa thông tin của mình
└─ Audit: Log tất cả thay đổi role
```

---

### **4. Xem Dữ Liệu**
```
GET /api/resources/:resource
Authorization: Bearer <token>

💡 POLICY:
├─ Admin: Xem tất cả
├─ Manager: Xem tất cả (không xem được tài khoản admin khác)
├─ Staff: Xem tất cả (dùng cho nghiệp vụ)
└─ Customer: Chỉ xem dữ liệu của mình
  ├─ Bookings: Chỉ xem booking của mình
  ├─ Users: Chỉ xem profile của mình
  └─ Showtimes: Xem tất cả (để đặt vé)
```

---

## 🚀 **Các Trường Hợp Sử Dụng**

### **Case 1: Khách Hàng Đăng Ký**
```
1. Người dùng click "Đăng ký"
2. Nhập: name, email, password
3. POST /api/auth/register
4. Backend:
   ✓ Validate input
   ✓ Kiểm tra email trùng
   ✓ Hash password
   ✓ INSERT user với role="customer"
   ✓ Trả về token
5. Frontend: Auto-login, redirect dashboard
```

---

### **Case 2: Admin Tạo Manager**
```
1. Admin login
2. Go to Users Management
3. Click "Create User"
4. Form:
   - Name: "Manager 1"
   - Email: "manager1@cinema.com"
   - Password: "TempPass123"
   - Role: [dropdown] → chọn "manager"
   - Phone: "0901234567"
5. POST /api/resources/users
   {
     "name": "Manager 1",
     "email": "manager1@cinema.com",
     "password_hash": "bcrypt(...)",
     "role": "manager",
     "phone": "0901234567"
   }
6. Backend:
   ✓ Verify token = admin
   ✓ Validate role = "manager" ≠ "customer"
   ✓ INSERT user
   ✓ Log: "admin created user with role=manager"
   ✓ Return new user data
7. Frontend: Show success, add to users list
```

---

### **Case 3: Manager Tạo Staff**
```
1. Manager login
2. Go to Users Management
3. Create User:
   - Role: "staff" ✓ (Manager được phép)
   - Role: "admin" ✗ (Manager bị từ chối)
4. POST /api/resources/users
5. Backend:
   ✓ Verify token = manager
   ✓ Verify role != "admin" (manager không thể tạo admin)
   ✓ INSERT user với role="staff"
6. Result: ✓ Success
```

---

## 🔍 **Logging & Audit**

Mỗi thao tác liên quan đến role sẽ được log:

```javascript
console.log({
  timestamp: "2024-05-21T10:30:00Z",
  action: "register",
  email: "user@example.com",
  role: "customer",  // Luôn customer
  method: "self-registration"
});

console.log({
  timestamp: "2024-05-21T10:30:00Z",
  action: "create_user",
  by: "admin@cinema.com",
  created_user: "staff@cinema.com",
  role: "staff"
});

console.log({
  timestamp: "2024-05-21T10:30:00Z",
  action: "unauthorized_attempt",
  email: "manager@cinema.com",
  tried_action: "create_admin",
  result: "denied"
});
```

---

## 🛡️ **Security Rules**

1. **Role Assignment Immutable at Registration**
   - ✗ Người dùng KHÔNG thể yêu cầu role khác khi đăng ký
   - ✓ Server gán mặc định role="customer"

2. **Role Escalation Protection**
   - ✗ Staff KHÔNG thể upgrade thành manager
   - ✓ Chỉ admin có thể thay đổi role

3. **Token Contains Role**
   - JWT token có chứa `role` claim
   - Server verify token → lấy role → check permission

4. **Admin Cannot be Deleted**
   - ✗ Không thể xóa user có role="admin"
   - ✗ Phải có ít nhất 1 admin trong hệ thống

5. **Email Unique per User**
   - ✗ Không thể có 2 user cùng email
   - ✓ Registration sẽ từ chối nếu email trùng

---

## 📝 **Các Endpoint Liên Quan**

```
[POST]   /api/auth/register              → Tự đăng ký (role=customer)
[POST]   /api/auth/login                 → Đăng nhập
[GET]    /api/resources/users            → Xem users
[POST]   /api/resources/users            → Tạo user (admin/manager)
[PATCH]  /api/resources/users/:id        → Sửa user
[DELETE] /api/resources/users/:id        → Xóa user
[GET]    /api/auth/me                    → Lấy user hiện tại
[POST]   /api/auth/refresh               → Refresh token
```

---

## ✅ **Checklist Triển Khai**

- [x] Database schema có role column (user_role ENUM)
- [x] JWT token chứa role claim
- [x] Registration API set role="customer"
- [x] Create user API kiểm tra role hợp lệ
- [x] Middleware authenticate và authorize
- [x] Logging tất cả hành động liên quan role
- [x] Document phân quyền này
- [ ] Frontend hiển thị role badge
- [ ] Admin dashboard quản lý role
- [ ] Test security: xóa admin, role escalation, etc.

