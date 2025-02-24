import { Types } from "mongoose";
import { IRole } from "./role.interface";

export interface IDetailUser {
    user_code: string;
    name: string;
    avatar?: string;
    birth_date: Date;
    address: string;
    gender: number;
}

export interface IUser {
    username: string;
    password: string;
    name: string;
    roles: Types.ObjectId[];
    createdAt: Date;
    createdBy?: string;
    updatedAt: Date;
    updatedBy?: string;
    status: boolean;
    refreshToken?: string;
    detail_user: IDetailUser;
}
