import { Request, Response } from "express";
import NotFoundError from "../errors/not-found.error";
import { PermissionService } from "../services/permission.service";
import BadRequestError from "../errors/bad-request.error";
import {
    ChangePermissionStatusSchema,
    CreatePermissionSchema,
    UpdatePermissionSchema,
} from "../validation/permission.validation";
import ConflictError from "../errors/conflict.error";

export class PermissionController {
    private readonly permissionService: PermissionService;

    constructor() {
        this.permissionService = new PermissionService();
    }

    createPermission = async (req: Request, res: Response) => {
        CreatePermissionSchema.parse(req.body);

        const { name, description } = req.body;
        const userId = req.userData.userId;

        const permission = await this.permissionService.createPermission(
            userId,
            name,
            description
        );

        res.status(201).json({
            message: "Permission created successfully",
            success: true,
            data: permission,
        });
    };

    updatePermission = async (req: Request, res: Response) => {
        const { id } = req.params;

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
        const permissions = await this.permissionService.listAllPermissions();
        res.status(200).json({
            permissions,
            success: true,
        });
    };

    getPermissionById = async (req: Request, res: Response) => {
        const { id } = req.params;

        const permission = await this.permissionService.getPermissionById(id);

        res.status(200).json({
            data: permission,
            success: true,
        });
    };

    changePermissionStatus = async (req: Request, res: Response) => {
        ChangePermissionStatusSchema.parse(req.body);

        const { id } = req.params;

        const { status } = req.body;

        const userId = req.userData.userId;

        const updatedPermission =
            await this.permissionService.changePermissionStatus(
                userId,
                id,
                status
            );

        res.status(200).json({
            message: `Permission ${
                status ? "activated" : "deactivated"
            } successfully`,
            success: true,
            data: updatedPermission,
        });
    };
}
