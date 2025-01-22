import multer from "multer";
import path from "path";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./src/modules/LCRD/tmp/dicom_files");
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + "-" + uniqueSuffix);
//     },
// });

const storage = multer.memoryStorage();

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
