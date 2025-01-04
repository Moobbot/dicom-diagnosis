import { Router } from "express";
import asyncHandler from "express-async-handler";
import { AccessHistoryController } from "../controllers/access-history.controller";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

const accessHistoryRouter: Router = Router();
const accessHistoryController = new AccessHistoryController();

accessHistoryRouter.get(
    "/",
    [
        authMiddleware, accessHistoryMiddleware,
        permissionMiddleware([Permissions.LIST_ALL_ACCESS_HISTORY])],
    asyncHandler(accessHistoryController.listAllAccessHistory)
);

export default accessHistoryRouter;
