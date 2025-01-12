'use client';
import React, { use, useContext, useEffect, useRef, useState } from 'react';
import { FileUpload, FileUploadHandlerEvent, ItemTemplateOptions } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import * as dwv from 'dwv';
import { set } from 'date-fns';
import { Tag } from 'primereact/tag';

interface PredictionResponse {
    data: {
        predictions: any;
    };
    metadata: Record<string, any>; // Freeform JSON object
    message: string | null; // Informational or error message
    statusCode: number; // HTTP status code (e.g., 200, 400, 500)
    runtime: string; // Runtime formatted as a string (e.g., "123.45s")
}

const Dashboard: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useRef<Toast | null>(null);
    const [app, setApp] = useState<dwv.App | null>(null);
    const fileUploadRef = useRef<FileUpload | null>(null);

    useEffect(() => {
        const app = new dwv.App();
        const viewConfig0 = new dwv.ViewConfig('layerGroup0');
        const viewConfigs = { '*': [viewConfig0] };
        const options = new dwv.AppOptions(viewConfigs);
        options.tools = {
            Draw: {
                options: ['Rectangle']
            }
        };
        app.init(options);
        app.addEventListener('load', function () {
            app.setTool('Draw');
            app.setToolFeatures({ shapeName: 'Rectangle' });
        });

        setApp(app);
    }, []);

    const onImageSelect = (event: FileUploadHandlerEvent): void => {
        const file = event.files[0];
        if (file) {
            if (selectedFile) {
                app?.reset();
            }
            setSelectedFile(file);
            app?.loadFiles([file]);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Image uploaded successfully',
                life: 3000
            });
        }
    };

    const handlePredict = async (): Promise<void> => {
        if (!selectedFile) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please select an file first',
                life: 3000
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('dicom', selectedFile);
            formData.append('return_attentions', 'true');

            const response = await fetch('/dicom/files', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const result: PredictionResponse = await response.json();
                throw new Error(result.message || 'Failed to process image');
            }

            const result: PredictionResponse = await response.json();
            setPredictionResult(result);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Prediction completed',
                life: 3000
            });
        } catch (error) {
            console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Failed to process image',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const emptyTemplate: React.FC = () => (
        <div className="flex align-items-center flex-column">
            <i
                className="pi pi-image mt-3 p-5"
                style={{
                    fontSize: '5em',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-b)',
                    color: 'var(--surface-d)'
                }}
            ></i>
            <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }}>Kéo và thả file DICOM vào đây</span>
        </div>
    );

    const headerTemplate: React.FC = (options: any) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        return (
            <div className={className}>
                <div className="flex gap-2">
                    {chooseButton}
                    <Button label="Predict" icon="pi pi-check" onClick={handlePredict} loading={loading} disabled={!selectedFile || loading} />
                </div>
                <div className="flex gap-2">
                    {uploadButton}
                    {cancelButton}
                </div>
            </div>
        );
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        setSelectedFile(null);
        app?.reset();
        callback();
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as File;
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
            </div>
        );
    };

    return (
        <div className="grid w-full">
            <Toast ref={toast} />
            <div className="col-12 xl:col-8">
                <div className="card overflow-hidden">
                    <div className="flex flex-column gap-4">
                        <FileUpload
                            ref={fileUploadRef}
                            accept=".dcm"
                            maxFileSize={10000000}
                            mode="advanced"
                            customUpload
                            uploadHandler={onImageSelect}
                            auto
                            chooseLabel="Chọn ảnh"
                            headerTemplate={headerTemplate}
                            emptyTemplate={emptyTemplate}
                            itemTemplate={itemTemplate}
                        />
                        {selectedFile && <div id="layerGroup0"></div>}
                    </div>
                </div>
            </div>
            <div className="col-12 xl:col-4">
                <div className="card">
                    <h5>Kết quả dự đoán</h5>
                    {loading && (
                        <div className="flex justify-content-center">
                            <ProgressSpinner />
                        </div>
                    )}
                    {!loading && predictionResult && (
                        <div className="flex flex-column gap-3">
                            {predictionResult.data.predictions[0][0].map((value: number, index: number) => (
                                <div>
                                    <strong>Năm {index + 1}:</strong> {value}
                                </div>
                            ))}
                            <div>
                                <strong>Thời gian chạy:</strong> {predictionResult.runtime}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
