import { Types } from "mongoose";

export interface IPatient {
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    folder: Types.ObjectId;
    prediction: Types.ObjectId;
}
