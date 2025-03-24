import { Types } from "mongoose";

export interface AttentionScore {
    file_name_original: string;
    file_name_pred: string;
    rank: number;
    attention_score: number;
}

export interface AttentionInfo {
    attention_scores: AttentionScore[];
}

export interface IPatient {
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address?: string | null;
    diagnosis?: string | null;
    general_conclusion?: string | null;
    attentent?: string | null;
    attention_info?: AttentionInfo;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    folder: Types.ObjectId;
    prediction: Types.ObjectId;
}
