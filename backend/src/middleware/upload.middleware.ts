import multer from "multer";

const storage: multer.StorageEngine = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2, // 2MB
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});
