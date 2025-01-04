import { object, string, TypeOf, date } from "zod";

export const LoginUserSchema = object({
    username: string({ required_error: "Should have username" }),
    password: string({ required_error: "Should have password" }),
});

export const ChangeOldPasswordSchema = object({
    newPassword: string({ required_error: "Should have new password" }).min(
        6,
        "New password must be at least 6 characters"
    ),
    oldPassword: string({ required_error: "Should have old password" }).min(
        6,
        "Old assword must be at least 6 characters"
    ),
});
