import { object, string, boolean, array, Schema } from "zod";

export const CreatePermissionSchema = object({
    name: string({ required_error: "Name is required" }),
    description: string({ required_error: "Description is required" }),
});

export const UpdatePermissionSchema = object({
    description: string({ required_error: "Description is required" }),
});

export const ChangePermissionStatusSchema = object({
    status: boolean({ required_error: "Status is required" }),
});
