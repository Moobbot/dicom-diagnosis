import fs from "fs";
import path from "path";

import { Request, Response } from "express";

import { validateEnv } from "../../../config/env.config";

import BadRequestError from "../../../errors/bad-request.error";
import BadGatewayError from "../../../errors/bad-gateway.error";
import HttpException from "../../../errors/http-exception.error";

import { ISybilPredictionResponse } from "../interfaces/sybil.interface";
import { SybilService } from "../services/sybil.service";
import { fillTemplate } from "../../../utils/fillTemplate";

class SybilController {
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

        res.status(200).json({
            message: "Prediction completed",
            session_id: folderUUID,
            ...result,
        });
    };

    generateReport = async (req: Request, res: Response): Promise<void> => {
        const {
            patient_id,
            group,
            collectFees,
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

        if (!session_id || !file_name.length) {
            throw new BadRequestError("Missing session_id or file_name");
        }

        console.log("Bắt đầu tạo báo cáo...");

        // Tạo thư mục lưu report nếu chưa có
        const reportFolder = path.join(
            validateEnv().linkSaveReport,
            session_id
        );
        if (!fs.existsSync(reportFolder))
            fs.mkdirSync(reportFolder, { recursive: true });

        // Lấy đường dẫn các file DICOM
        const dicomPaths = file_name.map((file: string) =>
            path.join(validateEnv().linkSaveDicomResults, session_id, file)
        );

        // Kiểm tra xem tất cả các file DICOM có tồn tại không
        dicomPaths.forEach((filePath: string) => {
            if (!fs.existsSync(filePath)) {
                throw new BadRequestError(
                    `DICOM file not found: ${path.basename(filePath)}`
                );
            }
        });

        // Đọc file DICOM
        console.log("Đọc file DICOM...");
        // Chạy hàm fillTemplate
        const dataForm = {
            patient_id: patient_id,
            name: name,
            group: group,
            collectFees: collectFees,
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
        // Gửi file DOCX về FE để tải xuống ngay
        if (link_report) {
            res.download(link_report, "Patient_Report.docx", (err) => {
                if (err) {
                    console.error("❌ Lỗi khi gửi file:", err);
                    res.status(500).json({ error: "Failed to send report" });
                }
            });
        } else {
            res.status(500).json({ error: "Report generation failed" });
        }
    };
}

export default new SybilController();
