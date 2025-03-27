import { Schema, model } from "mongoose";
import { IPatient } from "../interfaces/patient.interface";

const attentionScoreSchema = new Schema({
    file_name_pred: { type: String, required: true },
    rank: { type: Number, required: true },
    attention_score: { type: Number, required: true }
}, { _id: false });

const attentionInfoSchema = new Schema({
    attention_scores: [attentionScoreSchema]
}, { _id: false });

const patientSchema = new Schema<IPatient>(
    {
        patient_id: {
            type: String,
            required: [true, "Patient ID is required"],
        },
        name: { type: String, required: [true, "Name is required"] },
        age: { type: String, required: [true, "Age is required"] },
        sex: { type: String, required: [true, "Sex is required"] },
        address: { type: String },
        diagnosis: { type: String },
        general_conclusion: { type: String },
        attention_info: attentionInfoSchema,
        createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        folder: { type: Schema.Types.ObjectId, ref: "Folder" },
        prediction: { type: Schema.Types.ObjectId, ref: "Prediction" },
    },
    { timestamps: true }
);

export const PatientModel = model<IPatient>("Patient", patientSchema);
