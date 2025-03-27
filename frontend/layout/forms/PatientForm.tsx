'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import '@/styles/dicom/report.scss';
import PatientService from '@/modules/admin/service/PatientService';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import { PatientData } from '@/types/lcrd';

const PatientForm: React.FC<{
    patientData: PatientData;
    setPatientData: React.Dispatch<React.SetStateAction<PatientData>>;
    toastRef: React.RefObject<Toast>;
    reloadFolders?: () => Promise<void>;
    onClose?: () => void;
}> = ({ patientData, setPatientData, toastRef, reloadFolders, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [isExistingPatient, setIsExistingPatient] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const sexOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        console.log(`🔔 Toast called - ${severity}: ${summary} - ${detail}`);
        if (toastRef?.current) {
            toastRef.current.show({ severity, summary, detail, life: 5000 });
        } else {
            console.log('❌ Toast component not found!');
        }
    };

    useEffect(() => {
        // Kiểm tra nếu có _id thì là bệnh nhân đã tồn tại
        console.log('Patient Data id:', patientData._id);
        if (patientData._id) {
            setIsExistingPatient(true);
        }
    }, [patientData._id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof PatientData) => {
        setPatientData({ ...patientData, [field]: e.target.value });
        // Nếu thay đổi patient_id, cập nhật trạng thái isExistingPatient
        if (field === 'patient_id') {
            setIsExistingPatient(false);
        }
    };

    const validate = () => {
        let errs: Record<string, string> = {};
        if (!patientData.patient_id) errs.patient_id = 'Patient ID is required';
        if (!patientData.name) errs.name = 'Patient Name is required';
        if (!patientData.sex) errs.sex = 'Sex is required';
        if (!patientData.age) errs.age = 'Valid Age is required';
        // if (!patientData.attentent) errs.attentent = 'Attentent is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        setLoading(true);
        console.log('Call Submit');
        console.log('Patient Data Save:', patientData);

        const dataToSave = {
            ...patientData,
            // attentent: patientData.attentent || 'N/A',
        };

        if (!validate()) {
            showToast('warn', 'Validation Failed', 'Please check patient data');
            setLoading(false);
            return;
        }

        try {
            console.log('Patient Data Save send:', dataToSave);
            let response;
            console.log('Patient Data id:', dataToSave._id);
            if (dataToSave._id) {
                response = await PatientService.updatePatient(dataToSave._id, dataToSave);
            } else {
                response = await PatientService.createPatient(dataToSave);
            }
            console.log(response);

            if (response.status || response.status === 201 || response.status === 200) {
                // Cập nhật patientData với dữ liệu mới từ server
                if (response.data) {
                    setPatientData(response.data);
                    setIsExistingPatient(true);
                }

                showToast('success', 'Success', dataToSave._id ? 'Update Patient success' : 'Save Patient success');
                
                // Đóng dialog trước
                if (onClose) {
                    onClose();
                }

                // Đợi một chút để đảm bảo session được cập nhật
                setTimeout(async () => {
                    if (reloadFolders) {
                        await reloadFolders();
                    }
                }, 500);
            } else {
                showToast('warn', 'Warning', `Patient ${dataToSave._id ? 'updated' : 'saved'}, but unexpected response: ${response.status}`);
            }
        } catch (error: any) {
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Unknown error from server';
                showToast('error', 'Error', errorMessage);
                console.log('🔍 Full response from API:', error.response);
            } else if (error.request) {
                console.log('❌ No response received from server:', error.request);
                showToast('error', 'Error', 'No response from server');
            } else {
                console.log('❌ Unexpected error:', error);
                showToast('error', 'Error', 'Unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        console.log('Call Generate Report');
        console.log('Patient Data Report:', patientData);

        if (!validate()) {
            showToast('warn', 'Validation Failed', 'Please check patient data');
            setLoading(false);
            return;
        }
        console.log('Patient Data Report:', patientData);

        try {

            // Đóng dialog và đợi session được cập nhật
            if (onClose) {
                onClose();
            }

            // Đợi một chút để session được cập nhật
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/generate-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0'
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('❌ API Error:', errorData);
                showToast('error', 'Error', errorData.message || 'Failed to generate report');
                throw new Error(errorData.message || `Failed: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toLocaleString('vi-VN').replace(/[/:]/g, '-');
            const patientName = patientData.name || 'Unknown';
            a.href = url;
            a.download = `Patient_Report_${patientName}_${timestamp}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showToast('success', 'Success', 'Report generated successfully');

            // Reload folders sau khi hoàn tất
            if (reloadFolders) {
                await reloadFolders();
            }
        } catch (error: any) {
            console.log('Error generating report:', error?.response?.data?.message);
            showToast('error', 'Error', error?.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Patient Information Form" className="p-4">
            {loading && (
                <div className="loading-overlay">
                    <ProgressSpinner />
                </div>
            )}
            <div className={`p-fluid grid ${loading ? 'disabled-form' : ''}`}>
                <div className="input-wrap field col-12 md:col-6">
                    <label>Patient ID</label>
                    <InputText value={patientData.patient_id} onChange={(e) => handleChange(e, 'patient_id')} className={errors.patient_id ? 'p-invalid' : ''} />
                    {errors.patient_id && <small className="p-error">{errors.patient_id}</small>}
                </div>
                <div className="input-wrap field col-12 md:col-6">
                    <label>Patient Name</label>
                    <InputText value={patientData.name} onChange={(e) => handleChange(e, 'name')} className={errors.name ? 'p-invalid' : ''} />
                    {errors.name && <small className="p-error">{errors.name}</small>}
                </div>
                <div className="input-wrap field col-6 md:col-3">
                    <label>Age</label>
                    <InputText type="number" value={patientData.age} onChange={(e) => handleChange(e, 'age')} className={errors.age ? 'p-invalid' : ''} />
                    {errors.age && <small className="p-error">{errors.age}</small>}
                </div>
                <div className="input-wrap field col-6 md:col-3">
                    <label>Sex</label>
                    <Dropdown value={patientData.sex} options={sexOptions} onChange={(e) => setPatientData({ ...patientData, sex: e.value })} placeholder="Select" className={errors.sex ? 'p-invalid' : ''} />
                    {errors.sex && <small className="p-error">{errors.sex}</small>}
                </div>
                <div className="input-wrap field col-12 md:col-6">
                    <label>Address</label>
                    <InputText value={patientData.address || ''} onChange={(e) => handleChange(e, 'address')} className={errors.address ? 'p-invalid' : ''} />
                    {errors.address && <small className="p-error">{errors.address}</small>}
                </div>
                <div className="input-wrap field col-12">
                    <label>Initial Diagnosis or Chief Complain</label>
                    <InputTextarea value={patientData.diagnosis || ''} onChange={(e) => handleChange(e, 'diagnosis')} className={errors.diagnosis ? 'p-invalid' : ''} />
                    {errors.diagnosis && <small className="p-error">{errors.diagnosis}</small>}
                </div>
                <div className="input-wrap field col-12">
                    <label>General Conclusion</label>
                    <InputTextarea value={patientData.general_conclusion || ''} onChange={(e) => handleChange(e, 'general_conclusion')} className={errors.general_conclusion ? 'p-invalid' : ''} />
                    {errors.general_conclusion && <small className="p-error">{errors.general_conclusion}</small>}
                </div>
                {/* <div className="input-wrap field col-12">
                    <label>Attentent</label>
                    <InputTextarea value={patientData.attentent || ''} onChange={(e) => handleChange(e, 'attentent')} className={errors.attentent ? 'p-invalid' : ''} />
                    {errors.attentent && <small className="p-error">{errors.attentent}</small>}
                </div> */}
                <div className="col-12 flex">
                    <div className="col-6">
                        <div className="wrap-report-button">
                            <Button
                                onClick={handleGenerateReport}
                                icon="pi pi-file"
                                className="p-button-success"
                                disabled={loading}
                                label="Generate Report"
                                aria-label="Generate Report"
                                data-pr-tooltip="Generate Report"
                            />
                        </div>
                        <Tooltip target=".wrap-report-button" content="Generate patient report. You must select a DICOM file first." mouseTrack mouseTrackLeft={10} />
                    </div>
                    <div className="col-6">
                        <div className="wrap-save-button">
                            <Button label={isExistingPatient ? 'Update Patient' : 'Save Patient'} icon="pi pi-file" onClick={handleSave} className="p-button-primary" disabled={loading} />
                        </div>
                        <Tooltip target=".wrap-save-button" content={isExistingPatient ? 'Update patient information' : 'Save new patient'} mouseTrack mouseTrackLeft={10} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PatientForm;
