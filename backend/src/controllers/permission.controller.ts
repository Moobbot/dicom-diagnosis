import { Request, Response } from "express";

import { PermissionService } from "../services/permission.service";

import {
    ChangePermissionStatusSchema,
    CreatePermissionSchema,
    UpdatePermissionSchema,
} from "../validation/permission.validation";
import { FindQuerySchema } from "../validation/find-query.validation";
import { idSchema } from "../validation/objectid.validation";

export class PermissionController {
    private readonly permissionService: PermissionService;

    constructor() {
        this.permissionService = new PermissionService();
    }

    createPermission = async (req: Request, res: Response) => {
        const validatedData = CreatePermissionSchema.parse(req.body);
        const userId = req.userData.userId;

        const permission = await this.permissionService.createPermission(
            userId,
            validatedData,
        );

        res.status(201).json({
            message: "Permission created successfully",
            success: true,
            data: permission,
        });
    };

    updatePermission = async (req: Request, res: Response) => {
        const { id } = idSchema.parse(req.params)

        UpdatePermissionSchema.parse(req.body);

        const { description } = req.body;
        const userId = req.userData.userId;

        const updatedPermission = await this.permissionService.updatePermission(
            userId,
            id,
            description
        );

        res.status(200).json({
            message: "Permission updated successfully",
            success: true,
            data: updatedPermission,
        });
    };

    listAllPermissions = async (req: Request, res: Response) => {
        const validatedQuery = FindQuerySchema.parse(req.query);

        const { total, permissions } = await this.permissionService.listAllPermissions(validatedQuery);

        const { page, limit } = validatedQuery;

        res.status(200).json({
            page,
            limit,
            total,
            pages: limit ? Math.ceil(total / limit) : undefined,
            data: permissions,
            success: true,
        });
    };

    getPermissionById = async (req: Request, res: Response) => {
        const { id } = idSchema.parse(req.params)

        const permission = await this.permissionService.getPermissionById(id);

        res.status(200).json({
            data: permission,
            success: true,
        });
    };

    changePermissionStatus = async (req: Request, res: Response) => {
        ChangePermissionStatusSchema.parse(req.body);

        const { id } = idSchema.parse(req.params)

        const { status } = req.body;

        const userId = req.userData.userId;

        const updatedPermission =
            await this.permissionService.changePermissionStatus(
                userId,
                id,
                status
            );

        res.status(200).json({
            message: `Permission ${status ? "activated" : "deactivated"
                } successfully`,
            success: true,
            data: updatedPermission,
        });
    };
}
