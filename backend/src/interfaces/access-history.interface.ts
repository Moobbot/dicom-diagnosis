import { ObjectId } from "mongoose";

export interface IMiscellaneous {}

export interface IAccessHistory {
    username?: string;
    actionName?: string;
    functionName?: string;
    api?: string;
    ip?: string;
    deviceName?: string;
    deviceModel?: string;
    deviceType?: string;
    osName?: string;
    osVer?: string;
    osType?: string;
    browserName?: string;
    browserVer?: string;
    browserType?: string;
    miscellaneous?: any;
    createdAt?: Date;
    updatedAt?: Date;
}
