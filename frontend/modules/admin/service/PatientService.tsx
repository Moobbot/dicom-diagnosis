import { api } from './api';

class PatientService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/patients';
    }

    async createPatient(data: { patient_id: string; name: string; age: string; sex: string; address: string; diagnosis: string; general_conclusion: string; session_id: string }): Promise<any> {
        const response = await api.post(this.baseUrl, data);
        return response.data;
    }

    async getPatients(page: number, limit: number, search?: string): Promise<{ data: any[]; total: number; limit: number; pages: number }> {
        const response = await api.get(this.baseUrl, {
            params: { page, limit, search }
        });
        const { data, total, limit: responseLimit, pages } = response.data;
        return { data, total, limit: responseLimit, pages };
    }

    async deletePatient(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }
}

export default new PatientService();
