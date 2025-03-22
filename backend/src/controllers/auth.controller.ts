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
            data: userData,
            message: "Logged in successfully",
            accessToken,
            refreshToken,
        });
    };

    logout = async (req: Request, res: Response) => {
        const accessToken = extractTokenFromHeader(req);
        const { refreshToken } = req.body;

        const userId = req.userData.userId;

        if (refreshToken) {
            await this.authService.logout(
                userId,
                accessToken as string,
                refreshToken as string
            );
        }

        res.status(205).json();
    };

    changePassword = async (req: Request, res: Response) => {
        ChangeOldPasswordSchema.parse(req.body);
        const { oldPassword, newPassword } = req.body;
        const userId = req.userData.userId;

        await this.authService.changePassword(userId, oldPassword, newPassword);

        res.status(200).json({
            message: "Password changed successfully",
        });
    };

    me = async (req: Request, res: Response) => {
        res.status(200).json({
            data: {
                userId: req.userData.userId,
                username: req.userData.username,
                detail_user: req.userData.detail_user,
                grant_all: req.userData.grant_all,
                roles: req.userData.roles,
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
            message: "Password is correct",
        });
    };

    changeAvatar = async (req: Request, res: Response) => {
        // Kiểm tra MIME type
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!req.file || !allowedMimes.includes(req.file.mimetype)) {
            throw new BadRequestError(`Invalid file type: ${req.file?.mimetype || ''}. Only png, jpg, jpeg files are allowed!`);
        }

        const avatar = `data:${req.file.mimetype
            };base64,${req.file.buffer.toString("base64")}`;

        const userId = req.userData.userId;

        await this.authService.changeAvatar(userId, avatar);

        res.status(200).json({
            message: "Avatar updated successfully",
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
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
        });
    };

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.userData.userId;
        const updateData = req.body;

        const updatedUser = await this.authService.updateProfile(userId, updateData);

        res.status(200).json({
            status: 200,
            message: "Update profile successfully",
            data: updatedUser
        });
    };
}