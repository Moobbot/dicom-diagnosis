import { validateEnv } from "../../../config/env.config";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch, { AbortError, FetchError } from "node-fetch";
import BadRequestError from "../../../errors/bad-request.error";
import { ISybilPredictionResponse } from "../interfaces/sybil.interface";
import BadGatewayError from "../../../errors/bad-gateway.error";
import HttpException from "../../../errors/http-exception.error";
import { FolderRepository } from "../repositories/folder.repository";
import { PredictionRepository } from "../repositories/prediction.repository";
import AdmZip from "adm-zip";

export class SybilService {
    private readonly baseUrl: string;
    private readonly uploadPath: string;
    private readonly savePath: string;
    private readonly folderRepository: FolderRepository;
    private readonly predictionRepository: PredictionRepository;

    constructor() {
        this.baseUrl = validateEnv().sybilModelBaseUrl;
        this.uploadPath = validateEnv().linkSaveDicomUploads;
        this.savePath = validateEnv().linkSaveDicomResults;
        fs.mkdirSync(this.uploadPath, { recursive: true });
        fs.mkdirSync(this.savePath, { recursive: true });
        this.folderRepository = new FolderRepository();
        this.predictionRepository = new PredictionRepository();
    }

    getFullPath = async (filePath: string, isUpload: boolean) => {
        let basePath;
        if (isUpload) {
            basePath = this.uploadPath;
        } else {
            basePath = this.savePath;
        }

        const fullPath = path.join(basePath, filePath);

        if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
            throw new BadRequestError("File not found");
        }

        return { basePath, fullPath };
    };

    private extractZip = (zipFilePath: string, extractPath: string) => {
        fs.mkdirSync(extractPath, { recursive: true });

        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractPath, true);

        fs.unlinkSync(zipFilePath);
    };

    predictSybil = async (folderUUID: string, zipFilePath: string) => {
        await this.folderRepository.create({
            folderUUID,
        });

        // Chuẩn bị gửi file ZIP
        const formData = new FormData();
        formData.append("file", fs.createReadStream(zipFilePath));

        try {
            console.log(`Attempting to connect to Sybil model at: ${this.baseUrl}/api_predict`);
            const response = await fetch(`${this.baseUrl}/api_predict`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                console.error(`Sybil model responded with status: ${response.status}`);
                const errorText = await response.text();
                console.error(`Error response: ${errorText}`);
                throw new BadRequestError("Sybil model failed to predict");
            }

            const data = (await response.json()) as ISybilPredictionResponse;

            // Giải nén file zip upload
            this.extractZip(
                zipFilePath,
                path.join(this.uploadPath, folderUUID)
            );

            await this.predictionRepository.create({
                session_id: folderUUID,
                predictions: data.predictions,
                attention_info: data.attention_info,
            });

            // Tải file zip
            const resultZipPath = path.join(
                this.savePath,
                `${data.session_id}.zip`
            );
            const zipResponse = await fetch(data.overlay_images);
            const zipBuffer = await zipResponse.buffer();
            fs.writeFileSync(resultZipPath, zipBuffer);

            // Giải nén file zip
            const sessionPath = path.join(this.savePath, folderUUID);
            this.extractZip(resultZipPath, sessionPath);

            // Lấy danh sách file kết quả
            const extractedFiles = fs.readdirSync(sessionPath);
            const dicomFiles = extractedFiles.filter((file) =>
                file.endsWith(".dcm")
            );
            const gifFile =
                extractedFiles.find((file) => file.endsWith(".gif")) || null;

            // Trả về kết quả cho frontend
            return {
                predictions: data.predictions,
                overlay_images: dicomFiles,
                gif: gifFile,
                attention_info: data.attention_info
            };
        } catch (error) {
            console.log(error);

            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof FetchError || error instanceof AbortError) {
                throw new BadGatewayError("Sybil model is not available");
            }
        }
    };
}
