import { CreatePatientSchema } from "../../validation/patient.validation";
import { PatientRepository } from "../repositories/patient.repository";
import { z } from "zod";
import { FolderRepository } from "../repositories/folder.repository";
import BadRequestError from "../../../errors/bad-request.error";
import { validateEnv } from "../../../config/env.config";
import { FolderType } from "../enums/folder-type.enum";
import path from "path";
import fs from "fs";
import NotFoundError from "../../../errors/not-found.error";
import { PredictionRepository } from "../repositories/prediction.repository";

export class PatientService {
    private readonly patientRepository: PatientRepository;
    private readonly folderRepository: FolderRepository;
    private readonly predictionRepository: PredictionRepository;
    private readonly uploadPath: string;
    private readonly savePath: string;

    constructor() {
        this.patientRepository = new PatientRepository();
        this.folderRepository = new FolderRepository();
        this.predictionRepository = new PredictionRepository();
        this.uploadPath = validateEnv().linkSaveDicomUploads;
        this.savePath = validateEnv().linkSaveDicomResults;
    }

    createPatient = async (data: z.infer<typeof CreatePatientSchema>) => {
        const folder = await this.folderRepository.updateFolderByUUID(
            data.session_id,
            {
                isSaved: true,
            }
        );

        if (!folder) {
            throw new NotFoundError("Folder not found");
        }

        const prediction =
            await this.predictionRepository.getPredictionBySessionId(
                data.session_id
            );

        if (!prediction) {
            throw new NotFoundError("Prediction not found");
        }

        return await this.patientRepository.create({
            ...data,
            folder: folder._id,
            prediction: prediction._id,
        });
    };
}
