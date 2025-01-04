# Quy Tắc Đặt Tên Trong Project

## 1. Quy Tắc Đặt Tên Biến (Variables)

- **Biến cục bộ (local variables)**: sử dụng `camelCase`.
  - Ví dụ: `userName`, `emailAddress`, `totalAmount`.

- **Biến hằng số (constant variables)**: sử dụng `UPPER_CASE` và phân cách bằng dấu gạch dưới `_`.
  - Ví dụ: `MAX_RETRY_COUNT`, `API_BASE_URL`.

- **Biến toàn cục (global variables)**: Hạn chế sử dụng, nhưng nếu có, dùng `camelCase` với tiền tố `g_`.
  - Ví dụ: `g_appConfig`.

## 2. Quy Tắc Đặt Tên Hàm (Functions)

- Sử dụng `camelCase` cho tên hàm và phải là một động từ hoặc một cụm từ diễn tả hành động.
  - Ví dụ: `getUserData`, `calculateTotalPrice`, `sendNotification`.

- Tên hàm cần rõ ràng và dễ hiểu, diễn đạt đúng nhiệm vụ mà nó thực hiện.

## 3. Quy Tắc Đặt Tên Interface

- Sử dụng `PascalCase`, và thêm tiền tố `I` cho các interface.
  - Ví dụ: `IUser`, `IProductService`, `IOrderRepository`.

## 4. Quy Tắc Đặt Tên Class/Model

- **Class và Model**: Sử dụng `PascalCase`.
  - Ví dụ: `User`, `ProductModel`, `OrderController`.


## 5. Quy Tắc Đặt Tên File

- Sử dụng `kebab-case` (chữ thường và phân cách bởi dấu gạch ngang).
  - Ví dụ: `error-handler.middleware.ts`, `cors-options.ts`.

- **Thêm hậu tố cho các file đặc biệt**:
  - **Model**: Kết thúc bằng `model.ts`.
    - Ví dụ: `user.model.ts`, `role.model.ts`.
  - **Service**: Kết thúc bằng `.service.ts`.
    - Ví dụ: `user.service.ts`, `role.service.ts`.
  - **Controller**: Kết thúc bằng `.controller.ts`.
    - Ví dụ: `user.controller.ts`, `auth.controller.ts`.
  - **Middleware**: Kết thúc bằng `.middleware.ts`.
    - Ví dụ: `auth.middleware.ts`, `error.middleware.ts`.
  - **Error**: Kết thúc bằng `.error.ts`.
    - Ví dụ: `bad-request.error.ts`.
  - **Route**: Kết thúc bằng `.route.ts`.
    - Ví dụ: `user.route.ts`, `auth.route.ts`.

## 6. Quy Tắc Đặt Endpoint API

- Sử dụng danh từ số nhiều (plural noun) để biểu thị tài nguyên (resources).
  - Ví dụ: `/users`, `/roles`, `/orders`.

- Các method trong route viết theo thứ tự GET, POST, PUT, PATCH, DELETE.

    Ví dụ:
    - **GET** `/users`: Lấy danh sách người dùng.
    - **GET** `/users/:id`: Lấy thông tin chi tiết người dùng với `id`.
    - **POST** `/users`: Tạo mới người dùng.
    - **PUT** `/users/:id`: Cập nhật thông tin người dùng với `id`.
    - **PATCH** `/users/:id/add-role`: Cập nhật một phần thông tin người dùng với `id`.
    - **DELETE** `/users/:id`: Xóa người dùng với `id`.

- Tránh việc lồng quá sâu các endpoint, nếu cần thì tối đa 2-3 cấp.
  - Ví dụ: `/users/:id/orders/:orderId` (cấp 3 là hợp lý).

- Đối với các endpoint xử lý hành động đặc biệt, sử dụng các động từ rõ ràng và kết hợp với tài nguyên.
  - Ví dụ: `/users/:id/activate` (kích hoạt tài khoản người dùng).

## 7. Quy Tắc Đặt Tên Middleware

- Sử dụng `camelCase` cho middleware.
  - Ví dụ: `authenticateUser`, `logRequest`, `validateInput`.

## 8. Quy Tắc Đặt Tên Các Thư Mục

- Tên thư mục dùng `kebab-case`.
  - Ví dụ: `controllers`, `services`, `models`, `middlewares`.

## 9. Quy Tắc Đặt Tên Các Kiểu Dữ Liệu (Types) hoặc Enums

- Sử dụng `PascalCase` cho các kiểu dữ liệu và enum.
  - Ví dụ: `UserType`, `OrderStatus`.

## 10. Quy Tắc Khác

- **Đừng sử dụng tên viết tắt** trừ khi nó thực sự phổ biến và dễ hiểu (ví dụ: `id`, `URL`).
- **Tên phải rõ ràng và có ý nghĩa**, tránh việc đặt tên quá ngắn hoặc quá chung chung như `data`, `item`, `obj`, `temp`.

