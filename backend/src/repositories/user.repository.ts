import { Document, FilterQuery, Query, Types } from "mongoose";
import { IUser } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";
import { BaseRepository } from "./base.repository";
import { populate } from "dotenv";
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
            populate: {
                path: "permissions",
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
        return UserModel.findOne(filter, {}, options).populate<{
            roles: (Omit<IRole, "permissions"> & {
                permissions: IPermission[];
            })[];
        }>({
            path: "roles",
            match,
            populate: {
                path: "permissions",
                match,
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
        return UserModel.findOne({ refreshToken, status: true });
    }

    updateUserRefreshToken(id: string, refreshToken: string) {
        return UserModel.findByIdAndUpdate(
            id,
            { refreshToken },
            { timestamps: false }
        );
    }
}
