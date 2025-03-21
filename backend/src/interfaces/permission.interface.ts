import { ObjectId } from "mongoose";

export interface IPermission {
    name: string;
    description: string;
    createdAt: Date;
    createdBy?: string;
    updatedAt: Date;
    updatedBy?: string;
    status: boolean;
}
