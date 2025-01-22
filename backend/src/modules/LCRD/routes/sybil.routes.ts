import { Router } from "express";
import asyncHandler from "express-async-handler";
import SybilController from "../controllers/sybil.controller";
import { dicomUpload } from "../middleware/dicom-upload";

const sybilRouter: Router = Router();

sybilRouter.post(
    "/predict",
    dicomUpload.array("files"), // maxCount hiện là infinity
    asyncHandler(SybilController.predictSybil)
);

export default sybilRouter;