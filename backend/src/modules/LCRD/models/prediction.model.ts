import { Schema, model } from "mongoose";
import { IPrediction } from "../interfaces/prediction.interface";
import { AttentionInfo } from "../interfaces/sybil.interface";

const attentionInfoSchema = new Schema<AttentionInfo>(
    {
        attention_scores: [
            {
                file_name_pred: { type: String, required: true },
                attention_score: { type: Number, required: true },
            },
        ],
        returned_images: { type: Number },
        top_k_requested: { type: Number },
        total_images: { type: Number },
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
