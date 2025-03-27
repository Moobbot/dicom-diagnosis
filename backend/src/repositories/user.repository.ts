import { Document, FilterQuery, Query, Types } from "mongoose";

import { BaseRepository } from "./base.repository";

import { UserModel } from "../models/user.model";

import { IUser } from "../interfaces/user.interface";
import { IRole } from "../interfaces/role.interface";
import { IPermission } from "../interfaces/permission.interface";

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(UserModel);
    }

    override findAll(
        filter?: FilterQuery<IUser>,
        sort?: Record<string, 1 | -1>,
        page?: number,
        limit?: number
    ) {
        return super.findAll(filter, sort, page, limit).populate({
            path: "roles",
            select: "id name grant_all permissions",
            populate: {
                path: "permissions",
                select: "id name",
            },
        });
    }

    findUserWithPasswordById(id: string) {
        return UserModel.findById(id).select("+password");
    }

    private findExtendedUser(
        filter: FilterQuery<IUser>,
        includePassword: boolean,
        activeOnly: boolean
    ) {
        const match = activeOnly ? { status: true } : {};
        const options = includePassword ? { select: "+password" } : {};
        return UserModel.findOne(
            filter,
            {},
            options
        ).populate<{
            roles: {
                _id: Types.ObjectId;
                name: string;
                status: boolean;
                grant_all: boolean;
                permissions: {
                    _id: Types.ObjectId;
                    name: string;
                    status: boolean;
                }[];
            }[];
        }>({
            path: "roles",
            match,
            select: "id name status grant_all permissions",
            populate: {
                path: "permissions",
                match,
                select: "id name status",
            },
        });
    }

    findExtendedUserById(
        id: string,
        includePassword: boolean = false,
        activeOnly: boolean = false
    ) {
        return this.findExtendedUser({ _id: id }, includePassword, activeOnly);
    }

    findExtendedUserByUsername(
        username: string,
        includePassword: boolean = false,
        activeOnly: boolean = false
    ) {
        return this.findExtendedUser({ username }, includePassword, activeOnly);
    }

    findUserByUsername(username: string) {
        return UserModel.findOne({ username });
    }

    findUserByRefreshToken(refreshToken: string) {
        return UserModel.findOne({ refresh_token: refreshToken, status: true });
    }

    updateUserRefreshToken(id: string, refreshToken: string | null) {
        return UserModel.findByIdAndUpdate(
            id,
            { refresh_token: refreshToken },
            { timestamps: false }
        );
    }
}
