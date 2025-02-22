import { Router } from "express";
import asyncHandler from "express-async-handler";
import patientController from "../controllers/patient.controller";

const patientRouter: Router = Router();

patientRouter.get("/", asyncHandler(patientController.listAllPatients));
patientRouter.post("/", asyncHandler(patientController.createPatient));

export default patientRouter;
