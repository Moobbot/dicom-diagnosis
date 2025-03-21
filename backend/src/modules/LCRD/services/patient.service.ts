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
import { logError, logWarning, logInfo } from "../../../config/logger";

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

        try {
            const total = await this.patientRepository.count(filter);

            if (total === 0) {
                logInfo('No patients found with the given criteria', { filter, sort });
                return { total: 0, patients: [] };
            }

            const patients = await this.patientRepository.findExtendedPatients(
                filter,
                sortOptions,
                page,
                limit
            );

            if (!patients || patients.length === 0) {
                logInfo('No patients found in the specified page', { page, limit });
                return { total: 0, patients: [] };
            }

            const enrichedPatients = await Promise.all(
                patients.map(async (patient) => {
                    if (!patient || !patient.folder || !patient.folder.folderUUID) {
                        logWarning('Invalid patient record found', { patientId: patient?._id });
                        return null;
                    }

                    const folderUUID = patient.folder.folderUUID;
                    const uploadPath = path.join(this.uploadPath, folderUUID);
                    const savePath = path.join(this.savePath, folderUUID);

                    let uploadFiles: string[] = [];
                    let saveFiles: string[] = [];
                    let errors: { type: string; message: string; path?: string }[] = [];

                    try {
                        // Kiểm tra thư mục tồn tại
                        if (!fs.existsSync(uploadPath)) {
                            errors.push({
                                type: 'UPLOAD_FOLDER_MISSING',
                                message: 'Upload folder not found',
                                path: uploadPath
                            });
                            logWarning('Upload folder not found for patient', { 
                                patientId: patient._id,
                                folderUUID,
                                uploadPath 
                            });
                        } else {
                            uploadFiles = fs.readdirSync(uploadPath);
                            // Kiểm tra quyền đọc file
                            for (const file of uploadFiles) {
                                const filePath = path.join(uploadPath, file);
                                try {
                                    await fs.promises.access(filePath, fs.constants.R_OK);
                                } catch (error) {
                                    errors.push({
                                        type: 'UPLOAD_FILE_NOT_READABLE',
                                        message: `Cannot read upload file: ${file}`,
                                        path: filePath
                                    });
                                }
                            }
                        }

                        if (!fs.existsSync(savePath)) {
                            errors.push({
                                type: 'RESULTS_FOLDER_MISSING',
                                message: 'Results folder not found',
                                path: savePath
                            });
                            logWarning('Results folder not found for patient', { 
                                patientId: patient._id,
                                folderUUID,
                                savePath 
                            });
                        } else {
                            saveFiles = fs.readdirSync(savePath);
                            // Kiểm tra quyền đọc file kết quả
                            for (const file of saveFiles) {
                                const filePath = path.join(savePath, file);
                                try {
                                    await fs.promises.access(filePath, fs.constants.R_OK);
                                } catch (error) {
                                    errors.push({
                                        type: 'RESULT_FILE_NOT_READABLE',
                                        message: `Cannot read result file: ${file}`,
                                        path: filePath
                                    });
                                }
                            }
                        }

                        // Kiểm tra file trong thư mục
                        if (uploadFiles.length === 0) {
                            errors.push({
                                type: 'NO_UPLOAD_FILES',
                                message: 'No files found in upload folder'
                            });
                            logWarning('No files found in upload folder', { 
                                patientId: patient._id,
                                folderUUID,
                                uploadPath 
                            });
                        }

                        // Kiểm tra định dạng file
                        const invalidUploadFiles = uploadFiles.filter(file => !file.toLowerCase().endsWith('.dcm'));
                        if (invalidUploadFiles.length > 0) {
                            errors.push({
                                type: 'INVALID_FILE_FORMAT',
                                message: `Invalid file format found: ${invalidUploadFiles.join(', ')}`
                            });
                        }

                    } catch (error) {
                        errors.push({
                            type: 'FILE_SYSTEM_ERROR',
                            message: (error as Error).message || 'Error accessing files'
                        });
                        logError('Error reading folders for patient', error, {
                            patientId: patient._id,
                            folderUUID
                        });
                    }

                    const overlayImages = saveFiles.filter((file) =>
                        file.endsWith(".dcm")
                    );
                    const gif = saveFiles.find((file) => file.endsWith(".gif")) || null;

                    const patientInfo = (({ folder, prediction, ...rest }) => rest)(
                        patient.toObject()
                    );

                    return {
                        _id: patient._id,
                        patient_info: patientInfo,
                        session_id: folderUUID,
                        predictions: patient.prediction?.predictions || [],
                        upload_images: uploadFiles,
                        overlay_images: overlayImages,
                        gif,
                        errors: errors.length > 0 ? errors : undefined
                    };
                })
            );

            // Lọc bỏ các bản ghi null
            const validPatients = enrichedPatients.filter(Boolean);

            if (validPatients.length === 0) {
                logWarning('No valid patient records found after processing', { 
                    totalPatients: patients.length 
                });
            }

            return { 
                total: validPatients.length, 
                patients: validPatients 
            };
        } catch (error) {
            logError('Error in listAllPatients', error);
            throw error;
        }
    };

    deletePatientById = async (patientId: string) => {
        try {
            const patient = await this.patientRepository.findExtendedPatientById(
                patientId
            );

            if (!patient) {
                logWarning('Attempt to delete non-existent patient', { patientId });
                throw new NotFoundError("Patient not found");
            }

            const folderUUID = patient.folder.folderUUID;
            const uploadPath = path.join(this.uploadPath, folderUUID);
            const savePath = path.join(this.savePath, folderUUID);

            try {
                fs.rmSync(uploadPath, { recursive: true, force: true });
                logInfo('Upload folder deleted successfully', { 
                    patientId, 
                    folderUUID,
                    uploadPath 
                });
            } catch (error) {
                logError('Error deleting upload folder', error, {
                    patientId,
                    folderUUID,
                    uploadPath
                });
            }

            try {
                fs.rmSync(savePath, { recursive: true, force: true });
                logInfo('Results folder deleted successfully', { 
                    patientId, 
                    folderUUID,
                    savePath 
                });
            } catch (error) {
                logError('Error deleting results folder', error, {
                    patientId,
                    folderUUID,
                    savePath
                });
            }

            await this.folderRepository.deleteById(patient.folder._id.toString());
            await this.predictionRepository.deleteById(
                patient.prediction._id.toString()
            );
            await this.patientRepository.deleteById(patientId);

            logInfo('Patient deleted successfully', { patientId, folderUUID });
        } catch (error) {
            logError('Error in deletePatientById', error);
            throw error;
        }
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
