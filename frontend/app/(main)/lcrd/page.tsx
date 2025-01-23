'use client';

// Global styles
import '@/styles/dicom/custom.scss';

// React and Next.js imports
import React, { useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// PrimeReact components
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { TabMenu } from 'primereact/tabmenu';
import { Toast } from 'primereact/toast';

// Context
import { LayoutContext } from '@/layout/context/layoutcontext';

// DICOM viewer
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import DCMViewer from '@/layout/DICOMview/cornerstone';
import ImageViewer from '@/layout/DICOMview/imageviewer';

interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
    predictedImages?: string[];
}

interface PredictionResponse {
    message: string;
    predictions: number[][];
    session_id: string;
    overlay_images: {
        download_links: string[];
        gif_download: string;
    };
}

const LCRD = ({ children }: { children: React.ReactNode }) => {
    const { setLayoutState } = useContext(LayoutContext);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const toast = useRef<Toast>(null);

    const pathname = usePathname();
    const [activeIndex, setActiveIndex] = useState(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLayoutState((prev) => ({
            ...prev,
            staticMenuDesktopInactive: true
        }));
    }, [setLayoutState]);

    useEffect(() => {
        const paths = pathname.split('/');
        const currentPath = paths[paths.length - 1];
        const indexMap: Record<string, number> = {
            seat: 1,
            payment: 2,
            confirmation: 3
        };
        setActiveIndex(indexMap[currentPath] || 0);
    }, [pathname]);

    const wizardItems = [
        { label: 'Original', command: () => <DCMViewer selectedFolder={selectedFolder} /> },
        { label: 'Predicted', command: () => <ImageViewer selectedFolder={selectedFolder} loading={loading} /> }
    ];

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleFileUpload = (event: { files: File[] }) => {
        if (!event.files.length) {
            showToast('warn', 'Warning', 'No files selected');
            return;
        }

        const dicomFiles = event.files.filter((file) => file.name.toLowerCase().endsWith('.dcm'));
        if (!dicomFiles.length) {
            showToast('warn', 'Warning', 'No DICOM files found');
            return;
        }

        const sortedFiles = [...event.files].sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: `Folder ${folders.length + 1}`,
            files: sortedFiles,
            imageIds: sortedFiles.map((file) => cornerstoneDICOMImageLoader.wadouri.fileManager.add(file))
        };

        setFolders((prev) => [...prev, newFolder]);
        fileUploadRef.current?.clear();
        showToast('success', 'Success', `Uploaded ${sortedFiles.length} files successfully`);
    };

    const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) {
            showToast('warn', 'Warning', 'No folder selected');
            return;
        }

        const files = Array.from(event.target.files).filter((file) => file.name.toLowerCase().endsWith('.dcm'));

        files.sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));

        if (!files.length) {
            showToast('warn', 'Warning', 'No DICOM files found in selected folder');
            return;
        }

        const folderName = event.target.files[0].webkitRelativePath.split('/')[0];

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: folderName,
            files,
            imageIds: files.map((file) => cornerstoneDICOMImageLoader.wadouri.fileManager.add(file))
        };

        setFolders((prev) => [...prev, newFolder]);
        folderInputRef.current!.value = '';
        showToast('success', 'Success', `Uploaded ${files.length} DICOM files from folder "${folderName}"`);
    };

    const selectFolder = (folder: FolderType) => {
        if (selectedFolder?.id !== folder.id) {
            setSelectedFolder(folder);
            showToast('info', 'Folder Selected', `Selected folder: ${folder.name}`);
        }
    };

    const handlePredict = async () => {
        // TODO: Implement prediction logic
        try {
            setLoading(true);
            if (!selectedFolder) {
                showToast('warn', 'Warning', 'No folder selected');
                return;
            }

            if (selectedFolder?.predictedImages) {
                showToast('info', 'Info', 'Prediction already completed');
                return;
            }

            const formData = new FormData();
            selectedFolder?.files.forEach((file) => formData.append('files', file));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/predict`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                showToast('error', 'Error', 'Failed to predict');
                return;
            }

            const data: PredictionResponse = await response.json();

            const downloadLinks = data.overlay_images.download_links.map((link) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/${link}`);
            const gifDownload = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${data.overlay_images.gif_download}`;

            const predictedImages = [...downloadLinks, gifDownload];
            setSelectedFolder((prev) => ({ ...prev!, predictedImages, gifDownload }));

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

                    <input ref={folderInputRef} type="file" webkitdirectory="true" directory="" style={{ display: 'none' }} onChange={handleFolderUpload} />

                    <Button label="Upload Folder" className="ml-2" icon="pi pi-folder-open" onClick={() => folderInputRef.current?.click()} />
                    <Button label="Predict" className="ml-2" icon="pi pi-play" onClick={() => handlePredict()} loading={loading} />
                </div>

                <div className="card-body p-card-content">
                    <Splitter className="dicom-panel flex-grow-1">
                        <SplitterPanel size={10} minSize={5} className="overflow-auto">
                            <div className="overflow-auto">
                                {folders.map((folder) => (
                                    <div key={folder.id} onClick={() => selectFolder(folder)} className={`cursor-pointer p-3 border-round hover:surface-200 ${selectedFolder?.id === folder.id ? 'surface-200' : ''}`}>
                                        <i className="pi pi-folder text-4xl flex justify-content-center" />
                                        <div className="text-center mt-2">{folder.name}</div>
                                    </div>
                                ))}
                            </div>
                        </SplitterPanel>
                        <SplitterPanel size={90} minSize={10}>
                            <div className="w-full h-full">
                                <TabMenu className="" model={wizardItems} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
                                <div className="box-image w-full max-h-full">{wizardItems[activeIndex]?.command()}</div>
                            </div>
                        </SplitterPanel>
                    </Splitter>
                </div>
            </div>
        </div>
    );
};

export default LCRD;