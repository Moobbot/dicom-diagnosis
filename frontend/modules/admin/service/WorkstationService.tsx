import axios from 'axios';
import { getCookie } from 'cookies-next';
import { Base } from '@/types';
import { log } from 'console';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class WorkstationService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${NEXT_PUBLIC_API_BASE_URL}/workstations`;
    }

    private getAuthHeaders() {
        const token = getCookie('accessToken');
        if (!token) {
            console.error('No token found in Cookie');
            throw new Error('No token found');
        }
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getWorkstations(): Promise<{ data: Base.WorkstationData[], success: boolean }> {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: this.getAuthHeaders()
            });
            
            return response.data.data;
        } catch (error) {
            console.error('Error fetching workstations:', error);
            throw error;
        }
    }
    async updateWorkstation(_id: string, name: string, path: string): Promise<{ message: string, success: boolean, data: Base.WorkstationData }> {
        try {
            const response = await axios.put(`${this.baseUrl}/${_id}`, {
                name: name,
                path: path
            }, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error updating workstation:', error);
            throw error;
        }
    }
    async createWorkstation(_id: string, data: Partial<Base.WorkstationData>): Promise<{ message: string, success: boolean }> {
        try {
            const response = await axios.put(`${this.baseUrl}/${_id}`, data, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error creating workstation:', error);
            throw error;
        }
    }

    async deleteWorkstation(_id: string, data: Partial<Base.WorkstationData>): Promise<{ message: string, success: boolean }> {
        try {
            const response = await axios.put(`${this.baseUrl}/${_id}`, data, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting workstation:', error);
            throw error;
        }
    }
}

export default new WorkstationService();