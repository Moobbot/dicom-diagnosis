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

const PatientForm: React.FC<{ patientData: PatientData, setPatientData: React.Dispatch<React.SetStateAction<PatientData>> }> = ({ patientData, setPatientData }) => {
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const sexOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];

    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: keyof PatientData
    ) => {
        setPatientData({ ...patientData, [field]: e.target.value });
    };

    const validate = () => {
        let errs: Record<string, string> = {};
        if (!patientData.patient_id) errs.patient_id = "Patient ID is required";
        if (!patientData.name) errs.name = "Patient Patient Name is required";
        if (!patientData.group) errs.group = "Group is required";
        if (!patientData.collectFees) errs.collectFees = "collectFees is required";
        if (!patientData.sex) errs.sex = "Sex is required";
        if (!patientData.age) errs.age = "Valid Age is required";
        if (!patientData.address) errs.address = "Address is required";
        if (!patientData.diagnosis) errs.diagnosis = "Diagnosis is required";
        if (!patientData.general_conclusion) errs.general_conclusion = "General Conclusion is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        setLoading(true);
        console.log('Call Submit');
        console.log("Patient Data Save:", patientData);

        if (validate()) {
            try {
                console.log("Patient Data Save send:", patientData);
                const response = await PatientService.createPatient(patientData);

                // Kiểm tra phản hồi từ BE
                if (response.status === 201) {
                    showToast('success', 'Success', 'Save Patient success');
                } else {
                    showToast('warn', 'Warning', 'Patient saved, but unexpected response.');
                }
            } catch (error) {
                console.error('Error create patient', error);
                showToast('error', 'Error', 'Failed to save patient');
            }
        } else {
            showToast('warn', 'Validation Failed', 'Please check patient data');
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        console.log('Call Submit');

        if (validate()) {
            try {
                console.log("Patient Data Report:", patientData);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/sybil/generate-report`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(patientData),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to generate report");
                }

                // Lấy file DOCX từ API
                const blob = await response.blob();

                // Tạo link tải file
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");

                a.href = url;
                a.download = "Patient_Report.docx";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error create patient', error);
            }
        }
    };

    return (
        <Card title="Patient Information Form" className="p-4">
            <div className="p-fluid grid">
                <div className="input-wrap field col-12 md:col-6">
                    <label>Patient ID</label>
                    <InputText
                        value={patientData.patient_id}
                        onChange={(e) => handleChange(e, "patient_id")}
                        className={errors.patient_id ? "p-invalid" : ""}
                    />
                    {errors.patient_id && <small className="p-error">{errors.patient_id}</small>}
                </div>
                <div className="input-wrap field col-12 md:col-6">
                    <label>Patient Name</label>
                    <InputText
                        value={patientData.name}
                        onChange={(e) => handleChange(e, "name")}
                        className={errors.name ? "p-invalid" : ""}
                    />
                    {errors.name && <small className="p-error">{errors.name}</small>}
                </div>
                <div className="input-wrap field col-12 md:col-3">
                    <label>Group</label>
                    <InputText value={patientData.group} onChange={(e) => handleChange(e, "group")}
                        className={errors.group ? "p-invalid" : ""}
                    />
                    {errors.group && <small className="p-error">{errors.group}</small>}
                </div>
                <div className="input-wrap field col-12 md:col-3">
                    <label>Collect Fees</label>
                    <InputText value={patientData.collectFees} onChange={(e) => handleChange(e, "collectFees")}
                        className={errors.collectFees ? "p-invalid" : ""}
                    />
                    {errors.collectFees && <small className="p-error">{errors.collectFees}</small>}
                </div>
                <div className="input-wrap field col-6 md:col-3">
                    <label>Age</label>
                    <InputText
                        type="number"
                        value={patientData.age}
                        onChange={(e) => handleChange(e, "age")}
                        className={errors.age ? "p-invalid" : ""}
                    />
                    {errors.age && <small className="p-error">{errors.age}</small>}
                </div>
                <div className="input-wrap field col-6 md:col-3">
                    <label>Sex</label>
                    <Dropdown
                        value={patientData.sex}
                        options={sexOptions}
                        onChange={(e) => setPatientData({ ...patientData, sex: e.value })}
                        placeholder="Select"
                        className={errors.sex ? "p-invalid" : ""}
                    />
                    {errors.sex && <small className="p-error">{errors.sex}</small>}
                </div>
                <div className="input-wrap field col-12">
                    <label>Address</label>
                    <InputText
                        value={patientData.address}
                        onChange={(e) => handleChange(e, "address")}
                        className={errors.address ? "p-invalid" : ""}
                    />
                    {errors.address && <small className="p-error">{errors.address}</small>}
                </div>
                <div className="input-wrap field col-12">
                    <label>Initial Diagnosis or Chief Complain</label>
                    <InputTextarea
                        value={patientData.diagnosis}
                        onChange={(e) => handleChange(e, "diagnosis")}
                        className={errors.diagnosis ? "p-invalid" : ""}
                    />
                    {errors.diagnosis && <small className="p-error">{errors.diagnosis}</small>}
                </div>
                <div className="input-wrap field col-12">
                    <label>General Conclusion</label>
                    <InputTextarea
                        value={patientData.general_conclusion}
                        onChange={(e) => handleChange(e, "general_conclusion")}
                        className={errors.general_conclusion ? "p-invalid" : ""}
                    />
                    {errors.general_conclusion && <small className="p-error">{errors.general_conclusion}</small>}
                </div>
                <div className="col-12 flex">
                    <div className="col-6">
                        <Button label="Generate Report" icon="pi pi-file" onClick={handleSubmit} className="p-button-success" />
                    </div>
                    <div className="col-6">
                        <Button label="Save Patient" icon="pi pi-file" onClick={handleSave} className="p-button-primary" />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PatientForm;
