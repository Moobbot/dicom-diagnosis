import { Router } from "express";
import asyncHandler from "express-async-handler";
import SybilController from "../controllers/sybil.controller";
import { dicomUpload, generateUploadFolder } from "../middleware/dicom-upload";

const sybilRouter: Router = Router();

sybilRouter.get("/download/*", asyncHandler(SybilController.downloadFileDicomResults));
sybilRouter.get("/preview/*", asyncHandler(SybilController.previewFile));
sybilRouter.post(
    "/predict",
    [generateUploadFolder, dicomUpload.array("files")], // maxCount hiện là infinity
    asyncHandler(SybilController.predictSybil)
);
sybilRouter.post("/generate-report", asyncHandler(SybilController.generateReport));

export default sybilRouter;
