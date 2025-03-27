import { Types } from "mongoose";

export interface IRole {
    name: string;
    grant_all: boolean;
    permissions: Types.ObjectId[];
    description?: string;
    created_at: Date;
    created_by?: Types.ObjectId;
    updated_at: Date;
    updated_by?: Types.ObjectId;
    status: boolean;
}
