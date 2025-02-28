import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { validateEnv } from "../config/env.config";
import ForbiddenError from "../errors/forbidden.error";
import NotFoundError from "../errors/not-found.error";
import BadRequestError from "../errors/bad-request.error";
import { IRole } from "../interfaces/role.interface";
import { UserRepository } from "../repositories/user.repository";
import { signJwt } from "../utils/jwt";
import { addTokenToBlockList } from "../utils/token-cache";
import { Types } from "mongoose";
import UnauthenticatedError from "../errors/unauthenticated.error";

export class AuthService {
    private readonly userRepository: UserRepository;
    private readonly accessSecret: string;
    private readonly accessExpiration: string;
    private readonly refreshAccessSecret: string;
    private readonly refreshAccessExpiration: string;

    constructor() {
        this.userRepository = new UserRepository();
        const envConfig = validateEnv()?.jwtconfig || {};
        this.accessSecret = envConfig.accessSecret;
        this.accessExpiration = envConfig.accessExpiration;
        this.refreshAccessSecret = envConfig.refreshAccessSecret;
        this.refreshAccessExpiration = envConfig.refreshAccessExpiration;
    }

    private generateTokens(userId: string | Types.ObjectId) {
        const accessToken = signJwt({ userId }, this.accessSecret, {
            expiresIn: this.accessExpiration,
        });

        const refreshToken = signJwt({ userId }, this.refreshAccessSecret, {
            expiresIn: this.refreshAccessExpiration,
        });

        return { accessToken, refreshToken };
    }

    refreshToken = async (refreshToken: string) => {
        try {
            jwt.verify(refreshToken, this.refreshAccessSecret);

            const user = await this.userRepository.findUserByRefreshToken(
                refreshToken
            );
            if (!user) {
                throw new ForbiddenError("Refresh token has been revoked");
            }

            const { accessToken, refreshToken: newRefreshToken } =
                this.generateTokens(user._id);
            await this.userRepository.updateUserRefreshToken(
                user._id.toString(),
                newRefreshToken
            );

            return { accessToken, newRefreshToken };
        } catch (error) {
            throw new UnauthenticatedError(
                "Something went wrong when verifying token"
            );
        }
    };

    login = async (username: string, password: string) => {
        const user = await this.userRepository.findExtendedUserByUsername(
            username,
            true,
            true
        );

        if (!user) {
            throw new ForbiddenError("User does not exist");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new ForbiddenError("Invalid credentials");
        }

        const { accessToken, refreshToken } = this.generateTokens(user._id);
        await this.userRepository.updateUserRefreshToken(
            user._id.toString(),
            refreshToken
        );

        return {
            userData: {
                _id: user._id,
                username: user.username,
                detail_user: user.detail_user,
                grantAll: user.roles.some((role) => role.grantAll),
                permissions: Array.from(
                    new Set(
                        user.roles.flatMap((role) =>
                            role.permissions.map((perm) => perm.name)
                        )
                    )
                ),
            },
            accessToken,
            refreshToken,
        };
    };

    logout = async (userId: string, refreshToken: string) => {
        try {
            const payload = jwt.verify(
                refreshToken,
                this.refreshAccessSecret
            ) as any;

            if (payload.userId !== userId) {
                throw new ForbiddenError("You are not authorized to do this");
            }

            await this.userRepository.updateUserRefreshToken(userId, "");
        } catch (error) {
            throw new UnauthenticatedError(
                "Something went wrong when verifying token"
            );
        }
    };

    changePassword = async (
        userId: any,
        oldPassword: string,
        newPassword: string
    ) => {
        const user = await this.userRepository.findUserWithPasswordById(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        const match = await bcrypt.compare(oldPassword, user.password);

        if (!match) {
            throw new BadRequestError("Incorrect password");
        }

        // Generate a new hashed password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        await this.userRepository.updateById(userId, {
            password: hashPassword,
            updatedBy: userId,
        });

        return true;
    };

    checkPassword = async (userId: any, password: string) => {
        const user = await this.userRepository.findUserWithPasswordById(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new BadRequestError("Incorrect password");
        }
    };

    changeAvatar = async (userId: any, avatar: string) => {
        await this.userRepository.updateById(userId, {
            detail_user: { avatar },
            updatedBy: userId,
        });
    };
}
