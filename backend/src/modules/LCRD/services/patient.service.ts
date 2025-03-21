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
import { FindQuerySchema } from "../../../validation/find-query.validation";
import { Types } from "mongoose";
import { buildSearchFilter, buildSortQuery } from "../../../utils/util";
import { UpdatePatientSchema } from "../../validation/patient.validation";

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

    createPatient = async (
        userId: string,
        data: z.infer<typeof CreatePatientSchema>
    ) => {
        const folder = await this.folderRepository.updateFolderByUUID(
            data.session_id,
            {
                isSaved: true,
            }
        );

        if (!folder) {
            throw new NotFoundError("Folder not found");
        }

        const existingPatient =
            await this.patientRepository.findPatientByFolderId(
                folder._id.toString()
            );

        if (existingPatient) {
            throw new BadRequestError("Patient already exists");
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
            createdBy: new Types.ObjectId(userId),
        });
    };

    listAllPatients = async (query: z.infer<typeof FindQuerySchema>) => {
        const { search, sort, page, limit } = query;

        const filter = buildSearchFilter(search, ["patient_id", "name"]);

        const sortOptions = buildSortQuery(sort);

        const total = await this.patientRepository.count(filter);

        const patients = await this.patientRepository.findExtendedPatients(
            filter,
            sortOptions,
            page,
            limit
        );

        const enrichedPatients = await Promise.all(
            patients.map(async (patient) => {
                const folderUUID = patient.folder.folderUUID;
                const uploadPath = path.join(this.uploadPath, folderUUID);
                const savePath = path.join(this.savePath, folderUUID);

                let uploadFiles: string[] = [];
                let saveFiles: string[] = [];

                try {
                    if (fs.existsSync(uploadPath)) {
                        uploadFiles = fs.readdirSync(uploadPath);
                    }
                    if (fs.existsSync(savePath)) {
                        saveFiles = fs.readdirSync(savePath);
                    }
                } catch (error) {
                    console.error(`Error reading directories for patient ${patient._id}:`, error);
                }

                const overlayImages = saveFiles.filter((file) =>
                    file.endsWith(".dcm")
                );
                const gif =
                    saveFiles.find((file) => file.endsWith(".gif")) || null;

                const patientInfo = (({ folder, prediction, ...rest }) => rest)(
                    patient.toObject()
                );

                return {
                    _id: patient._id,
                    patient_info: patientInfo,
                    session_id: folderUUID,
                    predictions: patient.prediction.predictions,
                    upload_images: uploadFiles,
                    overlay_images: overlayImages,
                    gif,
                };
            })
        );

        return { total, patients: enrichedPatients };
    };

    deletePatientById = async (patientId: string) => {
        const patient = await this.patientRepository.findExtendedPatientById(
            patientId
        );

        if (!patient) {
            throw new NotFoundError("Patient not found");
        }

        const folderUUID = patient.folder.folderUUID;
        const uploadPath = path.join(this.uploadPath, folderUUID);
        const savePath = path.join(this.savePath, folderUUID);

        fs.rmSync(uploadPath, {
            recursive: true,
            force: true,
        });

        fs.rmSync(savePath, {
            recursive: true,
            force: true,
        });

        await this.folderRepository.deleteById(patient.folder._id.toString());

        await this.predictionRepository.deleteById(
            patient.prediction._id.toString()
        );

        await this.patientRepository.deleteById(patientId);
    };

    updatePatient = async (patientId: string, data: z.infer<typeof UpdatePatientSchema>, userId: string) => {
        const patient = await this.patientRepository.findExtendedPatientById(patientId);

        if (!patient) {
            throw new NotFoundError("Patient not found");
        }

        // Cập nhật thông tin bệnh nhân
        const updatedPatient = await this.patientRepository.updateById(patientId, {
            patient_id: data.patient_id,
            name: data.name,
            age: data.age,
            sex: data.sex,
            address: data.address,
            diagnosis: data.diagnosis,
            general_conclusion: data.general_conclusion,
            updatedAt: new Date(),
            updatedBy: new Types.ObjectId(userId)
        });

        return updatedPatient;
    };
}

export default new PatientService();
