import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

import { Request, Response } from "express";

import { validateEnv } from "../../../config/env.config";

import BadRequestError from "../../../errors/bad-request.error";
import BadGatewayError from "../../../errors/bad-gateway.error";
import HttpException from "../../../errors/http-exception.error";

import { ISybilPredictionResponse } from "../interfaces/sybil.interface";

class SybilController {
    private readonly baseUrl: string;
    private readonly savePath: string;

    public constructor() {
        this.baseUrl = validateEnv().sybilModelBaseUrl;
        this.savePath = validateEnv().linkSaveDicomResults;
    }

    downloadFile = async (req: Request, res: Response) => {
        const encodedFilePath = req.params[0];
        const filePath = decodeURIComponent(encodedFilePath);

        if (!filePath) {
            throw new BadRequestError("File path is missing");
        }

        const fullPath = path.join(this.savePath, filePath);

        if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
            throw new BadRequestError("File not found");
        }

        res.download(fullPath, path.basename(fullPath));
    };

    previewFile = async (req: Request, res: Response) => {
        const encodedFilePath = req.params[0];
        const filePath = decodeURIComponent(encodedFilePath);

        if (!filePath) {
            throw new BadRequestError("File path is missing");
        }

        const fullPath = path.join(this.savePath, filePath);

        if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
            throw new BadRequestError("File not found");
        }

        res.sendFile(filePath, { root: this.savePath });
    };

    predictSybil = async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new BadRequestError("Only .dcm files are allowed");
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append("file", file.buffer, file.originalname);
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
                    return `${sessionId}/${overlay_image.filename}`;
                }
            );

            // Tải và lưu GIF
            const gifResponse = await fetch(data.gif_download);
            const gifBuffer = await gifResponse.buffer();
            const gifFilePath = path.join(sessionPath, "animation.gif");
            fs.writeFileSync(gifFilePath, gifBuffer);

            // Đợi tất cả các file được tải xong
            const savedImagePaths = await Promise.all(downloadPromises);

            // Xóa các file tạm trong thư mục uploads
            // (req.files as Express.Multer.File[]).forEach((file) => {
            //     fs.unlinkSync(file.path);
            // });

            const overlayImages = savedImagePaths
                .filter((path) => path.endsWith(".dcm"))
                .map((path) => ({
                    download_link: `download/${path}`,
                    filename: path.split("/").pop(),
                    preview_link: `preview/${path}`,
                }));

            // Trả về kết quả cho frontend
            res.status(200).json({
                message: "Prediction successful.",
                predictions: data.predictions,
                session_id: sessionId,
                overlay_images: overlayImages,
                gif: {
                    download_link: `download/${sessionId}/animation.gif`,
                    preview_link: `preview/${sessionId}/animation.gif`,
                },
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadGatewayError("Sybil model is not available");
        }
    };
}

export default new SybilController();
