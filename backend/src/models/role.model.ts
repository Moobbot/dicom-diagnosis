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
        grantAll: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        status: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const RoleModel = model<IRole>("Role", roleSchema);
