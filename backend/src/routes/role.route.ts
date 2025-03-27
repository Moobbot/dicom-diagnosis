import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import asyncHandler from "express-async-handler";
import authMiddleware from "../middleware/auth.middleware";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

class RoleRouter {
    private readonly roleController: RoleController;
    public router: Router;

    constructor() {
        this.roleController = new RoleController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.LIST_ALL_ROLES]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.roleController.listAllRoles)
        );

        this.router.get(
            "/:id",
            [
                authMiddleware,
                permissionMiddleware([Permissions.GET_ROLE]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.roleController.getRoleById)
        );

        this.router.post(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.ADD_ROLE]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.roleController.createRole)
        );

        this.router.put(
            "/:id",
            [
                authMiddleware,
                permissionMiddleware([Permissions.EDIT_ROLE]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.roleController.updateRole)
        );

        this.router.put(
            "/:id/change-status",
            [
                authMiddleware,
                permissionMiddleware([Permissions.CHANGE_STATUS_ROLE]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.roleController.changeRoleStatus)
        );
    }
}

export default new RoleRouter().router;
