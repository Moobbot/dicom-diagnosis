// 'use client';

// import VWUViewer from '@/layout/DICOMview/VWUViewer';

// export default function Page() {
//     return <VWUViewer />;
// }

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import * as cornerstone from '@cornerstonejs/core';
// import { RenderingEngine } from '@cornerstonejs/core';

declare global {
    interface Window {
        __cornerstone_initialized?: boolean;
    }
}

const VWUViewer = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    const renderingEngineRef = useRef<any>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [loadedImage, setLoadedImage] = useState<string | null>(null);

    const renderingEngineId = 'dicomRenderingEngine';
    const viewportId = 'dicomViewport';

    useEffect(() => {
        const initCornerstone = async () => {
            if (typeof window !== 'undefined' && !window.__cornerstone_initialized) {
                const cornerstoneDICOMImageLoader = await import('@cornerstonejs/dicom-image-loader');
                // cornerstoneDICOMImageLoader.convertColorSpace
                await cornerstone.init();
                await cornerstoneDICOMImageLoader.init();

                // ✅ Đăng ký image loader với Cornerstone (wadouri)
                cornerstone.registerImageLoader('wadouri', (imageId: string, options?: any) => {
                    const loadObject = cornerstoneDICOMImageLoader.wadouri.loadImage(imageId, options);
                    return {
                        promise: loadObject.promise.then((image: any) => {
                            return image as unknown as Record<string, unknown>;
                        }),
                        cancelFn: loadObject.cancelFn,
                        decache: loadObject.decache,
                    };
                });

                window.__cornerstone_initialized = true;
            }

            // ✅ Khởi tạo Rendering Engine
            const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
            renderingEngineRef.current = renderingEngine;

            // ✅ Tạo Rendering Engine - ✅ Kích hoạt viewport
            renderingEngine.enableElement({
                viewportId,
                type: cornerstone.Enums.ViewportType.STACK,
                element: elementRef.current!,
            });
        };
        initCornerstone();

    }, []);

    const loadImage = async () => {
        if (!imageUrl) {
            console.warn('❌ No DICOM image URL');
            return;
        }

        console.log('🔹 imageUrl:', imageUrl);

        const renderingEngine = renderingEngineRef.current;
        if (!renderingEngine) {
            console.error('❌ Rendering Engine not initialized!');
            return;
        }

        const viewport = renderingEngine?.getViewport(viewportId);
        if (!viewport) {
            console.error('❌ Viewport not found!');
            return;
        }

        try {
            const cornerstoneDICOMImageLoader = await import('@cornerstonejs/dicom-image-loader');
            // ✅ Thêm kiểm tra URL
            const dicomImageId = `wadouri:${imageUrl}`;
            console.log('✅ dicomImageId:', dicomImageId);

            // ✅ Clear cache trước khi load ảnh mới (tránh lỗi ảnh không cập nhật)
            cornerstone.cache.purgeCache();

            // ✅ Load ảnh vào viewport
            await viewport.setStack([dicomImageId]);
            viewport.setImageIdIndex(0);

            // ✅ Đợi ảnh load xong
            await new Promise((resolve) => setTimeout(resolve, 500));

            const csImage = viewport.getCornerstoneImage();
            if (!csImage) {
                console.error('❌ Cannot get image from viewport!');
                return;
            }

            console.log('📸 DICOM image loaded:', csImage);

            // ✅ Đợi ảnh load xong
            await new Promise((resolve) => setTimeout(resolve, 500));
            viewport.render();
            console.log('✅ Viewport after update:', viewport);

            console.log('✅ DICOM image loaded successfully!');
            setLoadedImage(dicomImageId);
            console.log('🟡 dicomImageId:', dicomImageId);
        } catch (error) {
            console.error('❌ Error loading DICOM image:', error);
        }
    };

    return (
        <div className="flex flex-column h-screen w-full p-4">
            {/* Input URL */}
            <div className="flex gap-2 mb-4">
                <InputText
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter DICOM image URL..."
                    className="p-inputtext-lg w-full"
                />
                <Button label="Load Image" icon="pi pi-image" onClick={loadImage} />
            </div>

            {/* Viewer */}
            <div className="flex-1 border p-2">
                <div className="h-full w-full flex justify-center items-center" ref={elementRef}>
                    {!loadedImage ? (
                        <p>❌ Cannot load image. Check URL or console log for details.</p>
                    ) : (
                        <p>✅ Image loaded successfully!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VWUViewer;