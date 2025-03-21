export interface FolderType {
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

export interface DCMViewerProps {
    selectedFolder: FolderType | null;
}

export interface PredictionResponse {
    session_id: string;
    message: string;
    predictions: number[][];
    session_id: string;
    overlay_images: string[];
    gif: string;
}

export interface OverlayImage {
    filename: string;
    download_link: string;
    preview_link: string;
}

export interface Gif {
    download_link: string;
    preview_link: string;
}

export interface PatientInfo {
    _id?: string;
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address?: string | null;
    diagnosis?: string | null;
    general_conclusion?: string | null;
}

export interface PatientData extends PatientInfo {
    session_id: string;
    file_name: string[];
    forecast: number[];
}

// type PatientInfo = Omits<PatientData, 'session_id' | 'file_name' | 'forecast'>;
export interface ServerResponse {
    page: number;
    limit: number;
    total: number;
    pages: number;
    success: boolean;
    data: ServerFolder[];
}

export interface ServerFolder {
    _id: string;
    session_id: string;
    predictions: number[][];
    patient_info: PatientInfo;
    upload_images: string[];
    overlay_images: string[];
    gif: string;
}
