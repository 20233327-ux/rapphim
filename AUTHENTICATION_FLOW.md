# 🔐 Luồng Đăng Ký & Đăng Nhập - CinemaHub

## 📊 **Tổng Quan**

```
┌─────────────────────────────────────────────────────────────┐
│          AUTHENTICATION FLOW (Đăng Ký ↔ Đăng Nhập)          │
└─────────────────────────────────────────────────────────────┘

┌─ PHASE 1: ĐĂNG KÝ (REGISTRATION) ─────────────────────────┐
│                                                              │
│  Frontend:                 Backend:          Database:      │
│  ┌──────────────┐         ┌─────────┐       ┌────────┐    │
│  │  User Form   │─POST───→│Register │──────→│ USERS  │    │
│  │              │  /api/  │ Endpoint│ INSERT│ TABLE  │    │
│  │ name         │ auth/   │         │       │        │    │
│  │ email        │register │         │       │ id     │    │
│  │ password     │         │         │       │ email  │    │
│  │ phone        │         │         │       │ pwd_   │    │
│  └──────────────┘         └─────────┘       │ hash   │    │
│                                              │ role   │    │
│                           ← JSON Response ─  │ points │    │
│                           {token, user}      └────────┘    │
│                                                              │
│  Flow:                                                       │
│  1. User fill form & submit                                │
│  2. Frontend POST /api/auth/register                       │
│  3. Backend validate (email format, password length)       │
│  4. Backend check duplicate email in DB                    │
│  5. Backend hash password (bcrypt, 10 rounds)              │
│  6. Backend INSERT into users table                        │
│  7. Backend return token + user info                       │
│  8. Frontend save token to localStorage                    │
│  9. Frontend auto-login, redirect dashboard               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ PHASE 2: ĐĂNG NHẬP (LOGIN) ──────────────────────────────┐
│                                                              │
│  Frontend:                 Backend:          Database:      │
│  ┌──────────────┐         ┌─────────┐       ┌────────┐    │
│  │  Login Form  │─POST───→│ Login   │──────→│ USERS  │    │
│  │              │  /api/  │ Endpoint│ SELECT│ TABLE  │    │
│  │ email        │ auth/   │         │ WHERE │ (Query)│    │
│  │ password     │ login   │         │ email │        │    │
│  └──────────────┘         └─────────┘       │ email  │    │
│         ↓                      ↓             │ pwd_   │    │
│   save token          compare passwords      │ hash   │    │
│   to localStorage     (bcrypt)              └────────┘    │
│         ↓                      ↓                            │
│   ready to call        ← JSON Response ─                  │
│   API endpoints        {token, refreshToken, user}        │
│                                                              │
│  Flow:                                                       │
│  1. User enter email + password                            │
│  2. Frontend POST /api/auth/login                          │
│  3. Backend SELECT user from DB (by email)                │
│  4. If user not found → Error 401                          │
│  5. Backend compare provided password with stored hash     │
│  6. If not match → Error 401                               │
│  7. Backend create JWT token (15min expire)                │
│  8. Backend create refresh token (7 days)                  │
│  9. Return token + refreshToken + user                     │
│  10. Frontend save tokens to localStorage                  │
│  11. Frontend redirect dashboard                           │
│  12. All API calls include "Authorization: Bearer token"  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ **Chi Tiết - Đăng Ký (Registration)**

### **1️⃣ Frontend → User Nhập Thông Tin**

```javascript
// src/components/AuthModule.tsx
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [phone, setPhone] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!name || password.length < 6 || password !== confirmPassword) {
    setError('...');
    return;
  }
  
  // Call backend
  const payload = await dataService.register(name, email, password, phone);
  onLogin(payload.user);  // Auto-login
};
```

### **2️⃣ Frontend → Gửi Request**

```javascript
// src/dataService.ts
register: async (name, email, password, phone) => {
  const response = await fetch(`/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone })
  });
  
  const payload = await response.json();
  
  // Save token
  localStorage.setItem('cinemahub_auth_token', payload.token);
  localStorage.setItem('cinemahub_refresh_token', payload.refreshToken);
  
  return payload;
};
```

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "MyPass123",
  "phone": "0901234567"
}
```

### **3️⃣ Backend → Validate & Process**

```javascript
// server/index.js
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  // Step 1: Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'name, email, password required' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters' 
    });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ 
      message: 'Invalid email format' 
    });
  }
  
  try {
    // Step 2: Check duplicate email in database
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }
    
    // Step 3: Hash password (bcrypt - 10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Step 4: Generate user ID
    const userId = `U${Date.now()}`;  // e.g., U1621234567890
    
    // Step 5: INSERT into database
    const insertResult = await pool.query(
      `INSERT INTO users (
        id, name, email, phone, password_hash, role, points, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'customer', 0, NOW(), NOW())
      RETURNING id, name, email, role`,
      [userId, name, email, phone || null, passwordHash]
    );
    
    const user = insertResult.rows[0];
    
    // Step 6: Create JWT tokens
    const token = jwt.sign(
      { sub: user.id, email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Step 7: Return response
    return res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'customer'
      }
    });
    
  } catch (error) {
    return res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});
```

### **4️⃣ Database → Lưu Dữ Liệu**

**SQL thực thi:**
```sql
INSERT INTO users (
  id, name, email, phone, password_hash, role, points, created_at, updated_at
) VALUES (
  'U1621234567890',
  'Nguyễn Văn A',
  'user@example.com',
  '0901234567',
  '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  -- bcrypt hash
  'customer',
  0,
  NOW(),
  NOW()
);
```

**Dữ liệu lưu trong PostgreSQL:**
```
id              │ U1621234567890
name            │ Nguyễn Văn A
email           │ user@example.com
phone           │ 0901234567
password_hash   │ $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
role            │ customer
points          │ 0
created_at      │ 2024-05-21 10:30:00+07
updated_at      │ 2024-05-21 10:30:00+07
```

### **5️⃣ Frontend → Lưu Token & Login**

```javascript
// Save tokens
localStorage.setItem('cinemahub_auth_token', payload.token);
localStorage.setItem('cinemahub_refresh_token', payload.refreshToken);

// Auto-login
onLogin(payload.user);

// Redirect
navigate('/dashboard');
```

---

## ✅ **Chi Tiết - Đăng Nhập (Login)**

### **1️⃣ Frontend → User Nhập Email + Password**

```javascript
// src/components/AuthModule.tsx (login mode)
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const payload = await dataService.login(email, password);
    onLogin(payload.user);  // Login
  } catch (error) {
    setError(error.message);
  }
};
```

### **2️⃣ Frontend → Gửi Request**

```javascript
// src/dataService.ts
login: async (identifier, password) => {
  const response = await fetch(`/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  
  if (!response.ok) {
    throw new Error('Invalid email/password');
  }
  
  const payload = await response.json();
  
  // Save tokens
  localStorage.setItem('cinemahub_auth_token', payload.token);
  localStorage.setItem('cinemahub_refresh_token', payload.refreshToken);
  
  return payload;
};
```

**Request:**
```json
{
  "identifier": "user@example.com",
  "password": "MyPass123"
}
```

### **3️⃣ Backend → Query Database**

```javascript
// server/index.js
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  try {
    // Step 1: SELECT user from database
    const result = await pool.query(
      `SELECT id, name, email, role, password_hash
       FROM users
       WHERE LOWER(email) = LOWER($1)
          OR LOWER(username) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );
    
    if (result.rowCount === 0) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    const user = result.rows[0];
    
    // Step 2: Compare provided password with stored bcrypt hash
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    // Step 3: Create JWT tokens
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Step 4: Return tokens
    return res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    return res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});
```

### **4️⃣ Database → Query & Verify**

**SQL thực thi:**
```sql
SELECT id, name, email, role, password_hash
FROM users
WHERE LOWER(email) = LOWER('user@example.com')
LIMIT 1;
```

**Kết quả:**
```
id              │ U1621234567890
name            │ Nguyễn Văn A
email           │ user@example.com
role            │ customer
password_hash   │ $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Backend verify password:**
```javascript
const stored_hash = '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const provided_password = 'MyPass123';

const isValid = await bcrypt.compare(provided_password, stored_hash);
// true → Mật khẩu đúng ✓
// false → Mật khẩu sai ✗
```

### **5️⃣ Frontend → Lưu Token & Dashboard**

```javascript
// Save tokens
localStorage.setItem('cinemahub_auth_token', payload.token);
localStorage.setItem('cinemahub_refresh_token', payload.refreshToken);

// Access dashboard
// Mỗi API call sẽ gửi token:
Authorization: Bearer <token>
```

---

## 🔄 **Luồng Hoàn Chỉnh (End-to-End)**

### **Scenario: Người Dùng Mới**

```
┌─ DAY 1: Đăng Ký ───────────────────────────────────────┐
│                                                          │
│ 1. User visit: https://cinemahub.render.com            │
│                                                          │
│ 2. Click "Đăng ký" tab                                 │
│                                                          │
│ 3. Fill form:                                          │
│    Tên: "Nguyễn Văn A"                                │
│    Email: "user@example.com"                          │
│    Password: "MyPass123"                              │
│    Phone: "0901234567"                                │
│                                                          │
│ 4. Click "Tạo tài khoản"                              │
│                                                          │
│ 5. Frontend POST /api/auth/register                   │
│    ↓                                                    │
│ 6. Backend:                                           │
│    • Validate email format                           │
│    • Check duplicate in DB                           │
│    • Hash password                                   │
│    • INSERT into users table ← SAVED TO DATABASE!    │
│    • Create JWT token                                │
│    ↓                                                    │
│ 7. Frontend:                                          │
│    • Save token to localStorage                      │
│    • Auto-login                                      │
│    • Redirect /dashboard                             │
│                                                          │
│ ✓ User successfully registered & logged in!          │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─ DAY 2: Đăng Nhập (Same User) ────────────────────────┐
│                                                          │
│ 1. User visit: https://cinemahub.render.com            │
│                                                          │
│ 2. Click "Đăng nhập" tab                              │
│                                                          │
│ 3. Fill form:                                          │
│    Email: "user@example.com"                          │
│    Password: "MyPass123"                              │
│                                                          │
│ 4. Click "Đăng nhập ngay"                             │
│                                                          │
│ 5. Frontend POST /api/auth/login                      │
│    ↓                                                    │
│ 6. Backend:                                           │
│    • SELECT user from DB by email ← RETRIEVE FROM DB! │
│    • Compare password with stored hash                │
│    • Create JWT token                                │
│    ↓                                                    │
│ 7. Frontend:                                          │
│    • Save token to localStorage                      │
│    • Redirect /dashboard                             │
│                                                          │
│ ✓ User successfully logged in!                        │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─ DAY 3+: Sử Dụng App ──────────────────────────────────┐
│                                                          │
│ 1. All API calls include token:                       │
│    GET /api/resources/showtimes                       │
│    Authorization: Bearer <token>                      │
│    ↓                                                    │
│ 2. Backend middleware:                                │
│    • Extract token from header                       │
│    • Verify JWT signature                            │
│    • Get user ID from token                          │
│    ↓                                                    │
│ 3. Process request:                                   │
│    • Query DB with user context                      │
│    • Return user-specific data                       │
│    • Log activity                                    │
│                                                          │
│ ✓ Seamless experience                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 **Tóm Tắt Quy Trình**

| Bước | Hành Động | Nơi Lưu | Trạng Thái |
|------|----------|---------|-----------|
| **Đăng Ký** | User submit form | Frontend | Form UI |
| | Frontend POST request | Network | Transit |
| | Backend validate & hash | Memory | Processing |
| | Backend INSERT | **PostgreSQL** | ✅ **Persistent** |
| | Backend return token | Frontend | Local Storage |
| | Frontend auto-login | UI | Dashboard |
| **Đăng Nhập** | User submit email+password | Frontend | Form UI |
| | Frontend POST request | Network | Transit |
| | Backend SELECT from DB | **PostgreSQL** | ✅ **Retrieved** |
| | Backend compare password | Memory | Processing |
| | Backend return token | Frontend | Local Storage |
| | Frontend access API | Every request | Authorization Header |

---

## 🛡️ **Security Notes**

✅ **Passwords không bao giờ lưu plaintext** - Luôn hash với bcrypt  
✅ **Tokens có expiry time** - Access: 15m, Refresh: 7 days  
✅ **Email unique** - Không thể có 2 tài khoản cùng email  
✅ **Database persistent** - Dữ liệu lưu vĩnh viễn trong PostgreSQL  
✅ **API authenticated** - Mọi request phải có token hợp lệ  

---

## ✅ **Test Luồng**

### **Test Registration**
```bash
curl -X POST https://cinemahub-ac0h.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Pass1234",
    "phone": "0901234567"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "U1621234567890",
    "name": "Test User",
    "email": "test@example.com",
    "role": "customer"
  }
}
```

### **Test Login**
```bash
curl -X POST https://cinemahub-ac0h.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Pass1234"
  }'
```

**Response:** (Giống registration response)

---

**Hoàn thiện! 🎬 Tài khoản đăng ký được lưu trong PostgreSQL, đăng nhập chỉ cần nhập lại email + password.**
