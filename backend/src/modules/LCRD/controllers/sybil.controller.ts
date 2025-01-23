import { Request, Response } from "express";
import { validateEnv } from "../../../config/env.config";
import BadRequestError from "../../../errors/bad-request.error";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import { ISybilPredictionResponse } from "../interfaces/sybil.interface";
import BadGatewayError from "../../../errors/bad-gateway.error";
import HttpException from "../../../errors/http-exception.error";
import { log } from "console";

class SybilController {
    private readonly baseUrl: string;

    public constructor() {
        this.baseUrl = validateEnv().sybilModelBaseUrl;
    }

    getResult = async (req: Request, res: Response) => {
        const sessionId = req.params.sessionId;
        const sessionPath = path.join("./src/modules/LCRD/tmp/results", sessionId);
        const imagesPath = path.join(sessionPath, "images");
        const gifPath = path.join(sessionPath, "gif");

        const images = fs.readdirSync(imagesPath).map((file) => `results/${sessionId}/images/${file}`);
        const gif = `results/${sessionId}/gif/animation.gif`;

        res.status(200).json({ images, gif });
    }

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
            const sessionPath = path.join(
                "./src/modules/LCRD/tmp/results",
                sessionId
            );

            const imagesPath = path.join(sessionPath, "images");
            const gifPath = path.join(sessionPath, "gif");

            fs.mkdirSync(sessionPath, { recursive: true });
            fs.mkdirSync(imagesPath);
            fs.mkdirSync(gifPath);

            // Tải và lưu các ảnh
            const downloadPromises = data.overlay_images.map(
                async (overlay_image, index) => {
                    const response = await fetch(overlay_image.download_link);
                    const buffer = await response.buffer();
                    const imagePath = path.join(
                        imagesPath,
                        `${overlay_image.filename}`
                    );
                    fs.writeFileSync(imagePath, buffer);
                    return `results/${sessionId}/images/${overlay_image.filename}`;
                }
            );

            // Tải và lưu GIF
            const gifResponse = await fetch(data.gif_download);
            const gifBuffer = await gifResponse.buffer();
            const gifFilePath = path.join(gifPath, "animation.gif");
            fs.writeFileSync(gifFilePath, gifBuffer);

            // Đợi tất cả các file được tải xong
            const savedImagePaths = await Promise.all(downloadPromises);

            // Xóa các file tạm trong thư mục uploads
            // (req.files as Express.Multer.File[]).forEach((file) => {
            //     fs.unlinkSync(file.path);
            // });

            // Trả về kết quả cho frontend
            res.status(200).json({
                message: "Prediction successful.",
                predictions: data.predictions,
                session_id: sessionId,
                overlay_images: {
                    download_links: savedImagePaths,
                    gif_download: `results/${sessionId}/gif/animation.gif`,
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
