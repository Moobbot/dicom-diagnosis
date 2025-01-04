import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import BadRequestError from "../errors/bad-request.error";
import NotFoundError from "../errors/not-found.error";

import { RoleService } from "../services/role.service";
import { UserService } from "../services/user.service";

import {
    ChangeManyUserStatusSchema,
    ChangeUserStatusSchema,
    CreateUserSchema,
    UpdateUserSchema,
} from "../validation/user.validation";
import ConflictError from "../errors/conflict.error";

export class UserController {
    private readonly userService: UserService;
    private readonly roleService: RoleService;

    constructor() {
        this.userService = new UserService();
        this.roleService = new RoleService();
    }

    createUser = async (req: Request, res: Response) => {
        const validatedData = CreateUserSchema.parse(req.body);
        const userId = req.userData?.userId;

        const newUser = await this.userService.createUser(
            userId,
            validatedData
        );

        res.status(201).json({
            message: "User created successfully",
            success: true,
            data: newUser,
        });
    };

    getUserById = async (req: Request, res: Response) => {
        const { id } = req.params;

        const user = await this.userService.getUserById(id);

        res.status(200).json({
            data: user,
            success: true,
        });
    };

    listAllUsers = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { total, users } = await this.userService.listAllUsers(
            page,
            limit
        );

        res.status(200).json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: users,
            success: true,
        });
    };

    updateUser = async (req: Request, res: Response) => {
        const validatedData = UpdateUserSchema.parse(req.body);

        const { id } = req.params;
        const userId = req.userData?.userId;

        const updatedUser = await this.userService.updateUser(
            userId,
            id,
            validatedData
        );

        res.status(200).json({
            message: "User updated successfully",
            success: true,
            data: updatedUser,
        });
    };

    changeUserStatus = async (req: Request, res: Response) => {
        const validatedData = ChangeUserStatusSchema.parse(req.body);

        const { id } = req.params;

        const { status } = validatedData;

        const userId = req.userData?.userId;

        const updatedUser = await this.userService.changeUserStatus(
            userId,
            id,
            status
        );

        res.status(200).json({
            message: `User ${
                status ? "activated" : "deactivated"
            } successfully`,
            success: true,
            data: updatedUser,
        });
    };

    changeManyUserStatus = async (req: Request, res: Response) => {
        const validatedData = ChangeManyUserStatusSchema.parse(req.body);

        const { userIds, status } = validatedData;

        const userId = req.userData?.userId;

        const updatedUsers = await this.userService.changeManyUserStatus(
            userId,
            userIds,
            status
        );

        res.status(200).json({
            message: `Users ${
                status ? "activated" : "deactivated"
            } successfully`,
            success: true,
            data: updatedUsers,
        });
    };
}
