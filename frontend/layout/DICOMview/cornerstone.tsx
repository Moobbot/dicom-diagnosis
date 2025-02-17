'use client';

// React imports
import React, { useState, useRef, useEffect, useCallback } from 'react';

// PrimeReact components
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { TabMenu } from 'primereact/tabmenu';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';

// CornerstoneJS (DICOM viewer) imports
import * as cornerstone from '@cornerstonejs/core';
import { RenderingEngine, Enums, type Types } from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import {
    ZoomTool,
    PanTool,
    WindowLevelTool,
    StackScrollTool,
    LengthTool
} from '@cornerstonejs/tools';

// Icons
import { TiZoom } from 'react-icons/ti';
import { CiRuler } from 'react-icons/ci';
import { IoIosMove } from 'react-icons/io';
import { ImContrast } from 'react-icons/im';
import { RiResetLeftFill } from 'react-icons/ri';
import PatientForm from '../forms/PatientForm';

const DCMViewer: React.FC<DCMViewerProps> = ({ selectedFolder }) => {
    const [selectedImageIdIndex, setSelectedImageIdIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState(0); // 0: Original, 1: Predicted
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [showGifDialog, setShowGifDialog] = useState(false);
    const [ExportDialog, setExportDialog] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const toast = useRef<Toast>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const renderingEngineRef = useRef<RenderingEngine | null>(null);
    const toolGroupRef = useRef<cornerstoneTools.Types.IToolGroup | null>(null);
    const fileRefs = useRef<(HTMLDivElement | null)[]>([]); // Ref cho danh sách file

    const renderingEngineId = 'myRenderingEngine';
    const viewportId = 'CT_VIEWPORT';
    const toolGroupId = 'ctToolGroup';

    useEffect(() => {
        const initializeViewer = async () => {
            await cornerstone.init();
            await cornerstoneTools.init();

            const renderingEngine = new RenderingEngine(renderingEngineId);
            renderingEngineRef.current = renderingEngine;

            renderingEngine.enableElement({
                viewportId,
                type: Enums.ViewportType.STACK,
                element: elementRef.current!,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.SAGITTAL
                }
            });

            cornerstoneTools.addTool(ZoomTool);
            cornerstoneTools.addTool(PanTool);
            cornerstoneTools.addTool(WindowLevelTool);
            cornerstoneTools.addTool(StackScrollTool);
            cornerstoneTools.addTool(LengthTool);

            const toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);
            if (toolGroup) {
                toolGroup.addTool(ZoomTool.toolName);
                toolGroup.addTool(PanTool.toolName);
                toolGroup.addTool(WindowLevelTool.toolName);
                toolGroup.addTool(StackScrollTool.toolName);
                toolGroup.addTool(LengthTool.toolName);
                toolGroup.addViewport(viewportId, renderingEngineId);
                toolGroupRef.current = toolGroup;
                toolGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }] });
            }
        };

        initializeViewer();
    }, []);

    useEffect(() => {
        if (selectedFolder && renderingEngineRef.current) {
            setActiveTab(0); // Reset về tab "Original" khi chọn folder mới
            const viewport = renderingEngineRef.current.getViewport(viewportId) as Types.IStackViewport;
            if (viewport) {
                viewport.setStack(selectedFolder.imageIds);
                viewport.render();
                setSelectedImageIdIndex(0);
            }

            const updateSelectedImage = () => {
                if (!viewport || !selectedFolder) return;

                // Lấy index của ảnh hiện tại
                const newIndex = viewport.getCurrentImageIdIndex();
                setSelectedImageIdIndex(newIndex);

                // Cuộn danh sách file đến ảnh đang hiển thị
                fileRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            };

            // Đăng ký sự kiện IMAGE_RENDERED
            const eventDispatcher = cornerstone.eventTarget;
            eventDispatcher.addEventListener(Enums.Events.IMAGE_LOADED, updateSelectedImage);

            // Cleanup khi component unmount
            return () => {
                eventDispatcher.removeEventListener(Enums.Events.IMAGE_LOADED, updateSelectedImage);
            };
        }
    }, [selectedFolder]);

    useEffect(() => {
        if (selectedFolder && renderingEngineRef.current) {
            const viewport = renderingEngineRef.current.getViewport(viewportId) as Types.IStackViewport;
            if (viewport) {
                let imageStack: string[] = [];
                if (activeTab === 0) {
                    imageStack = selectedFolder.imageIds;
                } else if (selectedFolder.predictedImagesURL && selectedFolder.predictedImagesURL.length > 0) {
                    imageStack = selectedFolder.predictedImagesURL
                        .map((img) => img.preview_link)
                        .filter((link) => typeof link === 'string' && link.startsWith("wadouri:"));
                }

                if (imageStack.length === 0) {
                    console.warn("Predicted image stack is empty or invalid.");
                    showToast("warn", "Warning", "No predicted images available.");
                    return;
                }

                viewport.setStack(imageStack);
                viewport.render();
                setSelectedImageIdIndex(0);
            }

            const updateSelectedImage = () => {
                if (!viewport || !selectedFolder) return;

                // Lấy index của ảnh hiện tại
                const newIndex = viewport.getCurrentImageIdIndex();
                setSelectedImageIdIndex(newIndex);

                // Cuộn danh sách file đến ảnh đang hiển thị
                fileRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            };

            // Đăng ký sự kiện IMAGE_RENDERED
            const eventDispatcher = cornerstone.eventTarget;
            eventDispatcher.addEventListener(Enums.Events.IMAGE_LOADED, updateSelectedImage);

            // Cleanup khi component unmount
            return () => {
                eventDispatcher.removeEventListener(Enums.Events.IMAGE_LOADED, updateSelectedImage);
            };
        }
    }, [activeTab]);

    const handleImageClick = useCallback(
        (index: number) => {
            const viewport = renderingEngineRef.current?.getViewport(viewportId) as Types.IStackViewport;

            if (!viewport || !selectedFolder) {
                showToast("error", "Error", "No active viewport found.");
                return;
            }
            const imageStack = activeTab === 0
                ? selectedFolder.imageIds
                : selectedFolder.predictedImagesURL?.map((img) => img.preview_link) || [];

            if (!imageStack || imageStack.length === 0) {
                showToast("warn", "Warning", "No images available for display.");
                return;
            }

            try {
                console.log('Image stack:', imageStack[index]);

                viewport.setStack(imageStack, index);
                viewport.render();
                setSelectedImageIdIndex(index);
                showToast('info', 'Image Loaded', 'Selected image has been loaded successfully.');
            } catch (error) {
                console.error('Error loading selected image:', error);
                showToast('error', 'Image Load Failed', 'Failed to load selected image.');
            }
        },
        [selectedFolder, activeTab]
    );

    const handleToolClick = (toolName: string) => {
        if (!toolGroupRef.current) {
            showToast('warn', 'Warning', 'Tool group is not initialized.');
            return;
        }

        const toolGroup = toolGroupRef.current;

        // If clicking the active tool, deactivate it
        if (activeTool === toolName) {
            toolGroup.setToolDisabled(toolName);
            setActiveTool(null);
            return;
        }

        // Deactivate previous active tool
        if (activeTool) {
            toolGroup.setToolDisabled(activeTool);
        }

        // Activate new tool
        toolGroup.setToolActive(toolName, { bindings: [{ mouseButton: 1 }] });
        setActiveTool(toolName);
    };

    const handleReset = async () => {
        const viewport = renderingEngineRef.current?.getViewport(viewportId) as Types.IStackViewport;
        const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);

        if (viewport && toolGroup) {
            try {
                // 1. Tắt tất cả công cụ hiện tại trước khi reset
                toolGroup.setToolDisabled(LengthTool.toolName);
                toolGroup.setToolDisabled(PanTool.toolName);
                toolGroup.setToolDisabled(ZoomTool.toolName);
                toolGroup.setToolDisabled(WindowLevelTool.toolName);
                toolGroup.setToolPassive(StackScrollTool.toolName);

                // TODO: Reset LengthTool không thành công, cần xử lý sau
                // 2. Xóa tất cả annotations của LengthTool (đo lường) trên viewport hiện tại
                const annotations = cornerstoneTools.annotation.state.getAnnotations(viewportId, LengthTool.toolName);
                annotations.forEach((annotation) => {
                    if (annotation.annotationUID) {
                        cornerstoneTools.annotation.state.removeAnnotation(annotation.annotationUID);
                    }
                });

                // Reset toàn bộ annotation manager để đảm bảo không còn lưu dữ liệu cũ
                cornerstoneTools.annotation.state.resetAnnotationManager();

                // 3. Đặt lại camera về vị trí mặc định
                viewport.resetCamera({
                    resetPan: true,
                    resetZoom: true,
                    resetToCenter: true,
                    suppressEvents: false
                });

                // 4. Reset toàn bộ thuộc tính viewport
                viewport.resetProperties();
                viewport.resetToDefaultProperties();

                // 5. Xóa tất cả actors trong viewport
                viewport.removeAllActors();

                // 6. Đặt lại chỉ số ảnh hiện tại về ảnh đầu tiên
                await viewport.setStack(selectedFolder?.imageIds || []);
                viewport.setImageIdIndex(0);
                viewport.render();

                // 7. Kích hoạt lại StackScrollTool làm công cụ mặc định
                toolGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }] });

                setActiveTool(StackScrollTool.toolName);

                showToast('success', 'Reset Success', 'Viewport has been completely reset to default settings.');
            } catch (error) {
                console.error('Error resetting viewport:', error);
                showToast('error', 'Reset Failed', 'Failed to reset view.');
            }
        } else {
            showToast('error', 'Reset Failed', 'No active viewport found.');
        }
    };

    const handleViewGif = () => {
        if (selectedFolder?.gifDownloadURL?.preview_link) {
            setShowGifDialog(true);
        } else {
            showToast('warn', 'No GIF Available', 'There is no GIF available for preview.');
        }
    };

    const handleDownloadGif = () => {
        if (selectedFolder?.gifDownloadURL?.download_link) {
            const url = selectedFolder.gifDownloadURL.download_link;
            const link = document.createElement('a');
            link.href = url;
            link.download = url.split('/').pop() || 'animation.gif';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showToast('error', 'Download Failed', 'No GIF available to download.');
        }
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const wizardItems = [
        { label: 'Original', command: () => setActiveTab(0) },
        {
            label: 'Predicted',
            command: () => setActiveTab(1),
            disabled: !selectedFolder?.predictedImagesURL || selectedFolder.predictedImagesURL.length === 0
        }
    ];

    const handleCheckboxChange = (image: { filename: string }) => {
        setSelectedImages((prevSelected) => {
            if (prevSelected.includes(image.filename)) {
                return prevSelected.filter((img) => img !== image.filename);
            } else {
                return [...prevSelected, image.filename];
            }
        });
    };

    const handleViewExport = () => {
        if (selectedFolder?.gifDownloadURL?.preview_link && selectedImages) {
            console.log(selectedImages);

            setExportDialog(true);
        } else {
            showToast('warn', 'No Image choose', 'There is no Image predict choose.');
        }
    };

    return (
        <div className="w-full h-full">
            <Toast ref={toast} />

            <Splitter style={{ height: '100%' }}>
                {/* File Preview Panel */}
                <SplitterPanel size={10} minSize={10} className="border-right-1 p-2 flex flex-column">
                    <TabMenu model={wizardItems} activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)} />

                    {/* File List với chiều cao cố định và overflow-auto */}
                    <div className="flex-grow-1 overflow-auto mt-2" style={{ maxHeight: 'calc(100% - 5rem)' }}>
                        {selectedFolder &&
                            (activeTab === 0 ? (
                                selectedFolder.imageIds.map((imageId, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => (fileRefs.current[index] = el)}
                                        onClick={() => handleImageClick(index)}
                                        className={`cursor-pointer p-2 border-1 border-200 border-round hover:surface-200 flex align-items-center ${selectedImageIdIndex === index ? 'bg-bluegray-400' : ''}`}
                                    >
                                        <i className="pi pi-file text-2xl mr-2" />
                                        <span className="text-overflow-ellipsis flex-grow-1 overflow-hidden whitespace-nowrap">{selectedFolder.files[index]?.name}</span>
                                    </div>
                                ))
                            ) : selectedFolder.predictedImagesURL && selectedFolder.predictedImagesURL.length > 0 ? (
                                selectedFolder.predictedImagesURL.map((image, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => (fileRefs.current[index] = el)}
                                        onClick={() => handleImageClick(index)}
                                        className={`cursor-pointer p-2 border-1 border-200 border-round hover:surface-200 flex align-items-center ${selectedImageIdIndex === index ? 'bg-bluegray-400' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={selectedImages.includes(image.filename)}
                                            onChange={() => handleCheckboxChange(image)}
                                            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện onClick ảnh hưởng đến div
                                        />
                                        <i className="pi pi-file text-2xl mr-2" />
                                        <span className="text-overflow-ellipsis flex-grow-1 overflow-hidden whitespace-nowrap">{image.filename}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center text-gray-500">Prediction not performed yet</div>
                            ))}
                    </div>
                </SplitterPanel>

                {/* Tools and Viewer Panel */}
                <SplitterPanel size={80} minSize={30} className="p-2 flex-column">
                    {/* Toolbar */}
                    <div className="border-bottom-1">
                        <Toolbar
                            className="p-1 pl-2"
                            start={
                                <div className="flex gap-2">
                                    <Button rounded severity={activeTool === 'Length' ? 'success' : 'secondary'} onClick={() => handleToolClick(LengthTool.toolName)}>
                                        <CiRuler />
                                    </Button>
                                    <Button rounded severity={activeTool === 'Zoom' ? 'success' : 'secondary'} onClick={() => handleToolClick(ZoomTool.toolName)}>
                                        <TiZoom />
                                    </Button>
                                    <Button rounded severity={activeTool === 'Pan' ? 'success' : 'secondary'} onClick={() => handleToolClick(PanTool.toolName)}>
                                        <IoIosMove />
                                    </Button>
                                    <Button rounded severity={activeTool === 'WindowLevel' ? 'success' : 'secondary'} onClick={() => handleToolClick(WindowLevelTool.toolName)}>
                                        <ImContrast />
                                    </Button>
                                    <Button rounded onClick={handleReset}>
                                        <RiResetLeftFill />
                                    </Button>
                                </div>
                            }
                            end={
                                (activeTab === 1 && selectedFolder?.predictedImagesURL) && (
                                    <div className="flex gap-2">
                                        <Button label="Detection" severity="warning" />
                                        <Button label="Export" severity="help" onClick={handleViewExport} />
                                        <Button label="View Gif" severity="info" onClick={handleViewGif} />
                                    </div>
                                )
                            }
                        />
                    </div>
                    <div className="viewport-wrap overflow-y-auto">
                        <div className="h-viewport" ref={elementRef}></div>
                    </div>
                </SplitterPanel>
                <SplitterPanel size={10} minSize={5} className="p-2 flex-column"></SplitterPanel>
            </Splitter>
            <Dialog header="GIF Preview" visible={showGifDialog} style={{ width: '50vw' }} onHide={() => setShowGifDialog(false)}>
                <div className="flex flex-column align-items-center">
                    {selectedFolder?.gifDownloadURL?.preview_link ? <Image src={selectedFolder.gifDownloadURL.preview_link} alt="GIF Preview" preview /> : <p>No GIF available</p>}
                    <Button label="Download Gif" className="mt-3" onClick={handleDownloadGif} />
                </div>
            </Dialog>
            <Dialog header="Export Preview" visible={ExportDialog} style={{ width: '50vw' }} onHide={() => setExportDialog(false)}>
                <PatientForm selectedFileName={selectedImages} session_id={''}></PatientForm>
            </Dialog>
        </div>
    );
};

export default DCMViewer;
