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
                throw new Error('Không nhận được dữ liệu từ server');
            }

            if (!Array.isArray(response.data.data)) {
                throw new Error('Dữ liệu không đúng định dạng');
            }

            if (response.data.data.length === 0) {
                throw new Error('Không tìm thấy dữ liệu bệnh nhân');
            }
            
            const { data, total, limit: responseLimit, pages } = response.data;

            // Kiểm tra từng bản ghi
            const validData = data.filter((record: any) => {
                if (!record || !record.session_id) {
                    console.warn('Bỏ qua bản ghi không hợp lệ:', record);
                    return false;
                }
                return true;
            });

            if (validData.length === 0) {
                throw new Error('Không có dữ liệu hợp lệ');
            }
            
            return { 
                data: validData, 
                total: total || 0, 
                limit: responseLimit || validLimit, 
                pages: pages || 1 
            };
        } catch (error: any) {
            console.error('Lỗi khi tải dữ liệu bệnh nhân:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Không thể tải dữ liệu bệnh nhân. Vui lòng thử lại sau.'
            );
        }
    }

    async deletePatient(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }
}

export default new PatientService();
