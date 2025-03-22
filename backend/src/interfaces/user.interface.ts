import { Types } from "mongoose";

export interface IDetailUser {
    user_code: string;
    name: string;
    avatar?: string;
    dob: Date;
    address: string;
    gender: number;
}

export interface IUser {
    username: string;
    password: string;
    name: string;
    roles: Types.ObjectId[];
    createdAt: Date;
    created_by?: string;
    updated_at: Date;
    updated_by?: string;
    status: boolean;
    refreshToken?: string;
    detail_user: IDetailUser;
}
