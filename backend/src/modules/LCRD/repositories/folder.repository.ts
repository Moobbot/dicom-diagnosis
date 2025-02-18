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

    findFolderByNameAndType = (folderName: string, folderType: number) => {
        return FolderModel.findOne({ folderName, folderType });
    };

    updateFolderByNameAndType = (
        query: { folderName: string; folderType: number },
        update: UpdateQuery<IFolder>
    ) => {
        return FolderModel.findOneAndUpdate(query, update, {
            new: true,
        });
    };
}
