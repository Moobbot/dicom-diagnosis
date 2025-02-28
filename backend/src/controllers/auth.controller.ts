import { Request, Response } from "express";

import { validateEnv } from "../config/env.config";
import ForbiddenError from "../errors/forbidden.error";
import BadRequestError from "../errors/bad-request.error";
import { extractTokenFromHeader } from "../utils/util";
import {
    ChangeOldPasswordSchema,
    LoginUserSchema,
} from "../validation/auth.validation";
import { AuthService } from "../services/auth.service";

export class AuthController {
    private readonly authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = async (req: Request, res: Response) => {
        LoginUserSchema.parse(req.body);

        const { username, password } = req.body;

        const { userData, accessToken, refreshToken } =
            await this.authService.login(username, password);

        res.status(200).json({
            success: true,
            data: userData,
            message: "Logged in successfully",
            accessToken,
            refreshToken,
        });
    };

    logout = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        const userId = req.userData.userId;

        if (refreshToken) {
            await this.authService.logout(userId, refreshToken as string);
        }

        // ✅ Xóa cookie refreshToken chính xác với các options
        res.status(205).json();
    };

    changePassword = async (req: Request, res: Response) => {
        ChangeOldPasswordSchema.parse(req.body);
        const { oldPassword, newPassword } = req.body;
        const userId = req.userData.userId;

        await this.authService.changePassword(userId, oldPassword, newPassword);

        res.status(200).json({
            message: "Password changed successfully",
            success: true,
        });
    };

    me = async (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            data: {
                userId: req.userData.userId,
                username: req.userData.username,
                detail_user: req.userData.detail_user,
                grantAll: req.userData.grantAll,
                permissions: req.userData.permissions
                    ? Array.from(req.userData.permissions)
                    : undefined,
            },
        });
    };

    checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body;
        const userId = req.userData.userId;

        await this.authService.checkPassword(userId, password);

        res.status(200).json({
            success: true,
            message: "Password is correct",
        });
    };

    changeAvatar = async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError("Only png, jpg, jpeg files are allowed");
        }

        const avatar = `data:${
            req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;

        const userId = req.userData.userId;

        await this.authService.changeAvatar(userId, avatar);

        res.status(200).json({
            message: "Avatar updated successfully",
            success: true,
        });
    };

    refreshToken = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ForbiddenError("Refresh token is required");
        }

        const { accessToken, newRefreshToken } =
            await this.authService.refreshToken(refreshToken as string);

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
        });
    };
}
