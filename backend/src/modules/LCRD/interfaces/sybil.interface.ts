export interface ISybilPredictionResponse {
    message: string;
    overlay_images: {
        download_links: string[];
        gif_download: string;
        preview_links: string[];
    };
    predictions: number[][];
    session_id: string;
}
