// Interface chính cho phản hồi từ API Sybil
export interface ISybilPredictionResponse {
    session_id: string; // ID của phiên dự đoán
    message: string; // Thông báo kết quả
    overlay_images: string; // Link tải file zip kết quả
    predictions: number[][]; // Danh sách dự đoán cho mỗi ảnh
}
