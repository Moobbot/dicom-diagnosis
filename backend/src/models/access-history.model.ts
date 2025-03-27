import { Schema, model } from "mongoose";
import {
    IAccessHistory,
    IMiscellany,
} from "../interfaces/access-history.interface";

const MiscellanySchema: Schema = new Schema<IMiscellany>(
    {
        status: { type: Number, required: true },
        request_body: { type: Schema.Types.Mixed },
        message: { type: String },
    },
    { _id: false }
);

const AccessHistorySchema: Schema = new Schema<IAccessHistory>(
    {
        username: { type: String, required: true },
        api: { type: String, required: true },
        http_method: {
            type: String,
            enum: ["GET", "POST", "PUT", "DELETE"],
            required: true,
        },
        function_name: { type: String },
        ip_address: { type: String, required: true },
        device_name: { type: String },
        device_model: { type: String },
        device_type: { type: String },
        os_name: { type: String },
        os_ver: { type: String },
        os_type: { type: String },
        browser_name: { type: String },
        browser_ver: { type: String },
        browser_type: { type: String },
        miscellany: MiscellanySchema,
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

export const AccessHistoryModel = model<IAccessHistory>(
    "AccessHistory",
    AccessHistorySchema
);
