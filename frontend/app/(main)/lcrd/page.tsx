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
import PatientService from '@/modules/admin/service/PatientService';

import { VirtualScroller } from 'primereact/virtualscroller';

import JSZip from 'jszip';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

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
            download_link: `wadouri:${apiPath}/download/results/${data.session_id}/${filename}`,
            preview_link: `wadouri:${apiPath}/preview/results/${data.session_id}/${filename}`
        })),
        gif: {
            download_link: `${apiPath}/download/results/${data.session_id}/${data.gif}`,
            preview_link: `${apiPath}/preview/results/${data.session_id}/${data.gif}`
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
    const zipInputRef = useRef<HTMLInputElement>(null);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [folderLoading, setFolderLoading] = useState(false);

    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 10; // Số folder trên mỗi lần tải

    const isMounted = useRef(false);

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

    const loadFolders = async (page: number) => {
        if (loading) return; // Tránh gọi API nhiều lần khi đang tải
        setFolderLoading(true);

        try {
            const response = await PatientService.getPatients(page + 1, rowsPerPage);
            const serverData = response as ServerResponse;

            // Xử lý dữ liệu
            const processedFolders = serverData.data.map((folder) => {
                const sessionId = folder.session_id;

                // Sắp xếp upload_images theo thứ tự tự nhiên
                const sortedUploadImages = folder.upload_images.sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a, b));

                // Tạo danh sách imageIds
                const imageIds = sortedUploadImages.map((filename) => `wadouri:${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/preview/uploads/${sessionId}/${filename}`);

                // Sắp xếp overlay_images theo thứ tự tự nhiên
                const sortedOverlayImages = folder.overlay_images.sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a, b));

                // Tạo danh sách predictedImagesURL
                const predictedImagesURL = sortedOverlayImages.map((filename) => ({
                    filename,
                    preview_link: `wadouri:${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/preview/results/${sessionId}/${filename}`,
                    download_link: `wadouri:${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/download/results/${sessionId}/${filename}`
                }));

                // GIF URL
                const gifDownloadURL = {
                    download_link: `${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/download/results/${sessionId}/${folder.gif}`,
                    preview_link: `${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/preview/results/${sessionId}/${folder.gif}`
                };

                return {
                    id: folder._id,
                    name: folder.patient_info.name,
                    files: sortedUploadImages,
                    session_id: sessionId,
                    patient_info: folder.patient_info,
                    imageIds,
                    predictedImagesURL,
                    gifDownloadURL,
                    predictions: folder.predictions,
                    from_server: true
                };
            });

            // Cập nhật state (thêm dữ liệu vào danh sách cũ)
            setFolders((prevFolders) => [...prevFolders, ...processedFolders]);
            setTotalRecords(serverData.total);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading folders: ', error);
        } finally {
            setFolderLoading(false);
        }
    };

    useEffect(() => {
        setLayoutState((prev) => ({
            ...prev,
            staticMenuDesktopInactive: true
        }));
    }, [setLayoutState]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            initCornerstone();
            loadFolders(0); // Gọi API lần đầu tiên
        }
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

    const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList?.length) {
            showToast('warn', 'Warning', 'No ZIP file selected');
            return;
        }

        const zipFile = fileList[0];

        try {
            const zip = new JSZip();
            const zipData = await zip.loadAsync(zipFile);

            // Lưu danh sách các file DICOM từ ZIP
            const dicomFiles: File[] = [];

            await Promise.all(
                Object.keys(zipData.files).map(async (filename) => {
                    if (filename.toLowerCase().endsWith('.dcm')) {
                        const fileData = await zipData.files[filename].async('blob');
                        const file = new File([fileData], filename, { type: 'application/dicom' });
                        dicomFiles.push(file);
                    }
                })
            );

            if (dicomFiles.length === 0) {
                showToast('warn', 'Warning', 'No DICOM files found in ZIP');
                return;
            }

            // Sắp xếp file theo thứ tự tự nhiên
            dicomFiles.sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));

            const newFolder: FolderType = {
                id: Date.now().toString(),
                name: zipFile.name.replace('.zip', ''),
                files: dicomFiles,
                imageIds: dicomFiles.map((file) => window.cornerstoneDICOMImageLoader.wadouri.fileManager.add(file))
            };

            setFolders((prev) => [...prev, newFolder]);

            showToast('success', 'Success', `Uploaded and extracted ${dicomFiles.length} files successfully`);

            // Reset input
            zipInputRef.current!.value = '';
        } catch (error) {
            showToast('error', 'Error', 'Failed to extract ZIP');
            console.error('ZIP extraction error:', error);
        }
    };

    const selectFolder = (folder: FolderType) => {
        if (selectedFolder?.id !== folder.id) {
            console.log('Folder selected: ', folder.name);

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
            const currentFolderId = selectedFolder.id;
            console.log('Predicting for folder ID:', currentFolderId);

            const zip = new JSZip();

            // Thêm từng file vào ZIP
            await Promise.all(
                selectedFolder?.files!.map(async (file, index) => {
                    if (file instanceof File) {
                        const fileData = await file.arrayBuffer(); // Đọc dữ liệu file
                        zip.file(file.name, fileData); // Thêm vào ZIP
                    }
                })
            );

            // Tạo Blob từ ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // Tạo FormData để gửi lên server
            const formData = new FormData();
            formData.append('file', zipBlob, `${selectedFolder.name}.zip`);

            // Gửi request đến API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/predict`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                showToast('error', `${response.status}`, errorText);
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }

            const data = (await response.json()) as PredictionResponse;

            const updatedData = addPrefixToLinks(data, `${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil`);

            setFolders((prevFolders) =>
                prevFolders.map((folder) =>
                    folder.id === currentFolderId
                        ? {
                              ...folder,
                              predictedImagesURL: updatedData.overlay_images,
                              gifDownloadURL: updatedData.gif,
                              session_id: updatedData.session_id,
                              predictions: updatedData.predictions,
                              forecast: updatedData.predictions[0] || []
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
                        forecast: updatedData.predictions[0] || []
                    };
                }
                return prev;
            });

            showToast('success', 'Success', 'Prediction completed successfully');
        } catch (error) {
            showToast('error', 'Error', 'Failed to predict');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFolder = async (folder: FolderType) => {
        if (folder.from_server) {
            // Xóa folder từ API
            try {
                await PatientService.deletePatient(folder.id);

                setFolders((prev) => prev.filter((f) => f.id !== folder.id));
                showToast('success', 'Success', 'Folder deleted successfully from database');
            } catch (error) {
                console.error('Error deleting folder:', error);
                showToast('error', 'Error', 'Failed to delete folder from database');
            }
        } else {
            // Xóa folder do người dùng upload (chỉ trên UI)
            if (selectedFolder?.id === folder.id) {
                setSelectedFolder(null);
            }
            setFolders((prev) => prev.filter((f) => f.id !== folder.id));
            showToast('success', 'Success', 'Folder removed locally');
        }
    };

    const confirmDelete = (folder: FolderType) => {
        confirmDialog({
            message: folder.from_server ? 'This folder is stored in the database. Deleting it will remove it permanently. Are you sure?' : 'This folder is only stored locally. Do you want to remove it?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: folder.from_server ? 'p-button-danger' : 'p-button-warning',
            accept: () => handleDeleteFolder(folder),
            reject: () => {}
        });
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

                    <Button label="Upload ZIP" className="ml-2" icon="pi pi-file-zip" onClick={() => zipInputRef.current?.click()} />
                    <input ref={zipInputRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={handleZipUpload} />

                    <Button label="Predict" className="ml-2" icon="pi pi-play" onClick={handlePredict} loading={loading} disabled={!selectedFolder} />
                </div>

                <div className="card-body p-card-content">
                    <Splitter className="dicom-panel">
                        <SplitterPanel size={10} minSize={5}>
                            <VirtualScroller
                                items={folders}
                                itemSize={80} // Chiều cao mỗi item
                                lazy
                                onLazyLoad={(e) => {
                                    if (folders.length < totalRecords) {
                                        loadFolders(currentPage + 1);
                                    }
                                }}
                                className="w-full h-full"
                                itemTemplate={(folder) => (
                                    <div key={folder.id} className={`flex justify-content-between align-items-center cursor-pointer p-3 border-round hover:surface-200 ${selectedFolder?.id === folder.id ? 'surface-200' : ''}`}>
                                        <div className="flex flex-column" onClick={() => selectFolder(folder)}>
                                            <i className="pi pi-folder text-4xl flex justify-content-center" />
                                            <div className="text-center mt-2">{folder.name}</div>
                                        </div>
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-danger p-button-rounded p-button-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDelete(folder);
                                            }}
                                        />
                                    </div>
                                )}
                            />
                            <ConfirmDialog />
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
