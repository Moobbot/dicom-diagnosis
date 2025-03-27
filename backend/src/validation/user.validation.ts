import { Types } from "mongoose";

import {
    object,
    string,
    array,
    date,
    enum as zenum,
    coerce,
    TypeOf,
    union,
    boolean,
    nativeEnum,
} from "zod";

import { Gender } from "../enums/gender.enum";

import { FindQuerySchema } from "./find-query.validation";

export const CreateUserSchema = object({
    username: string({ required_error: "Name is required" }),
    password: string({ required_error: "Password is required" }).min(
        6,
        "Password must be at least 6 characters"
    ),
    roles: array(string()).min(1, "At least one role is required"),
    detail_user: object({
        user_code: string({ required_error: "User code is required" }),
        name: string({ required_error: "Name is required" }),
        dob: coerce.date().optional(),
        address: string().optional(),
        gender: nativeEnum(Gender, { required_error: "Gender is required" }),
    }),
});

export const UpdateUserSchema = object({
    password: string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
    roles: array(string()).min(1, "At least one role is required").optional(),
    detail_user: object({
        user_code: string().optional(),
        name: string().optional(),
        dob: coerce.date().optional(),
        address: string().optional(),
        gender: nativeEnum(Gender).optional(),
    }).optional(),
});

export const ChangeUserStatusSchema = object({
    status: boolean({ required_error: "Status is required" }),
});

export const ChangeManyUserStatusSchema = object({
    userIds: array(string()).min(1, "At least one user is required"),
    status: boolean({ required_error: "Status is required" }),
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
                message: "Invalid role ID",
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
