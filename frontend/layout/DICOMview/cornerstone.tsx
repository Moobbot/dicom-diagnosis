'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import * as cornerstone from '@cornerstonejs/core';
import { RenderingEngine, Enums, type Types } from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { ZoomTool, PanTool, WindowLevelTool, StackScrollTool, LengthTool } from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
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
}

interface DCMViewerProps {
    selectedFolder: FolderType | null;
}

const DCMViewer: React.FC<DCMViewerProps> = ({ selectedFolder }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const toast = useRef<Toast>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const renderingEngineRef = useRef<RenderingEngine | null>(null);
    const toolGroupRef = useRef<cornerstoneTools.Types.IToolGroup | null>(null);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    const renderingEngineId = 'myRenderingEngine';
    const viewportId = 'CT_VIEWPORT';
    const toolGroupId = 'ctToolGroup';
    const [activeTool, setActiveTool] = useState<string | null>(null);

    useEffect(() => {
        const initializeViewer = async () => {
            await cornerstone.init();
            await cornerstoneTools.init();
            await cornerstoneDICOMImageLoader.init({ maxWebWorkers: 1 });

            // Initialize Rendering Engine
            const renderingEngine = new RenderingEngine(renderingEngineId);
            renderingEngineRef.current = renderingEngine;

            // Setup viewport
            renderingEngine.enableElement({
                viewportId,
                type: Enums.ViewportType.STACK,
                element: elementRef.current!,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.SAGITTAL,
                },
            });

            // Get viewport and tool group
            const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

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

            viewport.render();
        };

        initializeViewer();

        // // Cleanup function
        // return () => {
        //     if (renderingEngineRef.current) {
        //         renderingEngineRef.current.destroy();
        //         renderingEngineRef.current = null;
        //     }
        //     if (toolGroupRef.current) {
        //         cornerstoneTools.ToolGroupManager.destroyToolGroup(toolGroupId);
        //         toolGroupRef.current = null;
        //     }
        // };
    }, []);

    useEffect(() => {
        if (selectedFolder && renderingEngineRef.current) {
            const viewport = renderingEngineRef.current.getViewport(viewportId) as Types.IStackViewport;
            if (!viewport) {
                console.warn("Viewport not found!");
                return;
            }

            viewport.setStack(selectedFolder.imageIds);
            viewport.render();
        }
    }, [selectedFolder]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleImageClick = useCallback((imageId: string) => {
        const viewport = renderingEngineRef.current?.getViewport(viewportId) as Types.IStackViewport;

        if (viewport) {
            try {
                // Load ảnh mới lên viewport
                if (selectedFolder) {
                    viewport.setImageIdIndex(selectedFolder.imageIds.indexOf(imageId));
                    setSelectedImageId(imageId);
                } else {
                    showToast('error', 'Error', 'No folder selected.');
                }

                viewport.render();
                showToast('info', 'Image Loaded', 'Selected image has been loaded successfully.');
            } catch (error) {
                console.error('Error loading selected image:', error);
                showToast('error', 'Image Load Failed', 'Failed to load selected image.');
            }
        } else {
            showToast('error', 'Error', 'No active viewport found.');
        }
    }, [selectedFolder, viewportId]);


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

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Toast ref={toast} />

            {/* File Preview Panel */}
            <div className="border-right-1">
                {selectedFolder && (
                    <div className="overflow-y-auto h-full">
                        {selectedFolder.imageIds.map((imageId, index) => (
                            <div
                                key={index}
                                onClick={() => handleImageClick(imageId)}
                                className={`cursor-pointer p-3 border-1 border-200 border-round hover:surface-200 ${selectedImageId === imageId ? 'bg-bluegray-400' : ''
                                    }`}
                            >
                                <i className="pi pi-file text-2xl" />
                                <span className="ml-2">{selectedFolder.files[index]?.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tools and Viewer Panel */}
            <div className="flex-1 flex flex-column">
                {/* Toolbar */}
                <div className="p-4 border-bottom-1">
                    <Toolbar
                        className="p-3"
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
                    />
                </div>

                {/* DICOM Viewer */}
                <div className="flex-1 p-4">
                    <div className="h-full flex align-items-center justify-content-center" ref={elementRef}></div>
                    {!selectedFile && <div className="h-full flex align-items-center justify-content-center text-500">Select a file to view</div>}
                </div>
            </div>
        </div>
    );
};

export default DCMViewer;