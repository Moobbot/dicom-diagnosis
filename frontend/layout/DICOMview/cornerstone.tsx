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
import { ZoomTool, PanTool, WindowLevelTool, StackScrollTool, LengthTool } from '@cornerstonejs/tools';

// Icons
import { TiZoom } from 'react-icons/ti';
import { CiRuler } from 'react-icons/ci';
import { IoIosMove } from 'react-icons/io';
import { ImContrast } from 'react-icons/im';
import { RiResetLeftFill } from 'react-icons/ri';
import PatientForm from '../forms/PatientForm';
import { Messages } from 'primereact/messages';
import { DCMViewerProps } from '@/types/lcrd';
import { PatientData } from '@/types/lcrd';

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
    const msgs = useRef<Messages>(null);

    const [patientData, setPatientData] = useState<PatientData>({
        _id: '',
        patient_id: '',
        name: '',
        age: '',
        sex: '',
        address: null,
        diagnosis: null,
        general_conclusion: null,
        session_id: '',
        file_name: [],
        forecast: []
    });

    // Thêm state để kiểm soát việc hiển thị overlay
    const [showOverlay, setShowOverlay] = useState(true);

    // Thêm state để kiểm soát việc khởi tạo toolGroup
    const [toolGroupInitialized, setToolGroupInitialized] = useState(false);

    useEffect(() => {
        const initializeViewer = async () => {
            try {
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

                    // Kích hoạt StackScrollTool mặc định
                    toolGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }] });
                    setActiveTool(StackScrollTool.toolName);
                    setToolGroupInitialized(true);
                } else {
                    console.error('Failed to create tool group');
                    showToast('error', 'Initialization Error', 'Failed to initialize viewer tools.');
                }
            } catch (error) {
                console.error('Error initializing viewer:', error);
                showToast('error', 'Initialization Error', 'Failed to initialize viewer.');
            }
        };

        initializeViewer();

        // Cleanup function
        return () => {
            if (toolGroupRef.current) {
                cornerstoneTools.ToolGroupManager.destroyToolGroup(toolGroupId);
            }
        };
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
                    imageStack = selectedFolder.predictedImagesURL.map((img) => img.preview_link).filter((link) => typeof link === 'string' && link.startsWith('wadouri:'));
                }

                if (imageStack.length === 0) {
                    console.warn('Predicted image stack is empty or invalid.');
                    showToast('warn', 'Warning', 'No predicted images available.');
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

    useEffect(() => {
        if (selectedFolder?.predictions && selectedFolder.predictions.length > 0) {
            const messages = selectedFolder.predictions[0].map((value, index) => ({
                sticky: true,
                severity: getSeverity(value),
                summary: `Year ${index + 1}`,
                detail: `Value: ${(value * 100).toFixed(2)}%`,
                closable: false
            }));

            msgs.current?.clear(); // Xóa thông báo cũ trước khi cập nhật
            msgs.current?.show(messages);
        } else {
            msgs.current?.clear();
        }
    }, [selectedFolder?.predictions]);

    const getSeverity = (value: number): 'success' | 'info' | 'warn' | 'error' => {
        if (value < 0.25) return 'info';
        if (value < 0.5) return 'success';
        if (value < 0.75) return 'warn';
        return 'error';
    };

    const handleImageClick = useCallback(
        (index: number) => {
            const viewport = renderingEngineRef.current?.getViewport(viewportId) as Types.IStackViewport;

            if (!viewport || !selectedFolder) {
                showToast('error', 'Error', 'No active viewport found.');
                return;
            }
            const imageStack = activeTab === 0 ? selectedFolder.imageIds : selectedFolder.predictedImagesURL?.map((img) => img.preview_link) || [];

            if (!imageStack || imageStack.length === 0) {
                showToast('warn', 'Warning', 'No images available for display.');
                return;
            }

            try {
                console.log('Image stack:', imageStack[index]);

                viewport.setStack(imageStack, index);
                viewport.render();
                setSelectedImageIdIndex(index);
                showToast('info', 'Image Loaded', 'Selected image has been loaded successfully.');
            } catch (error) {
                console.log('Error loading selected image:', error);
                showToast('error', 'Image Load Failed', 'Failed to load selected image.');
            }
        },
        [selectedFolder, activeTab]
    );

    const handleToolClick = (toolName: string) => {
        if (!toolGroupInitialized) {
            showToast('warn', 'Warning', 'Viewer tools are not ready yet. Please wait.');
            return;
        }

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
        if (!toolGroupInitialized) {
            showToast('warn', 'Warning', 'Viewer tools are not ready yet. Please wait.');
            return;
        }

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
                console.log('Error resetting viewport:', error);
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
        toast.current?.show({ severity, summary, detail, life: 5000 });
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
        console.log('selectedFolder:', selectedFolder);

        setPatientData((prevData) => ({
            ...prevData,
            _id: selectedFolder?.patient_info?._id || '',
            patient_id: selectedFolder?.patient_info?.patient_id || '',
            name: selectedFolder?.patient_info?.name || '',
            age: selectedFolder?.patient_info?.age || '',
            sex: selectedFolder?.patient_info?.sex || '',
            address: selectedFolder?.patient_info?.address || null,
            diagnosis: selectedFolder?.patient_info?.diagnosis || null,
            general_conclusion: selectedFolder?.patient_info?.general_conclusion || null,
            file_name: selectedImages,
            session_id: selectedFolder?.session_id || '',
            forecast: selectedFolder?.predictions ? selectedFolder.predictions[0] : []
        }));

        setExportDialog(true);
    };

    // Thêm useEffect để cập nhật trạng thái overlay
    useEffect(() => {
        if (selectedFolder && selectedFolder.imageIds && selectedFolder.imageIds.length > 0) {
            setShowOverlay(false);
        } else {
            setShowOverlay(true);
        }
    }, [selectedFolder]);

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
                                        <span className="text-overflow-ellipsis flex-grow-1 overflow-hidden whitespace-nowrap">
                                            {Array.isArray(selectedFolder.files) && selectedFolder.files.length > 0
                                                ? selectedFolder.files[index] instanceof File
                                                    ? (selectedFolder.files[index] as File).name
                                                    : selectedFolder.files[index] as string
                                                : ""}
                                        </span>
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
                                            onClick={(e) => e.stopPropagation()}
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
                                toolGroupInitialized ? (
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
                                ) : (
                                    <div className="flex align-items-center">
                                        <i className="pi pi-spin pi-spinner mr-2"></i>
                                        <span>Initializing viewer tools...</span>
                                    </div>
                                )
                            }
                            end={
                                activeTab === 1 &&
                                selectedFolder?.predictedImagesURL && (
                                    <div className="flex gap-2">
                                        <Button label="Detection" severity="warning" />
                                        <Button label="Export Or Save" severity="help" onClick={handleViewExport} />
                                        <Button label="View Gif" severity="info" onClick={handleViewGif} />
                                    </div>
                                )
                            }
                        />
                    </div>
                    <div className="viewport-wrap overflow-y-auto relative">
                        <div className="h-viewport" ref={elementRef}></div>
                        {showOverlay && (
                            <div className="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center bg-black-alpha-50 z-5">
                                <div className="text-center">
                                    <i className="pi pi-image text-6xl mb-3 text-white"></i>
                                    <p className="text-white text-xl">Please select a folder or photo to see!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </SplitterPanel>
                <SplitterPanel size={10} minSize={5} className="p-2 flex-column">
                    <Messages ref={msgs} />
                </SplitterPanel>
            </Splitter>
            <Dialog header="GIF Preview" visible={showGifDialog} style={{ width: '50vw' }} onHide={() => setShowGifDialog(false)}>
                <div className="flex flex-column align-items-center">
                    {selectedFolder?.gifDownloadURL?.preview_link ? <Image src={selectedFolder.gifDownloadURL.preview_link} alt="GIF Preview" preview /> : <p>No GIF available</p>}
                    <Button label="Download Gif" className="mt-3" onClick={handleDownloadGif} />
                </div>
            </Dialog>
            <Dialog header="Export Preview" visible={ExportDialog} style={{ width: '50vw' }} onHide={() => setExportDialog(false)}>
                <PatientForm patientData={patientData} setPatientData={setPatientData} toastRef={toast} />
            </Dialog>
        </div>
    );
};

export default DCMViewer;
