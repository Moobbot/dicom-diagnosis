import { getCookie } from 'cookies-next';
import axios from 'axios';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class KeyService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = `${NEXT_PUBLIC_API_BASE_URL}/keys`;
    }

    private getAuthHeaders() {
        const token = getCookie('accessToken'); 
        if (!token) {
            console.error('No token found in cookies');
            throw new Error('No token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getKeys(page: number, limit: number) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: { page, limit },
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch keys:', error);
            throw error;
        }
    }

    async createKeys(quantity: number) {
        try {
            const response = await axios.post(this.baseUrl, { quantity }, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create keys:', error);
            throw error;
        }
    }
}

export default new KeyService();