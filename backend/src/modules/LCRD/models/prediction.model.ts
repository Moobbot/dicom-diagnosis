import { Schema, model } from "mongoose";
import { IPrediction } from "../interfaces/prediction.interface";
import { AttentionInfo } from "../interfaces/patient.interface";

const attentionInfoSchema = new Schema<AttentionInfo>(
    {
        attention_scores: [
            {
                file_name_original: { type: String, required: true },
                file_name_pred: { type: String, required: true },
                rank: { type: Number, required: true },
                attention_score: { type: Number, required: true },
            },
        ],
    },
    { _id: false }
);

const predictionSchema = new Schema<IPrediction>(
    {
        session_id: {
            type: String,
            required: [true, "Session ID is required"],
            unique: true,
        },
        predictions: {
            type: [[Number]],
            required: [true, "Predictions is required"],
        },
        attention_info: attentionInfoSchema,
    },
    { timestamps: true }
);

export const PredictionModel = model<IPrediction>(
    "Prediction",
    predictionSchema
);
