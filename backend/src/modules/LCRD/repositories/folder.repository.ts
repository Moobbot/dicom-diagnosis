import { BaseRepository } from "../../../repositories/base.repository";
import { IFolder } from "../interfaces/folder.interface";
import { FolderModel } from "../models/folder.model";
import { validateEnv } from "../../../config/env.config";
import { UpdateQuery } from "mongoose";

export class FolderRepository extends BaseRepository<IFolder> {
    constructor() {
        super(FolderModel);
    }

    findExpiredFolders = () => {
        return FolderModel.find({
            isSaved: false,
            createdAt: {
                $lt: new Date(Date.now() - validateEnv().tempExpiration * 1000),
            },
        });
    };

    findFolderByUUID = (folderUUID: string) => {
        return FolderModel.findOne({ folderUUID });
    };

    updateFolderByUUID = (folderUUID: string, update: UpdateQuery<IFolder>) => {
        return FolderModel.findOneAndUpdate({ folderUUID }, update, {
            new: true,
        });
    };
}
