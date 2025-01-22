"use client";

// Global styles
import '@/styles/dicom/custom.scss';

// React and Next.js imports
import React, { useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// PrimeReact components
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";

// Context
import { LayoutContext } from "@/layout/context/layoutcontext";

// DICOM viewer
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import DCMViewer from '@/layout/DICOMview/cornerstone';

interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
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

    useEffect(() => {
        setLayoutState((prev) => ({
            ...prev,
            staticMenuDesktopInactive: true,
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
        { label: 'Predicted', command: () => <DCMViewer selectedFolder={selectedFolder} /> },
    ];

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleFileUpload = (event: { files: File[] }) => {
        if (!event.files.length) {
            showToast('warn', 'Warning', 'No files selected');
            return;
        }

        const dicomFiles = event.files.filter(file => file.name.toLowerCase().endsWith('.dcm'));
        if (!dicomFiles.length) {
            showToast('warn', 'Warning', 'No DICOM files found');
            return;
        }

        const sortedFiles = [...event.files].sort((a, b) =>
            new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name)
        );

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: `Folder ${folders.length + 1}`,
            files: sortedFiles,
            imageIds: sortedFiles.map((file) => cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)),
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

        const files = Array.from(event.target.files).filter(file => file.name.toLowerCase().endsWith('.dcm'));

        if (!files.length) {
            showToast('warn', 'Warning', 'No DICOM files found in selected folder');
            return;
        }

        const folderName = event.target.files[0].webkitRelativePath.split('/')[0];

        const newFolder: FolderType = {
            id: Date.now().toString(),
            name: folderName,
            files,
            imageIds: files.map((file) => cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)),
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

    return (
        <div className="content-full col-12">
            <Toast ref={toast} />
            <div className="card p-card card-custom h-full">
                <div className="card-header flex align-items-center">
                    <FileUpload
                        ref={fileUploadRef}
                        className="mr-2"
                        mode="basic"
                        name="files"
                        multiple
                        accept=".dcm"
                        customUpload
                        uploadHandler={handleFileUpload}
                        auto
                        chooseLabel="Upload DCM Files"
                    />

                    <input
                        ref={folderInputRef}
                        type="file"
                        webkitdirectory="true"
                        directory=""
                        style={{ display: 'none' }}
                        onChange={handleFolderUpload}
                    />

                    <Button label="Upload Folder" className="ml-2" icon="pi pi-folder-open" onClick={() => folderInputRef.current?.click()} />
                </div>

                <div className="card-body p-card-content">
                    <Splitter className="flex w-full h-full">
                        <SplitterPanel size={20} minSize={10}>
                            <div className="flex flex-column h-full overflow-y-auto">
                                {folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        onClick={() => selectFolder(folder)}
                                        className={`cursor-pointer p-3 border-round hover:surface-200 ${selectedFolder?.id === folder.id ? 'surface-200' : ''}`}
                                    >
                                        <i className="pi pi-folder text-4xl flex justify-content-center" />
                                        <div className="text-center mt-2">{folder.name}</div>
                                    </div>
                                ))}
                            </div>
                        </SplitterPanel>

                        <SplitterPanel size={80} minSize={10}>
                            <div className="block w-full h-full">
                                <TabMenu model={wizardItems} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
                                <div className="h-full overflow-y-auto">
                                    {wizardItems[activeIndex]?.command()}
                                </div></div>
                        </SplitterPanel>
                    </Splitter>
                </div>
            </div>
        </div>
    );
};

export default LCRD;
