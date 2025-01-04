import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import asyncHandler from "express-async-handler";
import { authMiddleware } from "../middleware/auth.middleware";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

const userRouter: Router = Router();
const userController = new UserController();

userRouter.get(
    "/:id",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.GET_USER]),
    ],
    asyncHandler(userController.getUserById)
);

userRouter.get(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.LIST_ALL_USERS]),
    ],
    asyncHandler(userController.listAllUsers)
);

userRouter.post(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.ADD_USER]),
    ],
    asyncHandler(userController.createUser)
);

userRouter.put(
    "/change-many-status",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.CHANGE_STATUS_USER]),
    ],
    asyncHandler(userController.changeManyUserStatus)
);

userRouter.put(
    "/:id",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.EDIT_USER]),
    ],
    asyncHandler(userController.updateUser)
);

userRouter.put(
    "/:id/change-status",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.CHANGE_STATUS_USER]),
    ],
    asyncHandler(userController.changeUserStatus)
);

export default userRouter;
