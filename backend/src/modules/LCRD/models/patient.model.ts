import { Schema, model } from "mongoose";
import { IPatient } from "../interfaces/patient.interface";

const patientSchema = new Schema<IPatient>(
    {
        patient_id: {
            type: String,
            required: [true, "Patient ID is required"],
        },
        name: { type: String, required: [true, "Name is required"] },
        group: { type: String, required: [true, "Group is required"] },
        collectFees: {
            type: String,
            required: [true, "Collect fees is required"],
        },
        age: { type: String, required: [true, "Age is required"] },
        sex: { type: String, required: [true, "Sex is required"] },
        address: { type: String, required: [true, "Address is required"] },
        diagnosis: { type: String, required: [true, "Diagnosis is required"] },
        general_conclusion: {
            type: String,
            required: [true, "General conclusion is required"],
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        uploaded: { type: Schema.Types.ObjectId, ref: "Folder" },
        result: { type: Schema.Types.ObjectId, ref: "Folder" },
    },
    { timestamps: true }
);

export const PatientModel = model<IPatient>("Patient", patientSchema);
