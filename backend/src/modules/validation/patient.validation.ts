import { z } from "zod";

// Schema cho Patient
export const CreatePatientSchema = z.object({
    patient_id: z.string().min(1, "Patient ID is required"),
    name: z.string().min(1, "Name is required"),
    age: z.string().min(1, "Age is required"),
    sex: z.string().min(1, "Sex is required"),
    address: z.string().min(1, "Address is required"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    general_conclusion: z.string().optional(),
    session_id: z.string().min(1, "Session ID is required"),
});
