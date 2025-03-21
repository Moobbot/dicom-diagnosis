import { api } from './api';
import { PatientData } from '@/types/lcrd';

class PatientService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/patients';
    }

    async createPatient(data: {
        patient_id: string;
        name: string;
        age: string;
        sex: string;
        address?: string | null;
        diagnosis?: string | null;
        general_conclusion?: string | null;
        session_id: string
    }): Promise<any> {
        const response = await api.post(this.baseUrl, data);
        return response.data;
    }

    updatePatient = async (id: string, data: PatientData) => {
        const response = await api.put(`${this.baseUrl}/${id}`, data);
        return response.data;
    };

    async getPatients(page: number, limit: number, search?: string): Promise<{ data: any[]; total: number; limit: number; pages: number }> {
        try {
            // Đảm bảo page và limit là số dương
            const validPage = Math.max(1, page);
            const validLimit = Math.max(1, limit);
            
            const response = await api.get(this.baseUrl, {
                params: { 
                    page: validPage,
                    limit: validLimit,
                    ...(search && search.trim() !== '' ? { search: search.trim() } : {})
                }
            });
            
            const { data, total, limit: responseLimit, pages } = response.data;
            return { data, total, limit: responseLimit, pages };
        } catch (error: any) {
            console.log('Error fetching patients:', error.response?.data || error.message);
            throw error;
        }
    }

    async deletePatient(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }
}

export default new PatientService();
