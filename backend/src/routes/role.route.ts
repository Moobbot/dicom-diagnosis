import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import asyncHandler from "express-async-handler";
import { authMiddleware } from "../middleware/auth.middleware";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

const roleRouter: Router = Router();
const roleController = new RoleController();

roleRouter.get(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.LIST_ALL_ROLES]),
    ],
    asyncHandler(roleController.listAllRoles)
);

roleRouter.get(
    "/:id",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.GET_ROLE]),
    ],
    asyncHandler(roleController.getRoleById)
);

roleRouter.post(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.ADD_ROLE]),
    ],
    asyncHandler(roleController.createRole)
);

roleRouter.put(
    "/:id",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.EDIT_ROLE]),
    ],
    asyncHandler(roleController.updateRole)
);

roleRouter.put(
    "/:id/change-status",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.CHANGE_STATUS_ROLE]),
    ],
    asyncHandler(roleController.changeRoleStatus)
);

export default roleRouter;
