import { Schema, model } from "mongoose";
import { IPrediction } from "../interfaces/prediction.interface";

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
    },
    { timestamps: true }
);

export const PredictionModel = model<IPrediction>(
    "Prediction",
    predictionSchema
);
