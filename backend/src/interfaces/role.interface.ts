import { ObjectId, Types } from "mongoose";
import { IPermission } from "./permission.interface";

export interface IRole {
    name: string;
    grantAll: boolean;
    permissions: Types.ObjectId[];
    description?: string;
    createdAt: Date;
    createdBy?: string;
    updatedAt: Date;
    updatedBy?: string;
    status: boolean;
}
