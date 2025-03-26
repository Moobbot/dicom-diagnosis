import { Router } from "express";
import asyncHandler from "express-async-handler";
import { AuthController } from "../controllers/auth.controller";
import { upload } from "../middleware/upload.middleware";
import authMiddleware from "../middleware/auth.middleware";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

class AuthRouter {
    private readonly authController: AuthController;
    public router: Router;

    constructor() {
        this.authController = new AuthController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/me",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.authController.me)
        );
        this.router.post(
            "/login",
            [accessHistoryMiddleware],
            asyncHandler(this.authController.login)
        );

        this.router.post(
            "/refresh-token",
            asyncHandler(this.authController.refreshToken)
        );
        this.router.post(
            "/logout",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.authController.logout)
        );
        this.router.post(
            "/check-password",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.authController.checkPassword)
        );
        this.router.put(
            "/change-password",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.authController.changePassword)
        );
        this.router.put(
            "/change-avatar",
            [authMiddleware, accessHistoryMiddleware],
            upload.single("avatar"),
            asyncHandler(this.authController.changeAvatar)
        );
        this.router.put(
            "/update-profile",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.authController.updateProfile)
        );
    }
}

export default new AuthRouter().router;
