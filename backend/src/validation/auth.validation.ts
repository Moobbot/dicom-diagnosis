import { z } from "zod";
import { Gender } from "../enums/gender.enum";

export const LoginUserSchema = z.object({
    username: z.string({ required_error: "Should have username" }),
    password: z.string({ required_error: "Should have password" }),
});

export const ChangeOldPasswordSchema = z
    .object({
        newPassword: z
            .string({ required_error: "Should have new password" })
            .min(6, "New password must be at least 6 characters"),
        oldPassword: z
            .string({ required_error: "Should have old password" })
            .min(6, "Old password must be at least 6 characters"),
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
        message: "New password and old password must be different",
        path: ["newPassword"], // This highlights the `newPassword` field in case of an error
    });

export const UpdateProfileSchema = z.object({
    detail_user: z
        .object({
            name: z.string().optional(),
            birth_date: z.coerce.date().optional(),
            address: z.string().optional(),
            gender: z.nativeEnum(Gender).optional(),
        })
        .optional(),
});
