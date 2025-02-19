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
import { SybilService } from "../services/sybil.service";

class SybilController {
    private readonly sybilService: SybilService;

    public constructor() {
        this.sybilService = new SybilService();
    }

    downloadFile = async (req: Request, res: Response) => {
        const encodedFilePath = req.params[0];
        const filePath = decodeURIComponent(encodedFilePath);

        if (!filePath) {
            throw new BadRequestError("File path is missing");
        }

        const savePath = validateEnv().linkSaveDicomResults;
        const fullPath = path.join(savePath, filePath);

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

        const savePath = validateEnv().linkSaveDicomResults;
        const fullPath = path.join(savePath, filePath);

        if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
            throw new BadRequestError("File not found");
        }

        res.sendFile(filePath, { root: savePath });
    };

    predictSybil = async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new BadRequestError("Only .dcm files are allowed");
        }

        const folderUUID = (req as any).uploadFolder as string;

        const result = await this.sybilService.predictSybil(folderUUID, files);

        res.status(200).json({
            message: "Prediction completed",
            session_id: folderUUID,
            ...result,
        });
    };
}

export default new SybilController();
