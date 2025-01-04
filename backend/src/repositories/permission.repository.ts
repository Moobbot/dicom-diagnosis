import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { IPermission } from "../interfaces/permission.interface";
import { PermissionModel } from "../models/permission.model";
import { BaseRepository } from "./base.repository";

export class PermissionRepository extends BaseRepository<IPermission> {
    constructor() {
        super(PermissionModel);
    }

    findPermissionByName(name: string) {
        return PermissionModel.findOne({ name });
    }
}
