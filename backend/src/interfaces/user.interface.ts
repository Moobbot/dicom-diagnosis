import { Types } from "mongoose";
import { IRole } from "./role.interface";

export interface IDetailUser {
    user_code: string;
    name: string;
    avatar?: string;
    birth_date: Date;
    address: string;
    gender: string;
}

export interface IUser {
    // _id: Types.ObjectId;
    username: string;
    password: string;
    name: string;
    roles: IRole[];
    createdAt: Date;
    createdBy?: string;
    updatedAt: Date;
    updatedBy?: string;
    status: boolean;
    refreshToken?: string;
    detail_user: IDetailUser;
}
