import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { validateEnv } from "../config/env.config";

import UnAuthenticatedError from "../errors/unauthenticated.error";
import ForbiddenError from "../errors/forbidden.error";
import NotFoundError from "../errors/not-found.error";

import { IUser } from "../interfaces/user.interface";
import { IRole } from "../interfaces/role.interface";
import { IPermission } from "../interfaces/permission.interface";

import { PermissionService } from "../services/permission.service";
import { UserRepository } from "../repositories/user.repository";

import { extractTokenFromHeader } from "../utils/util";
import { UserDataType } from "../types/express";
import { isTokenBlocked } from "../utils/token-cache";

const userRepository = new UserRepository();

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const jwtconfig = validateEnv()?.jwtconfig;
    const token = extractTokenFromHeader(req);
    if (!token) {
        return next(
            new UnAuthenticatedError(
                "Something went wrong when extracting tokens. Did you forget Bearer?"
            )
        );
    }
    
    const tokenBlocked = await isTokenBlocked(token as string);
    if (tokenBlocked) {
        return next(new ForbiddenError("Token expires"));
    }

    try {
        const payload = jwt.verify(
            token as string,
            jwtconfig?.accessSecret as string
        ) as any;

        const user = await userRepository.findExtendedUserById(payload.userId);

        if (!user) {
            return next(new UnAuthenticatedError("User not found"));
        }

        req.userData = {
            userId: payload?.userId,
            username: user.username,
            detail_user: user.detail_user,
        };

        const hasGrantAll = user?.roles.some(role => role.grantAll);
        if (hasGrantAll) {
            req.userData.grantAll = true;
        } else {
            req.userData.permissions = new Set(
                user?.roles.flatMap((role) =>
                    role.permissions.map((permission) => permission.name)
                )
            );
        }

        next();
    } catch (err) {
        next(
            new UnAuthenticatedError(
                "Something went wrong when verifying token"
            )
        );
    }
};