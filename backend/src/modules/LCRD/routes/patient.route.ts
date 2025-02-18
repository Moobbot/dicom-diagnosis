import { Router } from "express";
import asyncHandler from "express-async-handler";
import patientController from "../controllers/patient.controller";

const patientRouter: Router = Router();

patientRouter.post("/", asyncHandler(patientController.createPatient));

export default patientRouter;
