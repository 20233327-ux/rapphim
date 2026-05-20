# Sequence Diagram - CinemaHub

Tài liệu này mô tả các luồng xử lý chính của hệ thống bằng Mermaid.

## 1. Luồng đăng nhập

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend (AuthModule)
    participant API as Backend API
    participant DB as PostgreSQL

    U->>FE: Nhập identifier/password
    FE->>API: POST /api/auth/login
    API->>DB: SELECT user by email/username
    DB-->>API: User record + password_hash
    API->>API: bcrypt.compare(password, hash)
    API->>API: Tạo accessToken + refreshToken
    API-->>FE: token + refreshToken + user
    FE->>FE: Lưu token vào localStorage
    FE-->>U: Đăng nhập thành công
```

## 2. Luồng khôi phục phiên sau reload

```mermaid
sequenceDiagram
    autonumber
    participant FE as Frontend (App)
    participant DS as dataService
    participant API as Backend API

    FE->>DS: getCurrentUser()
    DS->>API: GET /api/auth/me (Bearer accessToken)
    alt Access token còn hạn
        API-->>DS: 200 user profile
        DS-->>FE: user
        FE->>FE: setCurrentUser()
    else Access token hết hạn
        API-->>DS: 401 Unauthorized
        DS->>API: POST /api/auth/refresh (refreshToken)
        alt Refresh hợp lệ
            API-->>DS: token mới + refreshToken mới
            DS->>API: GET /api/auth/me (token mới)
            API-->>DS: 200 user profile
            DS-->>FE: user
        else Refresh thất bại
            API-->>DS: 401
            DS->>DS: clearAuthToken()
            DS-->>FE: null
        end
    end
```

## 3. Luồng lưu dữ liệu snapshot

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend Module
    participant APP as App State
    participant DS as dataService
    participant API as Backend API
    participant DB as PostgreSQL

    U->>FE: Thao tác CRUD trên UI
    FE->>APP: Cập nhật state
    APP->>APP: Debounce 400ms
    APP->>DS: saveData(AppData)
    DS->>API: PUT /api/data
    API->>DB: BEGIN transaction
    API->>DB: DELETE old snapshot tables
    API->>DB: INSERT new snapshot data
    API->>DB: COMMIT
    API-->>DS: 200 {ok:true}
    DS-->>APP: Success
```

## 4. Luồng refresh token khi gọi API protected

```mermaid
sequenceDiagram
    autonumber
    participant APP as App
    participant DS as dataService
    participant API as Backend API

    APP->>DS: authorizedFetch(request)
    DS->>API: request với accessToken
    alt 200 OK
        API-->>DS: Response data
        DS-->>APP: Response data
    else 401 Unauthorized
        API-->>DS: 401
        DS->>API: POST /api/auth/refresh
        alt Refresh success
            API-->>DS: token mới
            DS->>API: Retry request với token mới
            API-->>DS: Response data
            DS-->>APP: Response data
        else Refresh fail
            API-->>DS: 401
            DS->>DS: clearAuthToken()
            DS-->>APP: Unauthorized error
        end
    end
```
