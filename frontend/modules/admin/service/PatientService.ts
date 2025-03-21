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
                },
                // Thêm timeout để tránh chờ quá lâu
                timeout: 10000
            });
            
            if (!response.data) {
                throw new Error('No data received from server');
            }

            if (!Array.isArray(response.data.data)) {
                throw new Error('Invalid data format');
            }

            if (response.data.data.length === 0) {
                throw new Error('No patient data found');
            }
            
            const { data, total, limit: responseLimit, pages } = response.data;

            // Kiểm tra từng bản ghi
            const validData = data.filter((record: any) => {
                if (!record || !record.session_id) {
                    console.warn('Skip invalid record:', record);
                    return false;
                }
                return true;
            });

            if (validData.length === 0) {
                throw new Error('No valid data');
            }
            
            return { 
                data: validData, 
                total: total || 0, 
                limit: responseLimit || validLimit, 
                pages: pages || 1 
            };
        } catch (error: any) {
            console.error('Error loading patient data:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Cannot load patient data. Please try again later.'
            );
        }
    }

    async deletePatient(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }
}

export default new PatientService();
