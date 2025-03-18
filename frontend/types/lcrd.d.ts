interface FolderType {
    id: string;
    name: string;
    files: File[] | string[];
    imageIds: string[];
    predictedImagesURL?: OverlayImage[];
    gifDownloadURL?: Gif;
    session_id?: string;
    predictions?: number[][];
    patient_info?: PatientInfo;
    from_server?: boolean;
}

interface DCMViewerProps {
    selectedFolder: FolderType | null;
}

interface PredictionResponse {
    session_id: string;
    message: string;
    predictions: number[][];
    session_id: string;
    overlay_images: string[];
    gif: string;
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
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion: string;
    session_id: string;
    file_name: string[];
    forecast: number[];
}

interface ServerResponse {
    page: number;
    limit: number;
    total: number;
    pages: number;
    success: boolean;
    data: ServerFolder[];
}

interface ServerFolder {
    _id: string;
    session_id: string;
    predictions: number[][];
    patient_info: PatientInfo;
    upload_images: string[];
    overlay_images: string[];
    gif: string;
}

interface PatientInfo {
    _id: string;
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion: string;
}

type PatientInfo = Omits<PatientData, 'session_id' | 'file_name' | 'forecast'>;
