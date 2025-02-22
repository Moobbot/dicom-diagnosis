import { Request, Response } from "express";
import BadRequestError from "../errors/bad-request.error";
import NotFoundError from "../errors/not-found.error";
import { RoleRepository } from "../repositories/role.repository";
import { PermissionRepository } from "../repositories/permission.repository";
import {
    ChangeRoleStatusSchema,
    CreateRoleSchema,
    UpdateRoleSchema,
} from "../validation/role.validation";
import ConflictError from "../errors/conflict.error";
import { IRole } from "../interfaces/role.interface";
import { z } from "zod";
import { FindQuerySchema } from "../validation/find-query.validation";
import { buildSearchFilter, buildSortQuery } from "../utils/util";

export class RoleService {
    private readonly roleRepository: RoleRepository;
    private readonly permissionRepository: PermissionRepository;

    constructor() {
        this.roleRepository = new RoleRepository();
        this.permissionRepository = new PermissionRepository();
    }

    createRole = async (
        userId: any,
        data: z.infer<typeof CreateRoleSchema>
    ) => {
        const { name, grantAll, description } = data;

        const existingRole = await this.roleRepository.findRoleByName(name);

        if (existingRole) {
            throw new ConflictError("Role already exists");
        }

        return await this.roleRepository.create({
            ...data,
            createdBy: userId,
        });
    };

    listAllRoles = async (query: z.infer<typeof FindQuerySchema>) => {
        const { search, sort, page, limit } = query;
        const filter = buildSearchFilter(
            search,
        );

        const sortOptions = buildSortQuery(sort);
        const total = await this.roleRepository.count(filter);

        const roles = await this.roleRepository.findAll(
            filter,
            sortOptions,
            page,
            limit
        );

        return { total, roles };
    };

    getRoleById = async (id: string) => {
        return await this.roleRepository.findById(id);
    };

    updateRole = async (
        userId: any,
        id: string,
        data: z.infer<typeof UpdateRoleSchema>
    ) => {
        if (data.permissions) {
            const permissions = await this.permissionRepository.findByIds(
                data.permissions
            );
            if (permissions.length !== data.permissions.length) {
                throw new BadRequestError("Some permissions are invalid");
            }
        }

        const updatedRole = await this.roleRepository.updateById(id, {
            ...data,
            updatedBy: userId,
        });

        if (!updatedRole) {
            throw new NotFoundError("Role not found");
        }

        return updatedRole;
    };

    changeRoleStatus = async (userId: any, id: string, status: boolean) => {
        const updatedRole = await this.roleRepository.updateById(id, {
            status: status,
            updatedBy: userId,
        });

        if (!updatedRole) {
            throw new NotFoundError("Role not found");
        }

        return updatedRole;
    };
}
