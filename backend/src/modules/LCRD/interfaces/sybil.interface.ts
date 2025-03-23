// Interface chính cho phản hồi từ API Sybil
export interface AttentionScore {
    file_name_original: string;
    file_name_pred: string;
    rank: number;
    attention_score: number;
}

export interface AttentionInfo {
    attention_scores: AttentionScore[];
}

export interface ISybilPredictionResponse {
    session_id: string; // ID của phiên dự đoán
    message: string; // Thông báo kết quả
    overlay_images: string; // Link tải file zip kết quả
    predictions: number[][]; // Danh sách dự đoán cho mỗi ảnh
    attention_info: AttentionInfo; // Thông tin attention scores
    gif_download?: string; // Link tải file gif (optional)
}
