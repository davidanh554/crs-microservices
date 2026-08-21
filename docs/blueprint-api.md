# Blueprint API Toàn Hệ Thống - CRS Microservices

Tài liệu thiết kế toàn bộ REST API dự kiến cho các service trong hệ thống Course Registration System (CRS).

---

## 1. Auth Service (`auth-service`)
- **Cổng chạy**: `8081`
- **Tiền tố qua Gateway**: `/api/auth`

| Method | Endpoint | Mô tả | Yêu cầu quyền / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Đăng nhập tài khoản, xác thực thông tin và trả về JWT token | `Public` |
| `POST` | `/auth/register` | Đăng ký tài khoản mới cho sinh viên *(tuỳ chọn)* | `Public` |

---

## 2. Course Service (`course-service`)
- **Cổng chạy**: `8082`
- **Tiền tố qua Gateway**: `/api/courses`

### 2.1. API công khai & Quản trị (Dành cho Client / Gateway)
| Method | Endpoint | Mô tả | Yêu cầu quyền / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/courses` | Lấy danh sách môn học, hỗ trợ tìm kiếm theo tên và phân trang | `Public` |
| `GET` | `/courses/{id}` | Lấy thông tin chi tiết một môn học theo ID | `Public` |
| `POST` | `/courses` | Thêm môn học mới | `ADMIN` |
| `PUT` | `/courses/{id}` | Cập nhật thông tin môn học | `ADMIN` |
| `DELETE` | `/courses/{id}` | Xóa môn học | `ADMIN` |

### 2.2. API nội bộ (Internal API - Chỉ gọi giữa các service, không qua Gateway)
| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/internal/courses/{id}/reserve-seat` | Kiểm tra còn chỗ và trừ 1 chỗ (`soChoConLai`) | Được gọi từ `registration-service` khi sinh viên đăng ký |
| `PATCH` | `/internal/courses/{id}/release-seat` | Hoàn trả 1 chỗ (`soChoConLai`) | Được gọi khi sinh viên hủy đăng ký môn học |

---

## 3. Registration Service (`registration-service`)
- **Cổng chạy**: `8083`
- **Tiền tố qua Gateway**: `/api/registrations`

| Method | Endpoint | Mô tả | Yêu cầu quyền / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/registrations` | Đăng ký học phần (gọi ngầm sang Course Service để giữ chỗ) | `STUDENT` |
| `GET` | `/registrations/my` | Lấy danh sách các học phần mà sinh viên hiện tại đã đăng ký | `STUDENT` |
| `DELETE` | `/registrations/{id}` | Hủy đăng ký học phần (gọi ngầm sang Course Service hoàn trả chỗ) | `STUDENT` / `ADMIN` |
