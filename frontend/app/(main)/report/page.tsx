'use client';

// React imports
import React, { useState, useRef, useEffect, useCallback } from 'react';

// PrimeReact components
import { Toast } from 'primereact/toast';

// Icons
import PatientForm from '@/layout/forms/PatientForm';

const DCMViewer: React.FC<DCMViewerProps> = ({ selectedFolder }) => {
    const toast = useRef<Toast>(null);

    const [patientData, setPatientData] = useState<PatientData>({
        patient_id: "1111",
        group: "test_group",
        collectFees: "test_collectFees",
        name: "Test",
        age: "8",
        sex: "Male",
        address: "???",
        diagnosis: "",
        general_conclusion: "",
        session_id: "952e1a42-6e1f-44c9-b0da-fc3f70da1adb",
        file_name: ["slice_125.dcm", "slice_126.dcm", "slice_127.dcm"],
        forecast_index: [],
    });

    return (
        <div className="w-full h-full">
            <PatientForm patientData={patientData} setPatientData={setPatientData} />
        </div>
    );
};

export default DCMViewer;
