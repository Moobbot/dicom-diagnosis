import { Router } from "express";
import { PermissionController } from "../controllers/permission.controller";
import asyncHandler from "express-async-handler";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

const permissionRouter: Router = Router();
const permissionController = new PermissionController();

permissionRouter.get(
    "/:id",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.GET_PERMISSION]),
    ],
    asyncHandler(permissionController.getPermissionById)
);

permissionRouter.get(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.LIST_ALL_PERMISSIONS]),
    ],
    asyncHandler(permissionController.listAllPermissions)
);

permissionRouter.post(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.ADD_PERMISSION]),
    ],
    asyncHandler(permissionController.createPermission)
);

permissionRouter.put(
    "/:id",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.EDIT_PERMISSION]),
    ],
    asyncHandler(permissionController.updatePermission)
);

permissionRouter.put(
    "/:id/change-status",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.CHANGE_STATUS_PERMISSION]),
    ],
    asyncHandler(permissionController.changePermissionStatus)
);

export default permissionRouter;
