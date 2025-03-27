import { Types } from "mongoose";

export interface IPermission {
    name: string;
    description: string;
    created_at: Date;
    created_by?: Types.ObjectId;
    updated_at: Date;
    updated_by?: Types.ObjectId;
    status: boolean;
}
