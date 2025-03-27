import { z } from "zod";

import NotFoundError from "../errors/not-found.error";
import ConflictError from "../errors/conflict.error";

import { PermissionRepository } from "../repositories/permission.repository";

import { buildSearchFilter, buildSortQuery } from "../utils/util";

import {
    ChangePermissionStatusSchema,
    CreatePermissionSchema,
    UpdatePermissionSchema,
} from "../validation/permission.validation";
import { FindQuerySchema } from "../validation/find-query.validation";

export class PermissionService {
    private readonly permissionRepository: PermissionRepository;

    constructor() {
        this.permissionRepository = new PermissionRepository();
    }

    createPermission = async (
        userId: any,
        data: z.infer<typeof CreatePermissionSchema>
    ) => {
        const { name, description } = data;

        const existingPermission =
            await this.permissionRepository.findPermissionByName(name);

        if (existingPermission) {
            throw new ConflictError("Permission already exists");
        }

        const permission = await this.permissionRepository.create({
            ...data,
            created_by: userId,
        });

        return permission;
    };

    updatePermission = async (userId: any, id: string, description: string) => {
        const updatedPermission = await this.permissionRepository.updateById(
            id,
            {
                description,
                updated_by: userId,
            }
        );

        if (!updatedPermission) {
            throw new NotFoundError("Permission not found");
        }

        return updatedPermission;
    };

    listAllPermissions = async (query: z.infer<typeof FindQuerySchema>) => {
        const { search, sort, page, limit } = query;
        const filter = buildSearchFilter(
            search,
        );

        const sortOptions = buildSortQuery(sort);

        const total = await this.permissionRepository.count(filter);

        const permissions = await this.permissionRepository.findAll(
            filter,
            sortOptions,
            page,
            limit
        );

        return { total, permissions };
    };

    getPermissionById = async (id: string) => {
        const permission = await this.permissionRepository.findById(id);
        if (!permission) {
            throw new NotFoundError("Permission not found");
        }
        return permission;
    };

    changePermissionStatus = async (
        userId: any,
        id: string,
        status: boolean
    ) => {
        const updatedPermission = await this.permissionRepository.updateById(
            id,
            {
                status,
                updated_by: userId,
            }
        );
        if (!updatedPermission) {
            throw new NotFoundError("Permission not found");
        }
        return updatedPermission;
    };
}
