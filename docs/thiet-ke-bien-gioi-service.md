# Thiết Kế Biên Giới Service (Service Boundary Design) - CRS Microservices

## 1. Danh sách Service

| Service | Cổng | Database | Trách nhiệm chính |
| :--- | :---: | :---: | :--- |
| **api-gateway** (gateway-service) | `8080` | *(không có DB)* | Điểm vào duy nhất của hệ thống, định tuyến request đến các service con, xác thực sơ bộ, xử lý CORS. |
| **auth-service** | `8081` | `auth_db` | Quản lý User, Student, xác thực đăng nhập, sinh và kiểm tra JWT token. |
| **course-service** | `8082` | `course_db` | Quản lý danh mục Course, tìm kiếm, phân trang, quản lý số chỗ tối đa và số chỗ còn lại. |
| **registration-service** | `8083` | `registration_db` | Quản lý việc đăng ký học phần (Registration), gọi REST API sang `course-service` để giữ/hoàn chỗ. |

---

## 2. Nguyên tắc sở hữu dữ liệu (Data Ownership)

- **Database per Service**: Mỗi service sở hữu một Database riêng biệt, không có bất kỳ service nào được phép kết nối trực tiếp vào Database của service khác.
- **Giao tiếp qua REST API**: Khi một service cần dữ liệu hoặc muốn thay đổi trạng thái thuộc quyền quản lý của service khác, bắt buộc phải gọi qua REST API.
- **Không sử dụng Foreign Key liên Database**:
  - *Ví dụ*: `registration-service` chỉ lưu `courseId` và `studentId` dưới dạng kiểu số nguyên (`Long`), hoàn toàn không tạo Foreign Key vật lý tới bảng của `course-service` hay `auth-service`.

---

## 3. Bảng định tuyến Gateway (Dự kiến)

| Route (Đường dẫn) | Forward tới | Ghi chú |
| :--- | :--- | :--- |
| `/api/auth/**` | `http://localhost:8081` | Public (login, register), các endpoint bảo vệ cần JWT. |
| `/api/courses/**` | `http://localhost:8082` | GET public, các thao tác POST/PUT/DELETE yêu cầu Role ADMIN. |
| `/api/registrations/**` | `http://localhost:8083` | Yêu cầu JWT (Role STUDENT hoặc ADMIN). |
| `/api/public/courses` | `http://localhost:8082` | Dùng API Key (dành riêng cho các đối tác bên ngoài tích hợp). |
