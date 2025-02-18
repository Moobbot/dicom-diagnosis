import mongoose from "mongoose";
import { IFolder } from "../interfaces/folder.interface";
import { FolderType } from "../enums/folder-type.enum";

const FolderSchema = new mongoose.Schema<IFolder>({
    folderUUID: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    isSaved: { type: Boolean, default: false },
});

export const FolderModel = mongoose.model("Folder", FolderSchema);
