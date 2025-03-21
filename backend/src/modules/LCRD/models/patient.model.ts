import { Schema, model } from "mongoose";
import { IPatient } from "../interfaces/patient.interface";

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
        createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        folder: { type: Schema.Types.ObjectId, ref: "Folder" },
        prediction: { type: Schema.Types.ObjectId, ref: "Prediction" },
    },
    { timestamps: true }
);

export const PatientModel = model<IPatient>("Patient", patientSchema);
