import { Types } from "mongoose";

import {
    object,
    string,
    array,
    coerce,
    boolean,
    nativeEnum,
} from "zod";

import { Gender } from "../enums/gender.enum";

import { FindQuerySchema } from "./find-query.validation";

export const CreateUserSchema = object({
    username: string({ required_error: "Username is required!" }),
    password: string({ required_error: "Password is required!" }).min(
        6,
        "Password must be at least 6 characters!"
    ),
    roles: array(string()).min(1, "At least one role!"),
    detail_user: object({
        user_code: string({ required_error: "User code is required!" }),
        name: string({ required_error: "Name is required!" }),
        dob: coerce.date({ required_error: "Date of birth is required!" }),
        address: string().optional(),
        gender: nativeEnum(Gender, { required_error: "Gender is required!" }),
        avatar: string().optional(),
    }),
});

export const UpdateUserSchema = object({
    password: string()
        .min(6, "Password must be at least 6 characters!")
        .optional(),
    roles: array(string()).min(1, "At least one role!").optional(),
    detail_user: object({
        user_code: string().optional(),
        name: string().optional(),
        dob: coerce.date().optional(),
        address: string().optional(),
        gender: nativeEnum(Gender).optional(),
        avatar: string().optional(),
    }).optional(),
});

export const ChangeUserStatusSchema = object({
    status: boolean({ required_error: "Status is required!" }),
});

export const ChangeManyUserStatusSchema = object({
    userIds: array(string()).min(1, "At least one user!"),
    status: boolean({ required_error: "Status is required!" }),
});

export const FindUserQuerySchema = FindQuerySchema.extend({
    roles: string()
        .optional()
        .transform((val) =>
            val ? val.split(",").map((item) => item.trim()) : undefined
        )
        .refine(
            (val) =>
                val === undefined ||
                val.every((roleId) => Types.ObjectId.isValid(roleId)),
            {
                message: "Invalid role code!",
            }
        ),
    status: string()
        .optional()
        .transform((val) => {
            if (val) {
                if (val.toLowerCase() === "true") return true;
                if (val.toLowerCase() === "false") return false;
            }
        }),
});
