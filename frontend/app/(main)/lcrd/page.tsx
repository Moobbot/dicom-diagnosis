'use client';

// Global styles
import '@/styles/dicom/custom.scss';

// React and Next.js imports
import React, { useContext, useEffect, useRef, useState } from 'react';

// PrimeReact components
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Toast } from 'primereact/toast';

// Context
import { LayoutContext } from '@/layout/context/layoutcontext';

// DICOM viewer
import DCMViewer from '@/layout/DICOMview/cornerstone';

declare global {
    interface Window {
        __cornerstone_initialized?: boolean;
        cornerstoneDICOMImageLoader?: any;
    }
}

const addPrefixToLinks = (data: PredictionResponse, apiPath: string): Omit<PredictionResponse, 'overlay_images' | 'gif'> & { overlay_images: OverlayImage[]; gif: Gif } => {
    return {
        ...data,
        overlay_images: data.overlay_images.map((filename) => ({
            filename,
            download_link: `wadouri:${apiPath}/download/${data.session_id}/${filename}`,
            preview_link: `wadouri:${apiPath}/preview/${data.session_id}/${filename}`
        })),
        gif: {
            download_link: `${apiPath}/download/${data.session_id}/${data.gif}`,
            preview_link: `${apiPath}/preview/${data.session_id}/${data.gif}`
        },
        predictions: data.predictions,
        session_id: data.session_id
    };
};

const LCRD = () => {
    const { setLayoutState } = useContext(LayoutContext);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLayoutState((prev) => ({
            ...prev,
            staticMenuDesktopInactive: true
        }));
    }, [setLayoutState]);

    useEffect(() => {
        const initCornerstone = async () => {
            if (typeof window !== 'undefined' && !window.__cornerstone_initialized) {
                console.log("DICOM Image Loader");

                const cornerstoneDICOMImageLoader = await import('@cornerstonejs/dicom-image-loader');
                await cornerstoneDICOMImageLoader.init({ maxWebWorkers: 1 });

                // Lưu vào window để sử dụng toàn cục
                window.__cornerstone_initialized = true;
                window.cornerstoneDICOMImageLoader = cornerstoneDICOMImageLoader;
            }
        };
        initCornerstone();
    }, []);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Hàm xử lý file DICOM (lọc, sắp xếp, và tạo danh sách imageIds)
    const processFiles = (files: File[], folderName: string) => {
        if (!window.cornerstoneDICOMImageLoader) {
            showToast('error', 'Error', 'Cornerstone DICOM Image Loader is not initialized');
            return null;
        }

        const dicomFiles = files.filter((file) => file.name.toLowerCase().endsWith('.dcm'));

        if (!dicomFiles.length) {
            showToast('warn', 'Warning', 'No DICOM files found');
            return null;
        }

        // Sắp xếp file theo thứ tự tự nhiên (numeric sort)
        dicomFiles.sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));

        return {
            id: Date.now().toString(),
            name: folderName,
            files: dicomFiles,
            imageIds: dicomFiles.map((file) => window.cornerstoneDICOMImageLoader.wadouri.fileManager.add(file))
        } as FolderType;
    };

    // Xử lý upload file DICOM riêng lẻ
    const handleFileUpload = (event: { files: File[] }) => {
        if (!event.files.length) {
            showToast('warn', 'Warning', 'No files selected');
            return;
        }

        const newFolder = processFiles(event.files, `Folder ${folders.length + 1}`);
        if (!newFolder) return;

        setFolders((prev) => [...prev, newFolder]);
        fileUploadRef.current?.clear();
        showToast('success', 'Success', `Uploaded ${newFolder.files.length} files successfully`);
    };
    // Xử lý upload thư mục DICOM
    const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList?.length) {
            showToast('warn', 'Warning', 'No folder selected');
            return;
        }

        const folderName = fileList[0].webkitRelativePath.split('/')[0];
        const newFolder = processFiles(Array.from(fileList), folderName);
        if (!newFolder) return;

        setFolders((prev) => [...prev, newFolder]);
        folderInputRef.current!.value = ''; // Reset input
        showToast('success', 'Success', `Uploaded ${newFolder.files.length} DICOM files from folder "${folderName}"`);
    };

    const selectFolder = (folder: FolderType) => {
        if (selectedFolder?.id !== folder.id) {
            console.log("Folder selected: ", folder.name);

            setSelectedFolder(folder);
            showToast('info', 'Folder Selected', `Selected folder: ${folder.name}`);
        }
    };

    const handlePredict = async () => {
        if (!selectedFolder) {
            showToast('warn', 'Warning', 'No folder selected');
            return;
        }

        if (selectedFolder?.predictedImagesURL) {
            showToast('info', 'Info', 'Prediction already completed');
            return;
        }

        try {
            setLoading(true);
            const currentFolderId = selectedFolder.id; // Lưu ID folder cục bộ
            console.log("Predicting for folder ID:", currentFolderId);

            // Tạo FormData chứa các file DICOM
            const formData = new FormData();
            selectedFolder?.files.forEach((file) => formData.append('files', file));

            // Gửi request đến API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/predict`, {
                method: 'POST',
                body: formData
            });

            // Xử lý lỗi nếu response không thành công
            if (!response.ok) {
                const errorText = await response.text(); // Lấy nội dung lỗi từ server
                showToast('error', `${response.status}`, errorText);
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }

            const data = (await response.json()) as PredictionResponse;

            const updatedData = addPrefixToLinks(data, `${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/`);

            setFolders((prevFolders) =>
                prevFolders.map((folder) =>
                    folder.id === currentFolderId
                        ? {
                            ...folder,
                            predictedImagesURL: updatedData.overlay_images,
                            gifDownloadURL: updatedData.gif,
                            session_id: updatedData.session_id,
                            predictions: updatedData.predictions,
                            forecast_index: updatedData.predictions[0] || []
                        }
                        : folder
                )
            );

            setSelectedFolder((prev) => {
                if (prev?.id === currentFolderId) {
                    return {
                        ...prev,
                        predictedImagesURL: updatedData.overlay_images,
                        gifDownloadURL: updatedData.gif,
                        session_id: updatedData.session_id,
                        predictions: updatedData.predictions,
                        forecast_index: updatedData.predictions[0] || []
                    };
                }
                return prev;
            });
            showToast('success', 'Success', 'Prediction completed successfully');
        } catch (error) {
            showToast('error', 'Error', 'Failed to predict');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-full">
            <Toast ref={toast} />
            <div className="card p-card card-custom overflow-hidden">
                <div className="card-header flex align-items-center">
                    <FileUpload ref={fileUploadRef} className="mr-2" mode="basic" name="files" multiple accept=".dcm" customUpload uploadHandler={handleFileUpload} auto chooseLabel="Upload DCM Files" />
                    {/* @ts-ignore */}
                    <input ref={folderInputRef} type="file" webkitdirectory="true" directory="" style={{ display: 'none' }} onChange={handleFolderUpload} />

                    <Button label="Upload Folder" className="ml-2" icon="pi pi-folder-open" onClick={() => folderInputRef.current?.click()} />
                    <Button label="Predict" className="ml-2" icon="pi pi-play" onClick={handlePredict} loading={loading} disabled={!selectedFolder} />
                </div>

                <div className="card-body p-card-content">
                    <Splitter className="dicom-panel">
                        <SplitterPanel size={10} minSize={5}>
                            <div className="overflow-auto">
                                {folders.map((folder) => (
                                    <div key={folder.id} onClick={() => selectFolder(folder)} className={`cursor-pointer p-3 border-round hover:surface-200 ${selectedFolder?.id === folder.id ? 'surface-200' : ''}`}>
                                        <i className="pi pi-folder text-4xl flex justify-content-center" />
                                        <div className="text-center mt-2">{folder.name}</div>
                                    </div>
                                ))}
                            </div>
                        </SplitterPanel>
                        <SplitterPanel size={90} minSize={70}>
                            <DCMViewer selectedFolder={selectedFolder} />
                        </SplitterPanel>
                    </Splitter>
                </div>
            </div>
        </div>
    );
};

export default LCRD;
