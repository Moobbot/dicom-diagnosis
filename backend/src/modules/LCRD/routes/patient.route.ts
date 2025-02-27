import { Router } from "express";
import asyncHandler from "express-async-handler";
import patientController from "../controllers/patient.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import accessHistoryMiddleware from "../../../middleware/access_log.middleware";

const patientRouter: Router = Router();

patientRouter.get(
    "/",
    [authMiddleware, accessHistoryMiddleware],
    asyncHandler(patientController.listAllPatients)
);
patientRouter.post(
    "/",
    [authMiddleware, accessHistoryMiddleware],
    asyncHandler(patientController.createPatient)
);

export default patientRouter;
