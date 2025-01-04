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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PermissionModel = model<IPermission>(
  "Permission",
  permissionSchema
);
