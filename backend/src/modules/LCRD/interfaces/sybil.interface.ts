// Interface chính cho phản hồi từ API Sybil
export interface AttentionScore {
    file_name_pred: string;
    attention_score: number;
}

export interface AttentionInfo {
    attention_scores: AttentionScore[];
    returned_images?: number;
    top_k_requested?: number;
    total_images?: number;
}

export interface ISybilPredictionResponse {
    session_id: string; // ID của phiên dự đoán
    message: string; // Thông báo kết quả
    overlay_images: string; // Link tải file zip kết quả
    predictions: number[][]; // Danh sách dự đoán cho mỗi ảnh
    attention_info: AttentionInfo; // Thông tin attention scores
}
