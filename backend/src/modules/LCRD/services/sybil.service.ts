import { validateEnv } from "../../../config/env.config";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import BadRequestError from "../../../errors/bad-request.error";
import { ISybilPredictionResponse } from "../interfaces/sybil.interface";
import BadGatewayError from "../../../errors/bad-gateway.error";
import HttpException from "../../../errors/http-exception.error";
import { FolderRepository } from "../repositories/folder.repository";
import { FolderType } from "../enums/folder-type.enum";
import { PredictionRepository } from "../repositories/prediction.repository";

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

    predictSybil = async (folderUUID: string, files: Express.Multer.File[]) => {
        await this.folderRepository.create({
            folderUUID,
        });

        const formData = new FormData();
        for (const file of files) {
            const filePath = path.join(
                this.uploadPath,
                `${folderUUID}/${file.originalname}`
            );
            formData.append("file", fs.createReadStream(filePath));
        }

        try {
            const response = await fetch(`${this.baseUrl}/api_predict`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new BadRequestError("Sybil model failed to predict");
            }

            const data = (await response.json()) as ISybilPredictionResponse;

            await this.predictionRepository.create({
                session_id: folderUUID,
                predictions: data.predictions,
            });

            const sessionPath = path.join(this.savePath, folderUUID);

            fs.mkdirSync(sessionPath, { recursive: true });

            // Tải và lưu các ảnh
            const downloadPromises = data.overlay_images.map(
                async (overlay_image, index) => {
                    const response = await fetch(overlay_image.download_link);
                    const buffer = await response.buffer();
                    const imagePath = path.join(
                        sessionPath,
                        `${overlay_image.filename}`
                    );
                    fs.writeFileSync(imagePath, buffer);
                    return overlay_image.filename;
                }
            );

            // Tải và lưu GIF
            const gifResponse = await fetch(data.gif_download);
            const gifBuffer = await gifResponse.buffer();
            const gifFilePath = path.join(sessionPath, "animation.gif");
            fs.writeFileSync(gifFilePath, gifBuffer);

            // Đợi tất cả các file được tải xong
            const savedImagePaths = await Promise.all(downloadPromises);

            const overlayImages = savedImagePaths.filter((path) =>
                path.endsWith(".dcm")
            );

            // Xóa các file tạm trong thư mục uploads
            // (req.files as Express.Multer.File[]).forEach((file) => {
            //     fs.unlinkSync(file.path);
            // });

            // Trả về kết quả cho frontend
            return {
                predictions: data.predictions,
                overlay_images: overlayImages,
                gif: "animation.gif",
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadGatewayError("Sybil model is not available");
        }
    };
}
