import { Router } from "express";
import asyncHandler from "express-async-handler";
import SybilController from "../controllers/sybil.controller";
import { dicomUpload, generateUploadFolder } from "../middleware/dicom-upload";

const sybilRouter: Router = Router();

sybilRouter.get(
    "/download/uploads/*",
    asyncHandler(SybilController.downloadFile(true))
);
sybilRouter.get(
    "/preview/uploads/*",
    asyncHandler(SybilController.previewFile(true))
);
sybilRouter.get(
    "/download/results/*",
    asyncHandler(SybilController.downloadFile(false))
);
sybilRouter.get(
    "/preview/results/*",
    asyncHandler(SybilController.previewFile(false))
);
sybilRouter.post(
    "/predict",
    [generateUploadFolder, dicomUpload.array("files")], // maxCount hiện là infinity
    asyncHandler(SybilController.predictSybil)
);
sybilRouter.post("/generate-report", asyncHandler(SybilController.generateReport));

export default sybilRouter;
