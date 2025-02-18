import { Request, Response } from "express";
import { PatientService } from "../services/patient.service";
import { CreatePatientSchema } from "../../validation/patient.validation";

class PatientController {
    private readonly patientService: PatientService;

    constructor() {
        this.patientService = new PatientService();
    }

    createPatient = async (req: Request, res: Response) => {
        const validatedData = CreatePatientSchema.parse(req.body);

        const patient = await this.patientService.createPatient(validatedData);

        res.status(201).json({
            data: patient,
        });
    };
}

export default new PatientController();
