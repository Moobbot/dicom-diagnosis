'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import '@/styles/dicom/report.scss';
import PatientService from '@/modules/admin/service/PatientService';

interface PatientData {
    patient_id: string;
    group: string;
    collectFees: string;
    name: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion: string;
    session_id: string;
    file_name: string[];
    forecast_index: {
        index_0: string;
        index_1: string;
        index_2: string;
        index_3: string;
        index_4: string;
    };
}

const PatientForm: React.FC<PatientPredict> = ({ selectedFileName, session_id }) => {
    const [patient, setPatient] = useState<PatientData>(() => ({
        patient_id: '',
        group: '',
        collectFees: '',
        name: '',
        age: '',
        sex: '',
        address: '',
        diagnosis: '',
        general_conclusion: '',
        session_id: session_id || '',
        file_name: [],
        forecast_index: {
            index_0: '',
            index_1: '',
            index_2: '',
            index_3: '',
            index_4: ''
        }
    }));
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const sexOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof PatientData) => {
        setPatient({ ...patient, [field]: e.target.value });
    };

    const validate = () => {
        let errs: Record<string, string> = {};
        if (!patient.patient_id) errs.patientId = 'Patient ID is required';
        if (!patient.name) errs.name = 'Patient Name is required';
        if (!patient.age) errs.age = 'Valid Age is required';
        if (!patient.sex) errs.sex = 'Sex is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCheckboxChange = (filename: string) => {
        setPatient((prevState) => {
            const updatedFiles = prevState.file_name.includes(filename) ? prevState.file_name.filter((file) => file !== filename) : [...prevState.file_name, filename];
            return { ...prevState, file_name: updatedFiles };
        });
    };
    const handleSubmit = async () => {
        setLoading(true);
        console.log('Call Submit');

        if (validate()) {
            try {
                console.log(patient);
                await PatientService.createPatient(patient);

                // const response = await fetch(
                //     `${process.env.NEXT_PUBLIC_API_BASE_URL}/generate-report`,
                //     {
                //         method: "POST",
                //         headers: { "Content-Type": "application/json" },
                //         body: JSON.stringify(patient),
                //     }
                // );

                // if (!response.ok) {
                //     throw new Error("Failed to generate report");
                // }

                // const blob = await response.blob();
                // const url = window.URL.createObjectURL(blob);
                // const a = document.createElement("a");
                // a.href = url;
                // a.download = "Patient_Report.docx";
                // document.body.appendChild(a);
                // a.click();
                // document.body.removeChild(a);
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
                    <InputText value={patient.patient_id} onChange={(e) => handleChange(e, 'patient_id')} className={errors.patientId ? 'p-invalid' : ''} />
                    {errors.patientId && <small className="p-error">{errors.patientId}</small>}
                </div>
                <div className="input-wrap field col-12 md:col-6">
                    <label>Patient Name</label>
                    <InputText value={patient.name} onChange={(e) => handleChange(e, 'name')} className={errors.name ? 'p-invalid' : ''} />
                    {errors.name && <small className="p-error">{errors.name}</small>}
                </div>

                <div className="input-wrap field col-12 md:col-3">
                    <label>Group</label>
                    <InputText value={patient.group} onChange={(e) => handleChange(e, 'group')} />
                </div>
                <div className="input-wrap field col-12 md:col-3">
                    <label>Collect Fees</label>
                    <InputText value={patient.collectFees} onChange={(e) => handleChange(e, 'collectFees')} />
                </div>
                <div className="input-wrap field col-6 md:col-3">
                    <label>Age</label>
                    <InputText type="number" value={patient.age} onChange={(e) => handleChange(e, 'age')} className={errors.age ? 'p-invalid' : ''} />
                    {errors.age && <small className="p-error">{errors.age}</small>}
                </div>
                <div className="input-wrap field col-6 md:col-3">
                    <label>Sex</label>
                    <Dropdown value={patient.sex} options={sexOptions} onChange={(e) => setPatient({ ...patient, sex: e.value })} placeholder="Select" className={errors.sex ? 'p-invalid' : ''} />
                    {errors.sex && <small className="p-error">{errors.sex}</small>}
                </div>

                <div className="input-wrap field col-12">
                    <label>Address</label>
                    <InputText value={patient.address} onChange={(e) => handleChange(e, 'address')} />
                </div>

                <div className="input-wrap field col-12">
                    <label>Initial Diagnosis or Chief Complain</label>
                    <InputText value={patient.diagnosis} onChange={(e) => handleChange(e, 'diagnosis')} />
                </div>

                <div className="col-12">
                    <Button label="Generate Report" icon="pi pi-file" onClick={handleSubmit} className="p-button-success" />
                </div>
            </div>
        </Card>
    );
};

export default PatientForm;
