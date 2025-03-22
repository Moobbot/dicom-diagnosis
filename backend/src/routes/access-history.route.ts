import { Router } from "express";
import asyncHandler from "express-async-handler";
import { AccessHistoryController } from "../controllers/access-history.controller";
import { permissionMiddleware } from "../middleware/permission.middleware";
import { Permissions } from "../enums/permissions.enum";
import authMiddleware from "../middleware/auth.middleware";
import accessHistoryMiddleware from "../middleware/access_log.middleware";

class AccessHistoryRouter {
    private readonly accessHistoryController: AccessHistoryController;
    public router: Router;

    constructor() {
        this.accessHistoryController = new AccessHistoryController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/",
            [
                authMiddleware,
                permissionMiddleware([Permissions.LIST_ALL_ACCESS_HISTORY]),
                accessHistoryMiddleware,
            ],
            asyncHandler(this.accessHistoryController.listAllAccessHistory)
        );
    }
}

export default new AccessHistoryRouter().router;
