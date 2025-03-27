import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import asyncHandler from "express-async-handler";
import authMiddleware from "../middleware/auth.middleware";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

class UserRouter {
    private readonly userController: UserController;
    public router: Router;

    constructor() {
        this.userController = new UserController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/:id",
            [
                authMiddleware,
                permissionMiddleware([Permissions.GET_USER]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.userController.getUserById)
        );

        this.router.get(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.LIST_ALL_USERS]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.userController.listAllUsers)
        );

        this.router.post(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.ADD_USER]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.userController.createUser)
        );

        this.router.put(
            "/change-many-status",
            [
                authMiddleware,
                permissionMiddleware([Permissions.CHANGE_STATUS_USER]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.userController.changeManyUserStatus)
        );

        this.router.put(
            "/:id",
            [
                authMiddleware,
                permissionMiddleware([Permissions.EDIT_USER]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.userController.updateUser)
        );

        this.router.put(
            "/:id/change-status",
            [
                authMiddleware,
                permissionMiddleware([Permissions.CHANGE_STATUS_USER]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.userController.changeUserStatus)
        );
    }
}

export default new UserRouter().router;
