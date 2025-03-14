'use client';

// React and Next.js imports
import React, { useContext, useEffect, useRef, useState } from 'react';

// PrimeReact components
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';

// DICOM viewer
import DCMViewer from '@/layout/DICOMview/cornerstone';

interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
}

interface PreviewFile {
    id: string;
    name: string;
    url: string;
    imageId: string;
}

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

const DCMPage = () => {
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
    const [selectedFile, setSelectedFile] = useState<PreviewFile | null>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const toast = useRef<Toast>(null);

    const isMounted = useRef(false);
    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const initCornerstone = async () => {
        if (typeof window !== 'undefined' && !window.__cornerstone_initialized) {
            console.log('DICOM Image Loader');

            const cornerstoneDICOMImageLoader = await import('@cornerstonejs/dicom-image-loader');
            await cornerstoneDICOMImageLoader.init({ maxWebWorkers: 1 });

            // Lưu vào window để sử dụng toàn cục
            window.__cornerstone_initialized = true;
            window.cornerstoneDICOMImageLoader = cornerstoneDICOMImageLoader;
        }
    };
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            initCornerstone();
        }
    }, []);

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
            setSelectedFolder(folder);
            setSelectedFile(null);
            showToast('info', 'Folder Selected', `Selected folder: ${folder.name}`);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Toast ref={toast} />

            {/* Left panel - File Upload (15%) */}
            <div className="w-[15%] p-4 border-right-1 flex flex-column">
                <div className="flex flex-column gap-2 mb-4">
                    <FileUpload ref={fileUploadRef} mode="basic" name="files" multiple accept=".dcm" customUpload uploadHandler={handleFileUpload} auto chooseLabel="Upload DCM Files" />

                    {/* Hidden folder input */}
                    {/* @ts-ignore */}
                    <input ref={folderInputRef} type="file" webkitdirectory="true" directory="" style={{ display: 'none' }} onChange={handleFolderUpload} />

                    {/* Folder upload button */}
                    <Button label="Upload Folder" icon="pi pi-folder-open" onClick={() => folderInputRef.current?.click()} />
                </div>

                <div className="overflow-y-auto">
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            onClick={() => selectFolder(folder)}
                            className={`cursor-pointer p-3 border-round hover:surface-200  ${selectedFolder?.id === folder.id ? 'surface-200' : ''}`}
                        >
                            <i className="pi pi-folder text-4xl flex justify-content-center" />
                            <div className="text-center mt-2">{folder.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel - Viewer (85%) */}
            <DCMViewer selectedFolder={selectedFolder} />
        </div>
    );
};

export default DCMPage;
