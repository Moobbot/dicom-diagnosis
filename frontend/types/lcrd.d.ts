
interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
    predictedImagesURL?: OverlayImage[];
    gifDownloadURL?: Gif;
    session_id?: string;
    predictions?: number[][];
}

interface DCMViewerProps {
    selectedFolder: FolderType | null;
}

interface PredictionResponse {
    session_id: string;
    message: string;
    predictions: number[][];
    overlay_images: OverlayImage[];
    gif: Gif;
}

interface OverlayImage {
    filename: string;
    download_link: string;
    preview_link: string;
}

interface Gif {
    download_link: string;
    preview_link: string;
}

interface PatientData {
    patientId: string;
    group: string;
    collectFees: string;
    name: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion: string;
    session_id: string;
    file_name: string[];
    forecast_index: number[];
}