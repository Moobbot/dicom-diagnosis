# Consistent framework for developing controllers

Consistent framework for developing controllers helps streamline development, maintain consistency, and improve readability across a project. Below is a general framework for structuring controller functions, along with step-by-step instructions to guide the coding process.

## Common Controller Writing Framework

`Each controller should follow a consistent structure, which includes:`

**1. Define the Controller Function**

- The controller function should handle a single responsibility, e.g., creating, reading, updating, or deleting a resource.

**2. Validate Input Data**

- Use a validation schema to ensure incoming data is formatted correctly.
- Return an error if validation fails, ideally with clear messaging.

**3. Perform Business Logic**

- Handle the core function, such as fetching data from a service, updating the database, or performing calculations.
- Use service functions to encapsulate logic and keep the controller focused on handling HTTP requests.

**4. Handle Errors**

- Use a consistent error handling approach (e.g., try-catch blocks or error handling middleware).
- Return specific error messages with appropriate HTTP status codes for different error types.

**5. Send a Response**

- Always return a well-structured JSON response.
- Include relevant data, success status, and messages where necessary.

**6. Document and Comment**

- Comment each controller function with a summary, input expectations, and outputs.

## Step-by-Step Guide for Coding Controller Functions

This guide will walk through a basic CRUD example:

- **1. Define the Controller Function**

Each function should take req and res parameters from Express:

```ts
const createUser = async (req: Request, res: Response) => {
  // Function implementation here
};
```

- **2. Validate Input Data**

Use a validation library (e.g., Zod, Joi, or Yup) to validate incoming request data. Return an error if validation fails:

```ts
const validatedData = CreateUserSchema.parse(req.body); // Throws if invalid
```

- **3. Perform Business Logic**

Use service classes to keep business logic separated from the controller. Example:

```ts
const roles = await RoleService.findRolesByIds(validatedData.roles);

if (roles.length !== validatedData.roles.length) {
  throw new NotFoundError(
    validatedData.roles.length === 1 ? "Role not found" : "Some roles not found"
  );
}
const existingUser = await UserService.findUserByName(validatedData.username);
if (existingUser) {
  throw new BadRequestError("User already exists");
}
```

- **4. Handle Errors**

Controllers should throw errors (to be caught by middleware) or handle them directly if needed:

```ts
if (!user) {
  throw new NotFoundError("User not found");
}
```

- **5. Send a Response**

Return a JSON response with a consistent format:

```ts
res.status(201).json({
  message: "User created successfully",
  success: true,
  data: newUser,
});
```

- **6. Document and Comment**

Include a comment summarizing the function, including expected inputs and outputs:

```ts
/**
 * Creates a new user.
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with created user data
 */
```

## Example

```ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import BadRequestError from "../errors/bad-request.error";
import NotFoundError from "../errors/not-found.error";
import { UserService } from "../services/user.service";
import { RoleService } from "../services/role.service";
import { CreateUserSchema } from "../validation/user.validation";

/**
 * Creates a new user in the system with specific roles.
 * - Validates user input using `CreateUserSchema`
 * - Checks for valid roles and existing username
 * - Hashes password and saves user data through `UserService`
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with new user data or error message
 */
const createUser = async (req: Request, res: Response) => {
  // Step 1: Validate input data
  const validatedData = CreateUserSchema.parse(req.body);

  // Step 2: Fetch and validate roles
  const roles = await RoleService.findRolesByIds(validatedData.roles);

  if (roles.length !== validatedData.roles.length) {
    throw new NotFoundError(
      validatedData.roles.length === 1
        ? "Role not found"
        : "Some roles not found"
    );
  }

  // Step 3: Check if user already exists
  const existingUser = await UserService.findUserByName(validatedData.username);

  if (existingUser) {
    throw new BadRequestError("User already exists");
  }

  // Step 4: Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedData.password, salt);

  // Step 5: Create user with validated data and roles
  const newUser = await UserService.createUser({
    username: validatedData.username,
    password: hashedPassword,
    name: validatedData.name,
    roles: roles,
    createdBy: req.userData.userId,
  });

  // Step 6: Send response
  res.status(201).json({
    message: "User created successfully",
    success: true,
    data: newUser,
  });
};
```
