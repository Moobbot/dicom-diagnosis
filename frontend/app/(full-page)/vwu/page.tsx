'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

// ✅ Import trực tiếp không dùng dynamic()
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

declare global {
    interface Window {
        __cornerstone_initialized?: boolean;
    }
}

const DICOMViewer = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    const renderingEngineRef = useRef<any>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [loadedImage, setLoadedImage] = useState<string | null>(null);

    const renderingEngineId = 'dicomRenderingEngine';
    const viewportId = 'dicomViewport';
    const toolGroupId = 'myToolGroup';

    useEffect(() => {
        if (typeof window === 'undefined') return; // Tránh lỗi SSR

        const { RenderingEngine, Enums } = cornerstone;
        const { ViewportType } = Enums;
        const { ZoomTool, PanTool, WindowLevelTool, StackScrollTool, ToolGroupManager } = cornerstoneTools;

        // ✅ Đảm bảo chỉ khởi tạo một lần duy nhất
        if (!window.__cornerstone_initialized) {
            cornerstone.init();
            cornerstoneDICOMImageLoader.init(); // Không cần kiểm tra isInitialized
            cornerstoneTools.init();
            window.__cornerstone_initialized = true; // Đánh dấu đã khởi tạo
        }

        const renderingEngine = new RenderingEngine(renderingEngineId);
        renderingEngineRef.current = renderingEngine;


        // ✅ Tạo Rendering Engine
        renderingEngine.enableElement({
            viewportId,
            type: ViewportType.STACK,
            element: elementRef.current!,
        });

        // ✅ Kiểm tra xem ToolGroup đã tồn tại chưa, nếu chưa mới tạo
        let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
        if (!toolGroup) {
            toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

            cornerstoneTools.addTool(ZoomTool);
            cornerstoneTools.addTool(PanTool);
            cornerstoneTools.addTool(WindowLevelTool);
            cornerstoneTools.addTool(StackScrollTool);
            if (toolGroup) {

                toolGroup.addTool(ZoomTool.toolName);
                toolGroup.addTool(PanTool.toolName);
                toolGroup.addTool(WindowLevelTool.toolName);
                toolGroup.addTool(StackScrollTool.toolName);

                toolGroup.setToolActive(StackScrollTool.toolName, {
                    bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }],
                });

                toolGroup.addViewport(viewportId, renderingEngineId);
            }
        }
    }, []);

    const loadImage = async () => {
        if (!imageUrl) {
            console.warn('❌ Không có URL ảnh DICOM');
            return;
        }

        console.log('🔹 imageUrl:', imageUrl);

        const viewport = renderingEngineRef.current?.getViewport(viewportId);
        if (!viewport) {
            console.error('❌ Viewport không tìm thấy!');
            return;
        }

        try {
            // ✅ Thêm kiểm tra URL
            const dicomImageId = `wadouri:${imageUrl}`;
            console.log('✅ dicomImageId:', dicomImageId);

            // ✅ Kiểm tra xem loader có support URL không
            if (!cornerstoneDICOMImageLoader.wadouri) {
                console.error('❌ DICOM Image Loader không hỗ trợ wadouri');
                return;
            }

            // ✅ Kiểm tra trạng thái của viewport trước khi load
            console.log('🟡 Viewport trước khi load:', viewport);

            // ✅ Clear cache trước khi load ảnh mới (tránh lỗi ảnh không cập nhật)
            cornerstone.cache.purgeCache();

            // ✅ Load ảnh vào viewport
            await viewport.setStack([dicomImageId]);
            viewport.setImageIdIndex(0);

            // ✅ Đảm bảo viewport có ảnh trước khi render
            const loadedImage = viewport.getCurrentImageId();
            if (!loadedImage) {
                console.error('❌ Không thể lấy ảnh từ viewport!');
                return;
            }
            console.log('🟡 Metadata:', viewport.csImage);

            viewport.render();
            console.log('✅ Ảnh DICOM đã load thành công!');

            setLoadedImage(dicomImageId);
        } catch (error) {
            console.error('❌ Lỗi tải ảnh DICOM:', error);
        }
    };

    return (
        <div className="flex flex-column h-screen w-full p-4">
            {/* Input URL */}
            <div className="flex gap-2 mb-4">
                <InputText
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Nhập URL ảnh DICOM..."
                    className="p-inputtext-lg w-full"
                />
                <Button label="Load Image" icon="pi pi-image" onClick={loadImage} />
            </div>

            {/* Viewer */}
            <div className="flex-1 border p-2">
                <div className="h-full w-full flex justify-center items-center" ref={elementRef}>
                    {!loadedImage ? (
                        <p>❌ Không thể load ảnh. Kiểm tra URL hoặc console log để xem chi tiết.</p>
                    ) : (
                        <p>✅ Ảnh đã load thành công!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DICOMViewer;