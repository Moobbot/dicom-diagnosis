import { object, string, boolean, array, Schema, union } from "zod";
import { ObjectId } from "mongodb";

export const CreateRoleSchema = object({
    name: string({ required_error: "Name is required" }),
    grant_all: boolean().optional(),
    description: string().optional(),
});

export const UpdateRoleSchema = object({
    name: string().optional(),
    permissions: array(string()).optional(),
    grant_all: boolean().optional(),
    description: string().optional(),
});

export const ChangeRoleStatusSchema = object({
    status: boolean({ required_error: "Status is required" }),
});
