import { z } from "zod";

// Schema cho Patient
export const CreatePatientSchema = z.object({
    patient_id: z.string().min(1, "Patient ID is required"),
    name: z.string().min(1, "Name is required"),
    age: z.string().min(1, "Age is required"),
    sex: z.string().min(1, "Sex is required"),
    address: z.string().nullable(),
    diagnosis: z.string().nullable(),
    general_conclusion: z.string().nullable(),
    attentent: z.string().nullable(),
    session_id: z.string().min(1, "Session ID is required"),
});

// Schema cho việc cập nhật thông tin bệnh nhân
export const UpdatePatientSchema = z.object({
    patient_id: z.string().min(1, "Patient ID is required"),
    name: z.string().min(1, "Name is required"),
    age: z.string().min(1, "Age is required"),
    sex: z.string().min(1, "Sex is required"),
    address: z.string().nullable(),
    diagnosis: z.string().nullable(),
    general_conclusion: z.string().nullable(),
    attentent: z.string().nullable(),
});
