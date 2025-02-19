import cron from "node-cron";
import fs from "fs";
import path from "path";
import { FolderRepository } from "../modules/LCRD/repositories/folder.repository";
import { validateEnv } from "../config/env.config";
import { FolderType } from "../modules/LCRD/enums/folder-type.enum";

class CronJobs {
    private readonly folderRepository: FolderRepository;
    private readonly uploadPath: string;
    private readonly savePath: string;
    private readonly deleteExpiredFolders: cron.ScheduledTask;

    constructor() {
        this.folderRepository = new FolderRepository();
        this.uploadPath = validateEnv().linkSaveDicomUploads;
        this.savePath = validateEnv().linkSaveDicomResults;
        this.deleteExpiredFolders = this.create();
    }

    private create = () => {
        return cron.schedule(
            "*/2 * * * *", // Every 2 minutes
            async () => {
                console.log(
                    "Running scheduled job to delete expired folders..."
                );

                const expiredFolders =
                    await this.folderRepository.findExpiredFolders();

                console.log(`Found ${expiredFolders.length} expired folders.`);

                for (const folder of expiredFolders) {
                    try {
                        const uploadPath = path.join(
                            this.uploadPath,
                            folder.folderUUID
                        );
                        const savePath = path.join(
                            this.savePath,
                            folder.folderUUID
                        );

                        if (fs.existsSync(uploadPath)) {
                            fs.rmSync(uploadPath, {
                                recursive: true,
                                force: true,
                            });
                            console.log(`Deleted folder: ${uploadPath}`);
                        }

                        if (fs.existsSync(savePath)) {
                            fs.rmSync(savePath, {
                                recursive: true,
                                force: true,
                            });
                            console.log(`Deleted folder: ${savePath}`);
                        }

                        await this.folderRepository.deleteById(
                            folder._id.toString()
                        );
                    } catch (err) {
                        console.error(
                            `Error deleting folder ${folder.folderUUID}:`,
                            err
                        );
                    }
                }
            },
            { scheduled: false }
        );
    };

    start = () => {
        this.deleteExpiredFolders.start();
    };

    stop = () => {
        this.deleteExpiredFolders.stop();
    };
}

export const deleteExpiredFolders = new CronJobs();
