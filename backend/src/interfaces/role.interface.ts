import { ObjectId, Types } from "mongoose";
import { IPermission } from "./permission.interface";

export interface IRole {
    name: string;
    grant_all: boolean;
    permissions: Types.ObjectId[];
    description?: string;
    createdAt: Date;
    created_by?: string;
    updated_at: Date;
    updated_by?: string;
    status: boolean;
}
