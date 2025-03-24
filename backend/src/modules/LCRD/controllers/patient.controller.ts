import { Request, Response } from "express";
import { PatientService } from "../services/patient.service";
import { CreatePatientSchema, UpdatePatientSchema } from "../../validation/patient.validation";
import { FindQuerySchema } from "../../../validation/find-query.validation";
import { idSchema } from "../../../validation/objectid.validation";

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
            status: 201,
            message: "Save Patient success",
            data: patient,
        });
    };

    updatePatient = async (req: Request, res: Response) => {
        const { id } = idSchema.parse(req.params);
        const validatedData = UpdatePatientSchema.parse(req.body);
        const userId = req.userData.userId;
        const patient = await this.patientService.updatePatient(id, validatedData, userId);

        res.status(200).json({
            status: 200,
            message: "Update Patient success",
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
            status: 200,
            page,
            limit,
            total,
            pages: limit ? Math.ceil(total / limit) : undefined,
            data: patients,
        });
    };

    deletePatientById = async (req: Request, res: Response) => {
        const { id } = idSchema.parse(req.params);

        await this.patientService.deletePatientById(id);

        res.status(200).json({
            status: 200,
            message: "Delete Patient success",
        });
    };

}

export default new PatientController();
