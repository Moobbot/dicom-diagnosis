// Interface cho một ảnh overlay
interface IOverlayImage {
    filename: string;         // Tên file ảnh
    download_link: string;    // Link tải ảnh
    preview_link: string;     // Link xem trước ảnh
}

// Interface chính cho phản hồi từ API Sybil
export interface ISybilPredictionResponse {
    session_id: string;              // ID của phiên dự đoán
    message: string;                  // Thông báo kết quả
    gif_download: string;              // Link tải file GIF
    overlay_images: IOverlayImage[];    // Danh sách các ảnh overlay
    predictions: number[][];            // Danh sách dự đoán cho mỗi ảnh
}

