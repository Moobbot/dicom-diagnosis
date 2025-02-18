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

export class PatientService {
    private readonly patientRepository: PatientRepository;
    private readonly folderRepository: FolderRepository;
    private readonly uploadPath: string;
    private readonly savePath: string;

    constructor() {
        this.patientRepository = new PatientRepository();
        this.folderRepository = new FolderRepository();
        this.uploadPath = validateEnv().linkSaveDicomUploads;
        this.savePath = validateEnv().linkSaveDicomResults;
    }

    createPatient = async (data: z.infer<typeof CreatePatientSchema>) => {
        const uploadFolder =
            await this.folderRepository.updateFolderByNameAndType(
                { folderName: data.uploaded, folderType: FolderType.UPLOAD },
                { status: true }
            );

        if (!uploadFolder) {
            throw new BadRequestError("Upload id not found");
        }

        const resultFolder =
            await this.folderRepository.updateFolderByNameAndType(
                { folderName: data.result, folderType: FolderType.RESULT },
                { status: true }
            );

        if (!resultFolder) {
            throw new BadRequestError("Result id not found");
        }

        return await this.patientRepository.create({
            ...data,
            uploaded: uploadFolder._id,
            result: resultFolder._id,
        });
    };
}
