import { Schema, model } from "mongoose";
import { IAccessHistory } from "../interfaces/access-history.interface";

const AccessHistorySchema: Schema = new Schema<IAccessHistory>(
    {
        username: { type: String },
        actionName: { type: String },
        functionName: { type: String, default: null },
        api: { type: String },
        ip: { type: String },
        deviceName: { type: String },
        deviceModel: { type: String },
        deviceType: { type: String },
        osName: { type: String },
        osVer: { type: String },
        osType: { type: String },
        browserName: { type: String },
        browserVer: { type: String },
        browserType: { type: String },
        miscellaneous: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
);

export const AccessHistoryModel = model<IAccessHistory>(
    "AccessHistory",
    AccessHistorySchema
);
