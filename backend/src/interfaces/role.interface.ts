import { ObjectId } from "mongoose";
import { IPermission } from "./permission.interface";

export interface IRole {
    _id: ObjectId;
    name: string;
    grantAll: boolean;
    permissions: IPermission[];
    description?: string;
    createdAt: Date;
    createdBy?: string;
    updatedAt: Date;
    updatedBy?: string;
    status: boolean;
}
