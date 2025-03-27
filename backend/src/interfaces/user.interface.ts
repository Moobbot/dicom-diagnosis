import { Types } from "mongoose";

export interface IDetailUser {
    user_code: string;
    name: string;
    avatar?: string;
    dob?: Date;
    address?: string;
    gender: number;
}

export interface IUser {
    // _id: Types.ObjectId;
    username: string;
    password: string;
    name: string;
    roles: Types.ObjectId[];
    created_at: Date;
    created_by?: Types.ObjectId;
    updated_at: Date;
    updated_by?: Types.ObjectId;
    status: boolean;
    refresh_token: string | null;
    detail_user: IDetailUser;
}
