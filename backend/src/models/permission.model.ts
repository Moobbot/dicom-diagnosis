import { Schema, model } from "mongoose";
import { IPermission } from "../interfaces/permission.interface";

const permissionSchema = new Schema<IPermission>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
        updated_by: { type: Schema.Types.ObjectId, ref: "User" },
        status: { type: Boolean, default: true },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

export const PermissionModel = model<IPermission>(
    "Permission",
    permissionSchema
);
