import { Request, Response } from "express";
import { PatientService } from "../services/patient.service";
import { CreatePatientSchema } from "../../validation/patient.validation";
import { FindQuerySchema } from "../../../validation/find-query.validation";

class PatientController {
    private readonly patientService: PatientService;

    constructor() {
        this.patientService = new PatientService();
    }

    createPatient = async (req: Request, res: Response) => {
        const validatedData = CreatePatientSchema.parse(req.body);

        const userId = req.userData.userId;

        const patient = await this.patientService.createPatient(
            userId,
            validatedData
        );

        res.status(201).json({
            data: patient,
        });
    };

    listAllPatients = async (req: Request, res: Response) => {
        const validatedQuery = FindQuerySchema.parse(req.query);

        const { total, patients } = await this.patientService.listAllPatients(
            validatedQuery
        );

        const { page, limit } = validatedQuery;

        res.status(200).json({
            page,
            limit,
            total,
            pages: limit ? Math.ceil(total / limit) : undefined,
            data: patients,
            success: true,
        });
    };
}

export default new PatientController();
