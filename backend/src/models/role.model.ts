import { Schema, model } from "mongoose";
import { IRole } from "../interfaces/role.interface";

const roleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
        },
        permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
        description: { type: String, default: "" },
        grant_all: { type: Boolean, default: false },
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

export const RoleModel = model<IRole>("Role", roleSchema);
