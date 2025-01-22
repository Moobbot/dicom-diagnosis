'use client';
import React, { useState, useRef, useEffect, use } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import * as cornerstone from '@cornerstonejs/core';
import { RenderingEngine, Enums, type Types, volumeLoader } from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { ZoomTool, PanTool, WindowLevelTool, StackScrollTool, LengthTool } from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { TiZoom } from 'react-icons/ti';
import { CiRuler } from 'react-icons/ci';
import { IoIosMove } from 'react-icons/io';
import { ImContrast } from 'react-icons/im';
import { RiResetLeftFill } from 'react-icons/ri';
import { set } from 'date-fns';

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

interface DCMViewerProps {
    selectedFolder: FolderType | null;
}

type ToolName = 'Length' | 'Zoom' | 'Pan' | 'WindowLevel' | null;

const DCMViewer: React.FC<DCMViewerProps> = ({ selectedFolder }) => {
    const [selectedFile, setSelectedFile] = useState<PreviewFile | null>(null);
    const toast = useRef<Toast>(null);
    const renderingEngineId = 'myRenderingEngine';
    const [renderingEngine, setRenderingEngine] = useState<RenderingEngine | null>(null);
    const viewportId = 'CT';
    const [viewport, setViewport] = useState<Types.IStackViewport | null>(null);
    const [toolGroup, setToolGroup] = useState<cornerstoneTools.Types.IToolGroup | null>(null);
    const toolGroupId = 'ctToolGroup';
    const [activeTool, setActiveTool] = useState<ToolName>(null);
    const [currentStackIndex, setCurrentStackIndex] = useState<number>(0);

    const elementRef = useRef<HTMLDivElement>(null);
    const running = useRef(false);

    useEffect(() => {
        const setup = async () => {
            if (running.current) {
                return;
            }
            running.current = true;

            await cornerstone.init();
            await cornerstoneTools.init();
            await cornerstoneDICOMImageLoader.init({
                maxWebWorkers: 1
            });

            // Instantiate a rendering engine
            const renderingEngine = new RenderingEngine(renderingEngineId);
            setRenderingEngine(renderingEngine);

            const viewportInput = {
                viewportId,
                type: Enums.ViewportType.STACK,
                element: elementRef.current,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.SAGITTAL
                }
            };

            // @ts-ignore
            renderingEngine.enableElement(viewportInput);

            const vp = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
            setViewport(vp);

            // ZoomTool, PanTool, WindowLevelTool, StackScrollTool, LengthTool
            cornerstoneTools.addTool(ZoomTool);
            cornerstoneTools.addTool(PanTool);
            cornerstoneTools.addTool(WindowLevelTool);
            cornerstoneTools.addTool(StackScrollTool);
            cornerstoneTools.addTool(LengthTool);
            const ctToolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);

            ctToolGroup?.addTool(ZoomTool.toolName);
            ctToolGroup?.addTool(PanTool.toolName);
            ctToolGroup?.addTool(WindowLevelTool.toolName);
            ctToolGroup?.addTool(StackScrollTool.toolName);
            ctToolGroup?.addTool(LengthTool.toolName);

            ctToolGroup?.addViewport(viewportId, renderingEngineId);

            ctToolGroup?.setToolActive(LengthTool.toolName, {
                bindings: [{ mouseButton: 1 }]
            });

            ctToolGroup?.setToolDisabled(LengthTool.toolName);
            ctToolGroup?.setToolActive(StackScrollTool.toolName, {
                bindings: [
                    {
                        mouseButton: 524288
                    }
                ]
            });

            // @ts-ignore
            setToolGroup(ctToolGroup);
        };

        setup();
    }, [elementRef, running]);

    useEffect(() => {
        if (selectedFolder) {
            viewport?.setStack(selectedFolder.imageIds);
            setCurrentStackIndex(0);

            viewport?.render();
        }
    }, [selectedFolder]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleToolClick = (toolName: ToolName) => {
        if (!toolGroup) return;

        // If clicking the active tool, deactivate it
        if (activeTool === toolName) {
            switch (toolName) {
                case 'Length':
                    toolGroup.setToolDisabled(LengthTool.toolName);
                    break;
                case 'Zoom':
                    toolGroup.setToolDisabled(ZoomTool.toolName);
                    break;
                case 'Pan':
                    toolGroup.setToolDisabled(PanTool.toolName);
                    break;
                case 'WindowLevel':
                    toolGroup.setToolDisabled(WindowLevelTool.toolName);
                    break;
            }
            setActiveTool(null);
            return;
        }

        // Deactivate current tool if any
        if (activeTool) {
            switch (activeTool) {
                case 'Length':
                    toolGroup.setToolDisabled(LengthTool.toolName);
                    break;
                case 'Zoom':
                    toolGroup.setToolDisabled(ZoomTool.toolName);
                    break;
                case 'Pan':
                    toolGroup.setToolDisabled(PanTool.toolName);
                    break;
                case 'WindowLevel':
                    toolGroup.setToolDisabled(WindowLevelTool.toolName);
                    break;
            }
        }

        // Activate new tool
        switch (toolName) {
            case 'Length':
                toolGroup.setToolActive(LengthTool.toolName, {
                    bindings: [{ mouseButton: 1 }]
                });
                break;
            case 'Zoom':
                toolGroup.setToolActive(ZoomTool.toolName, {
                    bindings: [{ mouseButton: 1 }]
                });
                break;
            case 'Pan':
                toolGroup.setToolActive(PanTool.toolName, {
                    bindings: [{ mouseButton: 1 }]
                });
                break;
            case 'WindowLevel':
                toolGroup.setToolActive(WindowLevelTool.toolName, {
                    bindings: [{ mouseButton: 1 }]
                });
                break;
        }
        setActiveTool(toolName);
    };

    const handleReset = () => {
        if (!viewport || !toolGroup) return;

        try {
            // Reset the viewport to its initial state
            viewport.reset();

            // Reset camera position and zoom
            viewport.resetCamera();

            // Reset window level to default
            // viewport.resetWindowLevel();

            // Disable active tool if any
            if (activeTool) {
                switch (activeTool) {
                    case 'Length':
                        toolGroup.setToolDisabled(LengthTool.toolName);
                        break;
                    case 'Zoom':
                        toolGroup.setToolDisabled(ZoomTool.toolName);
                        break;
                    case 'Pan':
                        toolGroup.setToolDisabled(PanTool.toolName);
                        break;
                    case 'WindowLevel':
                        toolGroup.setToolDisabled(WindowLevelTool.toolName);
                        break;
                }
                setActiveTool(null);
            }

            // Re-render the viewport
            viewport.render();

            toast.current?.show({
                severity: 'success',
                summary: 'Reset Success',
                detail: 'View has been reset to default',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Reset Failed',
                detail: 'Failed to reset view',
                life: 3000
            });
        }
    };

    const selectFile = (file: File) => {
        if (file.name !== selectedFile?.name) {
            const preview: PreviewFile = {
                id: Date.now().toString(),
                name: file.name,
                url: URL.createObjectURL(file),
                imageId: cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)
            };
            setSelectedFile(preview);
            const fileIndex = selectedFolder?.files.findIndex((f) => f.name === file.name);
            if (fileIndex === -1) return;

            // Set current stack index
            // @ts-ignore
            setCurrentStackIndex(fileIndex);
            // @ts-ignore
            viewport?.setImageIdIndex(fileIndex);
            showToast('info', 'File Selected', `Selected file: ${file.name}`);
        }

        viewport?.setImageIdIndex;
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Toast ref={toast} />

            {/* Middle panel - File Preview (15%) */}
            <div className="w-[15%] p-4 border-right-1">
                {selectedFolder && (
                    <div className="overflow-y-auto h-full">
                        {selectedFolder.files.map((file, index) => (
                            <div
                                key={index}
                                onClick={() => selectFile(file)}
                                className={`cursor-pointer p-3 border-round hover:surface-200
                  ${selectedFile?.name === file.name ? 'surface-200' : ''}`}
                            >
                                <i className="pi pi-file text-2xl" />
                                <span className="ml-2">{file.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right panel - Tools and Viewer (70%) */}
            <div className="flex-1 flex flex-column">
                {/* Tools */}
                <div className="p-4 border-bottom-1">
                    <Toolbar
                        className="p-3"
                        start={
                            <div className="flex gap-2">
                                <Button rounded severity={activeTool === 'Length' ? 'success' : 'secondary'} onClick={() => handleToolClick('Length')} className={activeTool === 'Length' ? 'shadow-4' : ''}>
                                    <CiRuler />
                                </Button>
                                <Button rounded severity={activeTool === 'Zoom' ? 'success' : 'secondary'} onClick={() => handleToolClick('Zoom')} className={activeTool === 'Zoom' ? 'shadow-4' : ''}>
                                    <TiZoom />
                                </Button>
                                <Button rounded severity={activeTool === 'Pan' ? 'success' : 'secondary'} onClick={() => handleToolClick('Pan')} className={activeTool === 'Pan' ? 'shadow-4' : ''}>
                                    <IoIosMove />
                                </Button>
                                <Button rounded severity={activeTool === 'WindowLevel' ? 'success' : 'secondary'} onClick={() => handleToolClick('WindowLevel')} className={activeTool === 'WindowLevel' ? 'shadow-4' : ''}>
                                    <ImContrast />
                                </Button>
                                <Button rounded onClick={() => handleReset()} className="shadow-4">
                                    <RiResetLeftFill />
                                </Button>
                            </div>
                        }
                    />
                </div>

                {/* Viewer */}
                <div className="flex-1 p-4">
                    <div className="h-full flex align-items-center justify-content-center" ref={elementRef}></div>
                    {!selectedFile && <div className="h-full flex align-items-center justify-content-center text-500">Select a file to view</div>}
                </div>
            </div>
        </div>
    );
};

export default DCMViewer;
