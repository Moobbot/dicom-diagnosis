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

export class SybilService {
    private readonly baseUrl: string;
    private readonly uploadPath: string;
    private readonly savePath: string;
    private readonly folderRepository: FolderRepository;

    constructor() {
        this.baseUrl = validateEnv().sybilModelBaseUrl;
        this.uploadPath = validateEnv().linkSaveDicomUploads;
        this.savePath = validateEnv().linkSaveDicomResults;
        this.folderRepository = new FolderRepository();
    }

    predictSybil = async (folderUUID: string, files: Express.Multer.File[]) => {
        await this.folderRepository.create({
            folderName: folderUUID,
            folderType: FolderType.UPLOAD,
            folderFiles: files.map((file) => file.originalname),
        });

        const uploadedFiles = files.map(
            (file) => `${folderUUID}/${file.originalname}`
        );

        const formData = new FormData();
        for (const file of uploadedFiles) {
            const filePath = path.join(this.uploadPath, file);
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

            const sessionId = data.session_id;
            const sessionPath = path.join(this.savePath, sessionId);

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

            await this.folderRepository.create({
                folderName: sessionId,
                folderType: FolderType.RESULT,
                folderFiles: overlayImages,
                gifFile: "animation.gif",
                apiResponse: data.predictions,
            });

            // Xóa các file tạm trong thư mục uploads
            // (req.files as Express.Multer.File[]).forEach((file) => {
            //     fs.unlinkSync(file.path);
            // });

            // Trả về kết quả cho frontend
            return {
                predictions: data.predictions,
                session_id: sessionId,
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
