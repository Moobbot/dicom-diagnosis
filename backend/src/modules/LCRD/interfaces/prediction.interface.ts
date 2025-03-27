import { AttentionInfo } from "./sybil.interface";

export interface IPrediction {
    session_id: string;
    predictions: number[][];
    attention_info?: AttentionInfo;
}
