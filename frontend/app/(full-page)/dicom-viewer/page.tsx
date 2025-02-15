'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import DCMViewer from '@/layout/DICOMview/cornerstone';
import '@/styles/dicom/custom.scss';

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

const DCMPage = () => {
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
    const [selectedFile, setSelectedFile] = useState<PreviewFile | null>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleFileUpload = (event: any) => {
        const files = event.files;
        if (files.length === 0) {
            showToast('warn', 'Warning', 'No files selected');
            return;
        }

        (files as File[]).sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: `Folder ${folders.length + 1}`,
            files: files,
            imageIds: (files as File[]).map((file) => cornerstoneDICOMImageLoader.wadouri.fileManager.add(file))
        };

        setFolders([...folders, newFolder]);

        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }

        showToast('success', 'Success', `Uploaded ${files.length} files successfully`);
    };

    const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            showToast('warn', 'Warning', 'No folder selected');
            return;
        }

        const files = Array.from(event.target.files);
        files.sort((a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name));
        const dicomFiles = files.filter((file) => file.name.toLowerCase().endsWith('.dcm'));

        if (dicomFiles.length === 0) {
            showToast('warn', 'Warning', 'No DICOM files found in selected folder');
            return;
        }

        // Get folder name from the path of the first file
        const folderPath = event.target.files[0].webkitRelativePath;
        const folderName = folderPath.split('/')[0];

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: folderName,
            files: dicomFiles,
            imageIds: dicomFiles.map((file) => cornerstoneDICOMImageLoader.wadouri.fileManager.add(file))
        };

        setFolders([...folders, newFolder]);

        // Clear the input
        if (folderInputRef.current) {
            folderInputRef.current.value = '';
        }

        showToast('success', 'Success', `Uploaded ${dicomFiles.length} DICOM files from folder "${folderName}"`);
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
