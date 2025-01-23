'use client';
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import { TiZoom } from 'react-icons/ti';
import { CiRuler } from 'react-icons/ci';
import { IoIosMove } from 'react-icons/io';
import { ImContrast } from 'react-icons/im';
import { RiResetLeftFill } from 'react-icons/ri';

interface FolderType {
    id: string;
    name: string;
    files: File[];
    imageIds: string[];
    predictedImages?: string[];
    gifDownload?: string;
}

interface ImageViewerProps {
    selectedFolder: FolderType | null;
    loading: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ selectedFolder, loading }) => {
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleImageClick = (imageId: string) => {
        setSelectedImageId(imageId);
        showToast('info', 'Image Loaded', 'Selected image has been loaded successfully.');
    };

    const handleReset = () => {
        setSelectedImageId(null);
        showToast('success', 'Reset Success', 'Viewer has been reset.');
    };

    return (
        <div className="flex w-full h-full overflow-hidden relative">
            <Toast ref={toast} />

            {/* File Preview Panel */}
            <div className="file-preview-panel overflow-hidden border-right-1">
                {selectedFolder && !loading && !selectedFolder.predictedImages && (
                    <div className="p-3 text-500">
                        No predictions made yet
                    </div>
                )}
                {selectedFolder && selectedFolder.predictedImages && (
                    <div className="max-h-full overflow-y-auto">
                        {selectedFolder.predictedImages.map((imageId, index) => (
                            <div
                                key={index}
                                onClick={() => handleImageClick(imageId)}
                                className={`cursor-pointer p-3 border-1 border-200 border-round hover:surface-200 ${selectedImageId === imageId ? 'bg-bluegray-400' : ''
                                    }`}
                            >
                                <i className="pi pi-file text-2xl" />
                                <span className="ml-2">{imageId.split("/").pop()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tools and Viewer Panel */}
            <div className="tool-viewer-panel flex flex-1 flex-column overflow-hidden">
                {/* Toolbar */}
                <div className="border-bottom-1">
                    <Toolbar
                        className="p-1 pl-2"
                        start={
                            <div className="flex gap-2">
                                <Button rounded severity="secondary">
                                    <CiRuler />
                                </Button>
                                <Button rounded severity="secondary">
                                    <TiZoom />
                                </Button>
                                <Button rounded severity="secondary">
                                    <IoIosMove />
                                </Button>
                                <Button rounded severity="secondary">
                                    <ImContrast />
                                </Button>
                                <Button rounded onClick={handleReset}>
                                    <RiResetLeftFill />
                                </Button>
                            </div>
                        }
                    />
                </div>

                {/* Image Viewer */}
                <div className="flex flex-1 justify-content-center overflow-hidden">
                    {selectedImageId ? (
                        <Image src={selectedImageId} alt="Selected Image" className="img-full w-full h-full object-contain flex justify-content-center" style={{ backgroundColor: 'black' }} />
                    ) : (
                        <div className="w-full h-full flex align-items-center justify-content-center text-500">
                            Select a file to view
                        </div>
                    )}
                </div>
                <div className="div-action absolute bottom-1 right-0 p-3" style={{ bottom: "1rem" }}>
                    <Button className="mr-2" label="Detection" type="button" severity="warning" />
                    <Button className="mr-2" label="Export" severity="help" />
                    <Button label="Download Gif" type="button" onClick={async () => {
                        if (selectedFolder?.gifDownload) {
                            try {
                                const response = await fetch(selectedFolder.gifDownload);
                                if (!response.ok) {
                                    throw new Error('Failed to download file');
                                }

                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.type = "_blank";
                                link.download = selectedFolder.name ? `${selectedFolder.name}.gif` : 'download.gif'; // Tên file tải về
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url); // Giải phóng bộ nhớ

                            } catch (error) {
                                alert('Error downloading the GIF. Please try again.');
                                console.error('Download error:', error);
                            }
                        } else {
                            alert("No GIF available to download.");
                        }
                    }} severity="info" />
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;