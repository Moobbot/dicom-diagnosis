import { Types } from "mongoose";

export interface IPatient {
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address?: string | null;
    diagnosis?: string | null;
    general_conclusion?: string | null;
    createdAt: Date;
    updated_at: Date;
    created_by?: Types.ObjectId;
    updated_by?: Types.ObjectId;
    folder: Types.ObjectId;
    prediction: Types.ObjectId;
}
