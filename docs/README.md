# CinemaHub Technical Documentation

Tài liệu này gồm các phần chính:

- `SRS.md`: Software Requirements Specification (yêu cầu hệ thống)
- `SDD.md`: Software Design Description (thiết kế kiến trúc và chi tiết kỹ thuật)
- `openapi.yaml`: Đặc tả API theo OpenAPI 3.0.3
- `postman_collection.json`: Bộ request Postman được nhóm theo folder nghiệp vụ
- `postman/local.postman_environment.json`: Môi trường Postman cho local
- `postman/staging.postman_environment.json`: Môi trường Postman cho staging
- `postman/production.postman_environment.json`: Môi trường Postman cho production
- `SEQUENCE_DIAGRAMS.md`: Sequence diagram cho các luồng nghiệp vụ cốt lõi

## Mục đích

- Chuẩn hóa tài liệu để bàn giao, bảo vệ đồ án và mở rộng hệ thống.
- Đồng bộ giữa yêu cầu, thiết kế và hợp đồng API.

## Cập nhật

Ngày cập nhật gần nhất: 2026-05-18

## Hướng dẫn Postman

1. Import `postman_collection.json` vào Postman.
2. Import một trong các environment trong thư mục `postman/`.
3. Chọn environment tương ứng: Local, Staging hoặc Production.
4. Chạy request `Auth - POST /api/auth/login` để tự động lưu `accessToken` và `refreshToken`.
5. Dùng tiếp các folder nghiệp vụ (`Movies`, `Rooms`, `Showtimes`, `Bookings`...) mà không cần nhập lại token thủ công.

Lưu ý:
- Hai file `staging` và `production` đang dùng URL mẫu, cần thay bằng domain API thực tế.
