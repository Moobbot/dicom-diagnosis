import { Router } from "express";
import { PermissionController } from "../controllers/permission.controller";
import asyncHandler from "express-async-handler";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import authMiddleware from "../middleware/auth.middleware";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

class PermissionRouter {
    private readonly permissionController: PermissionController;
    public router: Router;

    constructor() {
        this.permissionController = new PermissionController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/:id",
            [
                authMiddleware,
                permissionMiddleware([Permissions.GET_PERMISSION]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.permissionController.getPermissionById)
        );

        this.router.get(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.LIST_ALL_PERMISSIONS]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.permissionController.listAllPermissions)
        );

        this.router.post(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.ADD_PERMISSION]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.permissionController.createPermission)
        );

        this.router.put(
            "/:id",
            [
                authMiddleware,
                permissionMiddleware([Permissions.EDIT_PERMISSION]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.permissionController.updatePermission)
        );

        this.router.put(
            "/:id/change-status",
            [
                authMiddleware,
                permissionMiddleware([Permissions.CHANGE_STATUS_PERMISSION]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.permissionController.changePermissionStatus)
        );
    }
}

export default new PermissionRouter().router;
