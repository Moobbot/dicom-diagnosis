import { Router } from "express";
import asyncHandler from "express-async-handler";

import authMiddleware from "../../../middleware/auth.middleware";
import accessHistoryMiddleware from "../../../middleware/access_log.middleware";
import { PatientController } from "../controllers/patient.controller";

class PatientRouter {
    private readonly patientController: PatientController;
    public router: Router;

    constructor() {
        this.patientController = new PatientController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.patientController.listAllPatients)
        );
        this.router.post(
            "/",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.patientController.createPatient)
        );
        this.router.put(
            "/:id",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.patientController.updatePatient)
        );
        this.router.delete(
            "/:id",
            [authMiddleware, accessHistoryMiddleware],
            asyncHandler(this.patientController.deletePatientById)
        );
    }
}

export default new PatientRouter().router;
