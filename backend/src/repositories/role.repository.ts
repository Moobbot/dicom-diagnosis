import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { IRole } from "../interfaces/role.interface";
import { RoleModel } from "../models/role.model";
import { count } from "console";
import { BaseRepository } from "./base.repository";

export class RoleRepository extends BaseRepository<IRole> {
    constructor() {
        super(RoleModel);
    }

    findRoleByName(name: string) {
        return RoleModel.findOne({ name });
    }
}
