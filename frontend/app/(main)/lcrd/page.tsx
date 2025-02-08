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
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import DCMViewer from '@/layout/DICOMview/cornerstone';

interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
    predictedImagesURL?: OverlayImage[];
    gifDownloadURL?: Gif;
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

const addPrefixToLinks = (data: PredictionResponse, apiPath: string): PredictionResponse => {
    return {
        ...data,
        overlay_images: data.overlay_images.map((image) => ({
            ...image,
            download_link: `wadouri:${apiPath}${image.download_link}`,
            preview_link: `wadouri:${apiPath}${image.preview_link}`
        })),
        gif: {
            ...data.gif,
            download_link: `${apiPath}${data.gif.download_link}`,
            preview_link: `${apiPath}${data.gif.preview_link}`
        }
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

        const sortedFiles = [...dicomFiles].sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));

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
        try {
            setLoading(true);
            if (!selectedFolder) {
                showToast('warn', 'Warning', 'No folder selected');
                return;
            }

            if (selectedFolder?.predictedImagesURL) {
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

            const data = await response.json() as PredictionResponse;

            // const data = {
            //     message: 'Prediction successful.',
            //     predictions: [[0.0019649702414815395, 0.006792662605387028, 0.01361832965162377, 0.01728884468542021, 0.021685326042547536, 0.03595085191094143]],
            //     session_id: 'cd554235-1c03-4b9c-aea5-4c93b672c115',
            //     overlay_images: [
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_18.dcm',
            //             filename: 'slice_18.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_18.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_19.dcm',
            //             filename: 'slice_19.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_19.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_20.dcm',
            //             filename: 'slice_20.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_20.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_21.dcm',
            //             filename: 'slice_21.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_21.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_22.dcm',
            //             filename: 'slice_22.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_22.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_23.dcm',
            //             filename: 'slice_23.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_23.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_24.dcm',
            //             filename: 'slice_24.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_24.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_25.dcm',
            //             filename: 'slice_25.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_25.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_26.dcm',
            //             filename: 'slice_26.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_26.dcm'
            //         },
            //         {
            //             download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_27.dcm',
            //             filename: 'slice_27.dcm',
            //             preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/slice_27.dcm'
            //         }
            //     ],
            //     gif: {
            //         download_link: 'download/cd554235-1c03-4b9c-aea5-4c93b672c115/animation.gif',
            //         preview_link: 'preview/cd554235-1c03-4b9c-aea5-4c93b672c115/animation.gif'
            //     }
            // } as PredictionResponse;

            const updatedData = addPrefixToLinks(data, `${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/`);

            setSelectedFolder((prev) => ({ ...prev!, predictedImagesURL: updatedData.overlay_images, gifDownloadURL: updatedData.gif }));

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
                    <Button label="Predict" className="ml-2" icon="pi pi-play" onClick={handlePredict} loading={loading} disabled={!selectedFolder}/>
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
                            <DCMViewer selectedFolder={selectedFolder} />
                        </SplitterPanel>
                    </Splitter>
                </div>
            </div>
        </div>
    );
};

export default LCRD;
