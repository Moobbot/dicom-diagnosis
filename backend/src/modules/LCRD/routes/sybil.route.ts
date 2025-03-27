import { Router } from "express";
import asyncHandler from "express-async-handler";
import { SybilController } from "../controllers/sybil.controller";
import { dicomUpload, generateUploadFolder } from "../middleware/dicom-upload";
import { zipUpload } from "../middleware/zip-upload";

class SybilRouter {
    private readonly sybilController: SybilController;
    public router: Router;

    constructor() {
        this.sybilController = new SybilController();
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            "/download/uploads/*",
            asyncHandler(this.sybilController.downloadFile(true))
        );
        this.router.get(
            "/preview/uploads/*",
            asyncHandler(this.sybilController.previewFile(true))
        );
        this.router.get(
            "/download/results/*",
            asyncHandler(this.sybilController.downloadFile(false))
        );
        this.router.get(
            "/preview/results/*",
            asyncHandler(this.sybilController.previewFile(false))
        );
        this.router.post(
            "/predict",
            [generateUploadFolder, zipUpload.single("file")], // maxCount hiện là infinity
            asyncHandler(this.sybilController.predictSybil)
        );
        this.router.post(
            "/generate-report",
            asyncHandler(this.sybilController.generateReport)
        );
    }
}

export default new SybilRouter().router;
