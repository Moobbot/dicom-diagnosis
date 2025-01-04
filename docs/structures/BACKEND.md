# Backend: Node.js + TypeScript (Module hóa)

- [Backend: Node.js + TypeScript (Module hóa)](#backend-nodejs--typescript-module-hóa)
  - [1. Folder Structure](#1-folder-structure)
  - [2. Giải thích chi tiết](#2-giải-thích-chi-tiết)

## 1. Folder Structure

```
backend/
├── src/
|   ├── constant
|   ├── controllers
│   |   ├── user.controller.ts
|   │   ├── authenticated_session.controller.ts
|   │   ├── role.controller.ts
|   │   ├── permission.controller.ts
|   │   └── role_permission.controller.ts
|   ├── models/
|   │   ├── user.model.ts
|   │   ├── role.model.ts
|   │   ├── permission.model.ts
|   │   └── role_permission.model.ts
|   ├── services/
|   |   ├── user.service.ts
|   |   ├── role.service.ts
|   |   ├── permission.service.ts
|   |   └── role_permission.service.ts
|   ├── routes/
|   |   ├── user.route.ts
|   |   ├── role.route.ts
|   |   ├── permission.route.ts
|   |   └── role_permission.route.ts
│   ├── modules/
│   │   └── test/
│   │       ├── config/
│   │       │   ├── test.config.ts
│   │       ├── controllers/
│   │       │   ├── test.controller.ts
│   │       ├── routes/
│   │       │   ├── test.routes.ts
│   │       ├── services/
│   │       │   ├── test.service.ts
│   │       └── models/
│   │           └── test.model.ts
│   ├── config/                  # Cấu hình cho hệ thống (DB, môi trường, JWT)
│   ├── middlewares/             # Các middleware chung như xác thực, logging
│   ├── utils/                   # Các hàm tiện ích, xử lý mã hóa, logging
│   ├── app.ts                   # Khởi tạo Express server và kết nối các module
│   └── server.ts                # Entry point khởi chạy server
├── .env                         # Biến môi trường (DB connection, JWT secret)
├── tsconfig.json                # Cấu hình TypeScript
└── package.json                 # Thông tin, dependencies của backend
```

## 2. Giải thích chi tiết

- **constant/**: Chứa các hằng số (constant) sử dụng xuyên suốt hệ thống như mã lỗi, thông điệp cảnh báo, hoặc các cấu hình cố định.
- **controllers/**:
  - **user.controller.ts**: Xử lý các yêu cầu liên quan đến người dùng như đăng ký, đăng nhập, và quản lý tài khoản.
  - **authenticated_session.controller.ts**: Quản lý các phiên đăng nhập và xác thực người dùng.
  - **role.controller.ts**: Xử lý việc quản lý vai trò (role) của người dùng.
  - **permission.controller.ts**: Xử lý quyền hạn (permission) của vai trò.
  - **role_permission.controller.ts**: Xử lý liên kết giữa vai trò và quyền hạn.
- **models/**:
  - **user.model.ts**: Định nghĩa cấu trúc dữ liệu người dùng, các trường như tên, email, mật khẩu.
  - **role.model.ts**: Mô tả cấu trúc dữ liệu vai trò, như tên vai trò, mô tả.
  - **permission.model.ts**: Mô tả quyền hạn trong hệ thống, lưu thông tin các quyền hạn cụ thể.
  - **role_permission.model.ts**: Bảng trung gian lưu quan hệ giữa vai trò và quyền hạn.
- **services/:**
  - **user.service.ts**: Thực hiện logic nghiệp vụ liên quan đến người dùng như CRUD người dùng.
  - **role.service.ts**: Xử lý nghiệp vụ liên quan đến vai trò, như tạo và cập nhật vai trò.
  - **permission.service.ts**: Quản lý quyền hạn như thêm, xóa quyền.
  - **role_permission.service.ts**: Xử lý việc gán quyền cho vai trò.
- **routes/**:
  - **user.route.ts**: Định nghĩa các API endpoint cho user (người dùng), ví dụ như /login, /register.
  - **role.route.ts**: Các endpoint cho quản lý vai trò, như /roles/create.
  - **permission.route.ts**: API để quản lý quyền hạn, như thêm hoặc cập nhật quyền hạn.
  - **role_permission.route.ts**: Endpoint để liên kết quyền và vai trò, như /assign-permission.
- **modules/**:
  - **test/**: Quản lý xét nghiệm (là một module độc lập).
    - **test.config.ts**: Cấu hình riêng cho module xét nghiệm, như tên bảng, thông số cố định.
    - **test.controller.ts**: Xử lý yêu cầu API liên quan đến xét nghiệm, như tạo, xem kết quả xét nghiệm.
    - **test.routes.ts**: Định nghĩa các endpoint liên quan đến xét nghiệm.
    - **test.service.ts**: Chứa logic nghiệp vụ cho xét nghiệm như tính toán kết quả.
    - **test.model.ts**: Định nghĩa cấu trúc dữ liệu cho xét nghiệm.
- **config/**: Chứa cấu hình hệ thống như kết nối cơ sở dữ liệu, cài đặt JWT (JSON Web Token), và các thông tin môi trường như đường dẫn API hoặc cổng (port).
- **middlewares/**: Chứa các middleware như xác thực người dùng (authentication), logging, xử lý lỗi để bảo vệ và quản lý các yêu cầu trước khi đến controller.
- **utils/**: Chứa các hàm tiện ích được sử dụng nhiều nơi trong hệ thống, như mã hóa dữ liệu, xử lý lỗi, format dữ liệu đầu vào.
- **app.ts**: Là nơi khởi tạo server Express, kết nối các module và route lại với nhau để hệ thống có thể hoạt động.
- **server.ts**: Entry point chính của ứng dụng, từ đây hệ thống bắt đầu chạy và lắng nghe các request từ người dùng.
- **.env**: Lưu trữ các biến môi trường, như thông tin kết nối database, cài đặt JWT secret, cổng server.
- **tsconfig.json**: Cấu hình TypeScript cho dự án, bao gồm các quy định về cách biên dịch code TypeScript thành JavaScript.
- **package.json**: Quản lý các thư viện, dependencies và script cần thiết để chạy hệ thống, như Express, TypeORM, JWT.
