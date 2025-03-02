import multer from "multer";
import path from "path";
import { validateEnv } from "../../../config/env.config";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Middleware lưu UUID vào request để dùng cho tất cả file trong một lần upload
export const generateUploadFolder = (req: any, res: any, next: any) => {
    req.uploadFolder = uuidv4(); // Tạo UUID một lần cho tất cả file trong lần upload này
    next();
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const savePath = validateEnv().linkSaveDicomUploads;
        const uploadFolder = path.join(savePath, (req as any).uploadFolder);
        fs.mkdirSync(uploadFolder, { recursive: true }); // Tạo thư mục
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

export const zipUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".zip"];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true); // Chấp nhận file ZIP
        } else {
            cb(null, false); // Từ chối file không phải ZIP
        }
    },
});
