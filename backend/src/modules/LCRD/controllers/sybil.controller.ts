import fs from "fs";
import path from "path";

import { Request, Response } from "express";

import { validateEnv } from "../../../config/env.config";

import BadRequestError from "../../../errors/bad-request.error";
import BadGatewayError from "../../../errors/bad-gateway.error";

import { SybilService } from "../services/sybil.service";
import { fillTemplate } from "../../../utils/fillTemplate";

export class SybilController {
    private readonly sybilService: SybilService;

    public constructor() {
        this.sybilService = new SybilService();
    }

    downloadFile =
        (isUpload: boolean) => async (req: Request, res: Response) => {
            const encodedFilePath = req.params[0];
            const filePath = decodeURIComponent(encodedFilePath);

            if (!filePath) {
                throw new BadRequestError("File path is missing");
            }

            const { fullPath } = await this.sybilService.getFullPath(
                filePath,
                isUpload
            );

            res.download(fullPath, path.basename(fullPath));
        };

    previewFile =
        (isUpload: boolean) => async (req: Request, res: Response) => {
            const encodedFilePath = req.params[0];
            const filePath = decodeURIComponent(encodedFilePath);

            if (!filePath) {
                throw new BadRequestError("File path is missing");
            }

            const { basePath, fullPath } = await this.sybilService.getFullPath(
                filePath,
                isUpload
            );

            res.sendFile(filePath, { root: basePath });
        };

    predictSybil = async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError("Only .zip files are allowed");
        }

        const folderUUID = (req as any).uploadFolder as string;
        const zipFilePath = path.join(req.file.destination, req.file.filename);

        const result = await this.sybilService.predictSybil(
            folderUUID,
            zipFilePath
        );
        console.log(result);
        res.status(200).json({
            message: "Prediction completed",
            session_id: folderUUID,
            ...result,
        });
    };

    generateReport = async (req: Request, res: Response): Promise<void> => {
        const {
            patient_id,
            name,
            age,
            sex,
            address,
            diagnosis,
            general_conclusion,
            session_id,
            file_name,
            forecast,
        } = req.body;

        if (!session_id) {
            throw new BadRequestError("Missing session_id");
        }

        console.log("Start creating report...");
        try {
            // Create report directory if it doesn't exist
            const reportFolder = path.join(validateEnv().linkSaveReport, session_id);
            if (!fs.existsSync(reportFolder)) fs.mkdirSync(reportFolder, { recursive: true });

            // Get DICOM file paths
            const dicomPaths = file_name.map((file: string) =>
                path.join(validateEnv().linkSaveDicomResults, session_id, file)
            );

            // Check if all DICOM files exist
            dicomPaths.forEach((filePath: string) => {
                if (!fs.existsSync(filePath)) {
                    throw new BadRequestError(
                        `DICOM file not found: ${path.basename(filePath)}`
                    );
                }
            });

            // Read DICOM file
            console.log("Reading DICOM file...");

            // Run fillTemplate function
            const dataForm = {
                patient_id: patient_id,
                name: name,
                age: age,
                sex: sex,
                address: address,
                diagnosis: diagnosis,
                general_conclusion: general_conclusion,
                session_id: session_id,
                file_name: file_name,
                forecast: forecast,
            };

            const link_report = await fillTemplate({ dicomPaths, dataForm });
            if (!link_report) {
                throw new BadGatewayError("Failed to generate report - Python service error");
            }

            // Check if the report file exists
            if (!fs.existsSync(link_report)) {
                throw new BadGatewayError("Report file was not created successfully");
            }

            // Check the file size
            const stats = fs.statSync(link_report);
            if (stats.size === 0) {
                throw new BadGatewayError("Generated report is empty");
            }

            // Send DOCX file to FE to download immediately
            res.download(link_report, "Patient_Report.docx", (err) => {
                if (err) {
                    console.error("❌ Error when sending file:", err);
                    res.status(500).json({
                        status: 500,
                        message: "Failed to send report",
                        error: err.message
                    });
                } else {
                    // Delete the temporary file after successful sending
                    try {
                        fs.unlinkSync(link_report);
                        console.log("✅ Temporary report file deleted successfully");
                    } catch (unlinkErr) {
                        console.error("❌ Error deleting temporary report file:", unlinkErr);
                    }
                }
            });
        } catch (error: any) {
            console.error("❌ Error when creating report:", error);

            // Handle specific error types
            if (error.message?.includes("Incomplete IF/END-IF statement")) {
                res.status(400).json({
                    status: 400,
                    message: "Template error: Missing END-IF statement in Word template",
                    error: "Template Syntax Error"
                });
            } else if (error.code === 'ECONNREFUSED') {
                res.status(503).json({
                    status: 503,
                    message: "Python service is not available. Please try again later.",
                    error: "Service Unavailable"
                });
            } else if (error instanceof BadRequestError) {
                res.status(400).json({
                    status: 400,
                    message: error.message
                });
            } else if (error instanceof BadGatewayError) {
                res.status(502).json({
                    status: 502,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    error: error.message
                });
            }
        }
    }
}
