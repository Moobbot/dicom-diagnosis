# 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng Web Full-Stack

## 1️⃣ Chuẩn Bị Môi Trường

Kiểm tra và cài đặt các công cụ cần thiết:

### 1.1. Cài đặt Node.js (khuyến nghị phiên bản 20.\*)

🔹 Kiểm tra phiên bản:

```sh
node -v
```

🔹 Nếu chưa cài đặt, tải về từ trang chủ:
🔗 [nodejs-download](https://nodejs.org/en/download)

Hoặc cài đặt qua nvm (Linux/MacOS):

```sh
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 20

# Verify the Node.js version:
node -v # Should print "v20.18.3".
nvm current # Should print "v20.18.3".

# Verify npm version:
npm -v # Should print "10.8.2".
```

### 1.2. Kiểm tra và cài đặt Git

```sh
git --version
```

🔹 Nếu chưa có, tải về từ:
🔗 [Git Download](https://git-scm.com/downloads)

### 1.3. Cài đặt Docker (nếu sử dụng container)

🔗 [Docker Download](https://docs.docker.com/get-docker/)

```sh
docker -v  # Kiểm tra Docker đã cài đặt chưa
```

## 2️⃣ Clone Source Code về máy

```sh
git clone https://github.com/Moobbot/dicom-diagnosis.git
cd dicom-diagnosis
```

## 3️⃣ Cài Đặt Backend (Node.js, Express.js)

### 3.1. Chuyển vào thư mục Backend

```sh
cd backend
```

### 3.2. Sao chép và chỉnh sửa file .env

```sh
cp .env.example .env
```

🔹 Mở file .env và cập nhật thông tin:

```ini
# MongoDB connection string (replace 'localhost' and 'mydatabase' with your actual database host and name)
MONGO_DB_URI=<chuỗi kết nối DB>  # Ví dụ: mongodb://localhost:27017/dicom

# Base URL for the frontend application
FE_BASE_URL=http://localhost:3000

# Application environment:
# - development: for development purposes
# - production: for production deployment
# - test: for running tests
NODE_ENV=development

# The port on which the application server will run
PORT=8080

# Secret key used to sign and verify JSON Web Tokens (JWTs)
# Keep this value secure and private
JWT=accesssecretkey

# Access token expiration time in seconds
# Using the format: 15m, 30d, 1h, 1d
JWT_EXPIRATION=60m

# Secret key for signing and verifying refresh tokens
# Keep this value secure and private
JWT_REFRESH=refreshsecretkey

# Refresh token expiration time in seconds
# Using the format: 15m, 30d, 1h, 1d
JWT_REFRESH_EXPIRATION=7d

# Link connect SYBIL API
SYBIL_MODEL_BASE_URL=http://localhost:5000

LINK_SAVE_DICOM_UPLOADS = "./src/data/dicom/uploads"
LINK_SAVE_DICOM_RESULTS = "./src/data/dicom/results"
LINK_TEMPLATE_REPORT = "./src/data/report/format"
LINK_SAVE_REPORT = "./src/data/dicom/gen"

# Temporary file expiration time
TEMP_EXPIRATION = 1h
```

### 3.3. Cài đặt dependencies

Dùng npm:

```sh
npm install
```

### 3.4. Chạy migration database

```sh
npm run seed
```

### 3.5. Khởi động Backend

Chế độ phát triển:

```sh
npm run dev
```

Chế độ production:

```sh
npm run build
npm start
```

✅ Kiểm tra API tại: http://[ip-address]:5000/api

## 4️⃣ Cài Đặt Frontend (Next.js, React.js, TypeScript)

### 4.1. Chuyển vào thư mục Frontend

```sh
cd ../frontend
```

### 4.2. Sao chép và chỉnh sửa file .env

```sh
cp .env.example .env
```

```ini
# Base URL của API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api # https://api.example.com

# Server configuration
PORT=3000

# Environment của ứng dụng (development, staging, production)
NODE_ENV=development

# Debug mode (Bật/tắt log chi tiết cho development)
NEXT_PUBLIC_DEBUG=true

# Login page
NEXT_PUBLIC_LOGIN_PAGE=/login
```

### 4.3. Cài đặt dependencies

Dùng npm:

```sh
npm install
```

### 4.4. Chạy Frontend

Chế độ phát triển:

```sh
npm run dev
```

Build và chạy production:

```sh
npm run build
npm start
```

✅ Mở trình duyệt và truy cập: http://[ip-address]:3000

## 5️⃣ Kiểm Tra Ứng Dụng Hoạt Động

🔹 Backend chạy tại: http://localhost:5000/api
🔹 Frontend chạy tại: http://localhost:3000

### 🔍 Kiểm tra API Backend

```sh
curl -X GET http://localhost:5000/api/
```

🔹 Nếu API trả về {"message":"Hello World! This is the root route of the application."}, backend hoạt động tốt.

### 🔍 Kiểm tra tương tác giữa Frontend và Backend

Mở Developer Console (F12 → tab Network)
Kiểm tra xem có lỗi kết nối API không.

### 📜 Kiểm tra log

Kiểm tra log trong folder [./backend/src/logs](./backend/src/logs)

## 6️⃣ Xử Lý Lỗi Thường Gặp (Linux)

### ❌ Error: Port 5000 is already in use

🔹 Giải pháp: Kiểm tra tiến trình chạy trên cổng 5000 và tắt nó

```sh
lsof -i :5000  # Kiểm tra tiến trình
kill -9 <PID>  # Dừng tiến trình đang chiếm cổng
```

Hoặc đổi cổng trong .env:

```ini
PORT=5001
```

### ❌ Error: Cannot find module 'express'

🔹 Giải pháp: Cài đặt lại dependencies

```sh
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: Database connection failed

🔹 Giải pháp:

Kiểm tra kết nối database với telnet <DB_HOST> <PORT>.
Kiểm tra lại DATABASE_URL trong .env.
