# DANH SÁCH CÔNG NGHỆ SỬ DỤNG CHO BÁO CÁO

## 1. KIẾN TRÚC HỆ THỐNG

- **Kiến trúc:** Client-Server Architecture (Frontend-Backend Separation)
- **Mô hình:** RESTful API
- **Giao tiếp:** HTTP/HTTPS Protocol

---

## 2. CÔNG NGHỆ FRONTEND

### 2.1. Framework & Ngôn ngữ
- **React 19** - Thư viện JavaScript để xây dựng giao diện người dùng
- **TypeScript** - Ngôn ngữ lập trình có kiểu dữ liệu tĩnh, được biên dịch sang JavaScript

### 2.2. Build Tools
- **Vite** - Build tool và development server hiện đại, tốc độ cao

### 2.3. Styling
- **Tailwind CSS** - Framework CSS utility-first để thiết kế giao diện

### 2.4. Routing
- **React Router DOM** - Thư viện quản lý routing và điều hướng trong ứng dụng React

### 2.5. HTTP Client
- **Axios** - Thư viện để thực hiện các HTTP requests

### 2.6. Authentication
- **JWT (JSON Web Token)** - Cơ chế xác thực và phân quyền người dùng

### 2.7. UI Components & Icons
- **Heroicons** - Thư viện icon cho React
- **React Icons** - Thư viện icon đa dạng

---

## 3. CÔNG NGHỆ BACKEND

### 3.1. Framework & Ngôn ngữ
- **Spring Boot 3.5** - Framework Java để xây dựng ứng dụng web và microservices
- **Java 21** - Ngôn ngữ lập trình hướng đối tượng

### 3.2. Spring Modules sử dụng
- **Spring Web** - Xây dựng RESTful APIs
- **Spring Security** - Xác thực và phân quyền người dùng
- **Spring Data MongoDB** - Tích hợp với cơ sở dữ liệu MongoDB
- **Spring Data Redis** - Tích hợp với Redis cho caching
- **Spring Validation** - Xác thực dữ liệu đầu vào
- **Spring OAuth2 Client** - Đăng nhập qua mạng xã hội (Google, Facebook)
- **Spring Mail** - Gửi email (OTP, thông báo)
- **Spring Actuator** - Monitoring và metrics cho ứng dụng

### 3.3. Authentication & Security
- **JWT (JJWT)** - Tạo và xử lý JSON Web Tokens
- **OAuth2** - Xác thực qua Google và Facebook

### 3.4. Code Generation & Utilities
- **Lombok** - Giảm boilerplate code trong Java
- **MapStruct** - Mapping tự động giữa các đối tượng Java

### 3.5. API Documentation
- **SpringDoc OpenAPI** - Tự động tạo tài liệu API (Swagger UI)

---

## 4. CƠ SỞ DỮ LIỆU

- **MongoDB** - Cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dạng document
- **Redis** - In-memory database, sử dụng cho caching và session management

---

## 5. DỊCH VỤ BÊN THỨ BA (Third-party Services)

- **Cloudinary** - Dịch vụ lưu trữ và quản lý hình ảnh trên cloud
- **Google OAuth2** - Đăng nhập bằng tài khoản Google
- **Facebook OAuth2** - Đăng nhập bằng tài khoản Facebook
- **SMTP** - Gửi email (OTP verification, password reset)

---

## 6. TOOLS & UTILITIES

### 6.1. Containerization
- **Docker** - Đóng gói ứng dụng thành container

### 6.2. Build Tools
- **Maven** - Quản lý dependencies và build project Java
- **npm** - Quản lý dependencies cho project Node.js/React

### 6.3. Development Tools
- **ESLint** - Kiểm tra chất lượng code JavaScript/TypeScript
- **TypeScript ESLint** - Linting cho TypeScript

---

## 7. TÍNH NĂNG CHÍNH CỦA HỆ THỐNG

Dựa trên codebase, hệ thống bao gồm các tính năng:

- **Quản lý người dùng:** Đăng ký, đăng nhập, OAuth2, quản lý profile
- **Quản lý bài đăng:** Tạo, chỉnh sửa, xóa bài đăng, upload ảnh
- **Tương tác:** Like, comment, reactions (6 loại cảm xúc)
- **Hệ thống XP & Ranking:** Điểm kinh nghiệm, level, bảng xếp hạng
- **Badge System:** Hệ thống huy hiệu
- **Direct Messaging:** Nhắn tin trực tiếp giữa người dùng
- **Follow System:** Theo dõi người dùng, privacy settings
- **Quản lý nội dung:** Admin dashboard, moderator tools
- **Phân quyền:** User, Moderator, Admin roles

---

## 8. MÔI TRƯỜNG PHÁT TRIỂN

- **Hệ điều hành:** Windows 10/11
- **IDE:** Cursor (hoặc VS Code)
- **Version Control:** Git (dự đoán)

---

## GHI CHÚ CHO BÁO CÁO

**Những điểm nên nhấn mạnh:**
1. Kiến trúc tách biệt Frontend-Backend, dễ mở rộng và bảo trì
2. Sử dụng JWT cho authentication, an toàn và hiệu quả
3. MongoDB phù hợp với dữ liệu không cấu trúc (posts, comments, users)
4. Redis tăng hiệu suất với caching
5. OAuth2 giúp người dùng đăng nhập dễ dàng
6. Cloudinary xử lý upload và lưu trữ ảnh hiệu quả
7. Spring Boot framework mạnh mẽ, nhiều module tích hợp sẵn
8. React + TypeScript đảm bảo code quality và developer experience tốt

