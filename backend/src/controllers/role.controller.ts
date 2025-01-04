import { Request, Response } from "express";
import BadRequestError from "../errors/bad-request.error";
import NotFoundError from "../errors/not-found.error";
import { RoleService } from "../services/role.service";
import { PermissionService } from "../services/permission.service";
import {
    ChangeRoleStatusSchema,
    CreateRoleSchema,
    UpdateRoleSchema,
} from "../validation/role.validation";
import ConflictError from "../errors/conflict.error";

export class RoleController {
    private readonly roleService: RoleService;
    private readonly permissionService: PermissionService;

    constructor() {
        this.roleService = new RoleService();
        this.permissionService = new PermissionService();
    }

    createRole = async (req: Request, res: Response) => {
        CreateRoleSchema.parse(req.body);

        const { name, grantAll } = req.body;
        const userId = req.userData?.userId;

        const role = await this.roleService.createRole(userId, name, grantAll);
        
        res.status(201).json({
            message: "Role created successfully",
            success: true,
            data: role,
        });
    };

    listAllRoles = async (req: Request, res: Response) => {
        const roles = await this.roleService.listAllRoles();

        res.status(200).json({
            data: roles,
            success: true,
        });
    };

    getRoleById = async (req: Request, res: Response) => {
        const { id } = req.params;

        const role = await this.roleService.getRoleById(id);
        if (!role) {
            throw new NotFoundError("Role not found");
        }

        res.status(200).json({
            data: role,
            success: true,
        });
    };

    updateRole = async (req: Request, res: Response) => {
        const validatedData = UpdateRoleSchema.parse(req.body);

        const { id } = req.params;

        const userId = req.userData?.userId;

        const updatedRole = await this.roleService.updateRole(
            userId,
            id,
            validatedData
        );

        res.status(200).json({
            message: "Role updated successfully",
            success: true,
            data: updatedRole,
        });
    };

    changeRoleStatus = async (req: Request, res: Response) => {
        ChangeRoleStatusSchema.parse(req.body);

        const { id } = req.params;

        const { status } = req.body;

        const userId = req.userData?.userId;

        const updatedRole = await this.roleService.changeRoleStatus(
            userId,
            id,
            status
        );

        res.status(200).json({
            message: `Role ${
                status ? "activated" : "deactivated"
            } successfully`,
            success: true,
            data: updatedRole,
        });
    };
}
