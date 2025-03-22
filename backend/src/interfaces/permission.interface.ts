import { ObjectId } from "mongoose";

export interface IPermission {
    name: string;
    description: string;
    createdAt: Date;
    created_by?: string;
    updated_at: Date;
    updated_by?: string;
    status: boolean;
}
