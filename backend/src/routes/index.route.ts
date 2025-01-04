import { Router } from "express";
import { Request, Response } from "express";

import accessHistoryMiddleware from "../middleware/access_log.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { AuthController } from "../controllers/auth.controller";

import authRouter from "./auth.route";
import permissionRouter from "./permission.route";
import roleRouter from "./role.route";
import userRouter from "./user.route";
import accessHistoryRouter from "./access-history.route";
import asyncHandler from "express-async-handler";
// import { keyAuthMiddleware } from "../middleware/key-auth.middleware";

const rootRouter: Router = Router();

// Root route
rootRouter.get("/",
    [accessHistoryMiddleware],
    (req: Request, res: Response) => {
        res.json({
            message: "Hello World! This is the root route of the application.",
        });
    });


// Protected routes (require authentication)

rootRouter.use("/permissions", permissionRouter);
rootRouter.use("/roles", roleRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/access-history", accessHistoryRouter);

export default rootRouter;
