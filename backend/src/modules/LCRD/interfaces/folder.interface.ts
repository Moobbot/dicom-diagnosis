export interface IFolder {
    folderName: string;
    folderType: number;
    folderFiles: string[];
    createdAt: Date;
    isSaved: boolean;
    apiResponse?: any;
    gifFile?: string;
}
