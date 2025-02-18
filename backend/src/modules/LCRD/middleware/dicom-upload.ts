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

// const storage = multer.memoryStorage();

export const dicomUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận file với định dạng .dcm hoặc .png
        const allowedMimeTypes = ["application/octet-stream", "image/png"];
        const allowedExtensions = [".dcm", ".png"]; // Để kiểm tra cả phần mở rộng

        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (
            allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(fileExtension)
        ) {
            cb(null, true); // Chấp nhận file
        } else {
            cb(null, false); // Từ chối file
        }
    },
});
