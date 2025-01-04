# [`app.ts`](../../../backend/src/app.ts)

This code initializes and configures an Express application server for a Node.js application, setting up various security, logging, and middleware features. Here’s a breakdown of its functionality:

## 1. **Environment Configuration**

- `config` loads environment variables from a .env file.

## 2. **Middleware Setup**

- `successHandler` and `errorHandler` from [`morgan`](https://www.npmjs.com/package/morgan) provide custom logging for successful and error responses.
- `ExpressMongoSanitize` sanitizes request data to prevent MongoDB injection attacks.
- `morgan("dev")` log HTTP requests in the "dev" format, showing concise output for development.
- [`helmet`](https://www.npmjs.com/package/helmet) enhances security by setting various HTTP headers to prevent attacks, such as cross-origin resource sharing ([CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)) policy, cross-site scripting ([XXS](https://medium.com/@joshuapiesta/immersive-labs-cross-site-scripting-ep-5-filter-evasion-4e08820fc392)) filtering, and content security policies.
- `cors` enables cross-origin requests according to options set in `corsOptions`.
- `express.json()` and `cookieParser` parse JSON payloads and cookies from incoming requests.
- `bodyParser` with a URL-endcode parser handles data in form submissions, with a limit set to "30mb" to large requests.

## 3. **Router and Error Handling**

- `rootRouter` manages main application routes under `/api/`.
- `notFoundMiddleware` catches 404 errors for routes that don't exist.
- `errorHandlerMiddleware` handles and logs errors centrally.

This setup makes the Express app secure, scalable, and capable of handling JSON and URL-encoded data, supporting a structured and modular approach for backend development.

## 4. [cors-options.ts](../../../backend/src/config/cors-options.ts)

Sets up CORS (Cross-Origin Resource Sharing) options for an Express application, specifying which origins are permitted to access the server.

- **1. Allowed Origind**
  - The `allowedOrigins` array lists the specific domains (lcoalhost ports 3000 to 3003) that are allowed to access the server. Requests from other origins will be blocked unless explicitly allowed.
- **2. CORS Options (corsOptions)**
  - The `origin` property is a function that checks each incoming request's `origin` header: - If the request's origin is in the `allowedOrigins` list, or if no origin is provided (common for same-origin requests like form the server ifself), it allows the request by calling `callback(null, true)`. - `methods` restricts the allowed HTTP methods to GET, POST, PATCH, DELETE, and PUT. - `credentials: true` allows credentials (such as cookies) to be sent with requests. - `optionsSuccessStatus: 200` ensures a 200 status is returned for CORS preflight requests (even if the browser expects a different success code).

This setup helps secure the API by permitting only requests from known origins, while supporting necessary HTTP methods and enabling credentialed requests.

## 5. [index.route.ts](../../../backend/src/routes/index.route.ts)

Defines a root router for an Express application, organizing routes for different modules and exporting it for use in the main server configuration. Here's how it works:

- **1. Importing Routers**

  - Various route modules (`roleRouter`, `permissionRouter`, `userRouter`, `authRouter`) are imported. Each module likely defines route handlers related to a specific functionality (e.g., `roles`, `permissions`, `users`, `authentication`).

- **2. Defining the Root Router**

  - `rootRouter` is created as a main `Router` instance that serves as the central point for all these routes.

- **3. Example Configuring Routes**

  - `rootRouter.use("/permissions", permissionRouter);`: Routes under `/permissions` are handled by `permissionRouter`.
  - `rootRouter.use("/roles", roleRouter);`: Routes under `/roles` are handled by `roleRouter`.
  - `rootRouter.use("/users", userRouter);`: Routes under `/users` are handled by `userRouter`.
  - `rootRouter.use("/auth", authRouter);`: Routes under `/auth` are handled by `authRouter`.

- **4. Exporting the Root Router**

  - By exporting rootRouter, it can be imported and used as the main router for all API endpoints, usually mounted in the main server file.

In summary, this structure organizes the application routes into modules, keeping code modular and scalable as the application grows. Each specific router (`roleRouter`, `permissionRouter`, etc.) will handle routes within its own domain.

## 6. Example [user.route.ts](../../../backend/src/routes/user.route.ts)

Defines and exports an Express router for handling user-related routes, which includes various endpoints for user management. Here’s a breakdown of the key parts:

- **1. Dependencies and Middleware:**

  - `UserController`: Contains methods for handling requests related to users.
  - `asyncHandler`: Wraps asynchronous route handlers to catch errors automatically, simplifying error handling.
  - `authMiddleware`: Ensures that only authenticated users can access these routes.
  - `permissionMiddleware`: Enforces that users have specific permissions, using permission constants from the `Permission` model.

- **2. Defining User Routes:**

  - GET `/users/:id`:

    - Fetches a user by their ID.
    - Requires both `authMiddleware` and `permissionMiddleware` with `Permission.GET_USER`.
    - Calls `UserController.getUserById`.

  - GET `/users/`:

    - Retrieves a list of all users.
    - Requires `Permission.LIST_ALL_USERS`.
    - Calls `UserController.listAllUsers`.

  - POST `/users/`:

    - Creates a new user.
    - Requires `Permission.ADD_USER`.
    - Calls `UserController.createUser`.

  - PUT `/users/change-many-status`:

    - Changes the status of multiple users.
    - Requires `Permission.CHANGE_STATUS_USER`.
    - Calls `UserController.changeManyUserStatus`.

  - PUT `/users/:id`:

    - Updates a user’s details by ID.
    - Requires `Permission.EDIT_USER`.
    - Calls `UserController.updateUser`.

  - PUT `/users/:id/change-status`:

    - Changes the status of a specific user by ID.
    - Requires `Permission.CHANGE_STATUS_USER`.
    - Calls `UserController.changeUserStatus`.

  - Exporting `userRouter`:
    - This router, `userRouter`, is exported and can be included in the main `rootRouter` under a path like `/users`.

This setup provides a secure, permission-based structure for user management, using middlewares to enforce both authentication and fine-grained access control on each endpoint.

## Some Document

- [Security cross-site scripting filter settings](https://www.ibm.com/docs/en/openpages/9.0.0?topic=settings-security-cross-site-scripting-filter)
