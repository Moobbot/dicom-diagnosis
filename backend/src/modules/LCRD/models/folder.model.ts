import mongoose from "mongoose";
import { IFolder } from "../interfaces/folder.interface";
import { FolderType } from "../enums/folder-type.enum";

const FolderSchema = new mongoose.Schema<IFolder>({
    folderName: { type: String, required: true },
    folderType: {
        type: Number,
        required: true,
        enums: Object.values(FolderType),
    },
    folderFiles: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    isSaved: { type: Boolean, default: false }, // Nếu người dùng chọn lưu, không xóa
    apiResponse: { type: mongoose.Schema.Types.Mixed },
    gifFile: { type: String },
});

export const FolderModel = mongoose.model(
    "Folder",
    FolderSchema
);
