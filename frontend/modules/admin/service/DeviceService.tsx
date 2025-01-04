import axios from 'axios';
import { getCookie } from 'cookies-next';
import { Base } from '@/types';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class DeviceService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${NEXT_PUBLIC_API_BASE_URL}/devices`;
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

    async getDevices(page: number, limit: number): Promise<{ data: Base.DeviceData[], total: number }> {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: this.getAuthHeaders(),
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    }

    async createDevice(deviceData: Base.DeviceData): Promise<Base.DeviceData> {
        try {
            const response = await axios.post(this.baseUrl, deviceData, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error creating device:', error);
            throw error;
        }
    }
    
    async deleteDevice(_id: string): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${_id}`, { status: false }, {
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Error deleting device:', error);
            throw error;
        }
    }

    async modidfyDevice(_id: string): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${_id}`, { status: false }, {
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Error deleting device:', error);
            throw error;
        }
    }
}

export default new DeviceService();