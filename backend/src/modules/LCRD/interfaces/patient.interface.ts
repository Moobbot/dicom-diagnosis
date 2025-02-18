import { Types } from "mongoose";

export interface IPatient {
    patient_id: string;
    name: string;
    group: string;
    collectFees: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    uploaded: Types.ObjectId;
    result: Types.ObjectId;
}
