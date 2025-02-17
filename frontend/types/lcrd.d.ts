
interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
    predictedImagesURL?: OverlayImage[];
    gifDownloadURL?: Gif;
}

interface DCMViewerProps {
    selectedFolder: FolderType | null;
}

interface PredictionResponse {
    message: string;
    predictions: number[][];
    session_id: string;
    overlay_images: OverlayImage[];
    gif: Gif;
}

interface OverlayImage {
    download_link: string;
    filename: string;
    preview_link: string;
}

interface Gif {
    download_link: string;
    preview_link: string;
}

interface PatientPredict {
    selectedFileName: string[];
    session_id: string;
}