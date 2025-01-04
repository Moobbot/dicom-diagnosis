import { getCookie } from 'cookies-next';
import axios from 'axios';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class PermissionService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = `${NEXT_PUBLIC_API_BASE_URL}/permissions`;
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
    async getPermissions(page: number, limit: number): Promise<any> {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: this.getAuthHeaders(),
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }
    }
    async createPermission(name: string): Promise<any> {
        try {
            const response = await axios.post(this.baseUrl, { name }, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error creating permission:', error);
            throw error;
        }
    }
}

export default PermissionService;