import { api } from './api';

class PatientService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/patients';
    }

    async createPatient(data: { patient_id: string; group: string; collectFees: string; name: string; age: string; sex: string; address: string; diagnosis: string; general_conclusion: string; session_id: string }): Promise<any> {
        const response = await api.post(this.baseUrl, data);
        return response.data;
    }
}

export default new PatientService();
