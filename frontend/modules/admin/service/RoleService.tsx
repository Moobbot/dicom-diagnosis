import { getCookie } from 'cookies-next';
import axios from 'axios';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class RoleService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = `${NEXT_PUBLIC_API_BASE_URL}/roles`;
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
    async getRoles(page: number, limit: number): Promise<any> {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: this.getAuthHeaders(),
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }
    async createRole(name: string): Promise<any> {
        try {
            const response = await axios.post(this.baseUrl, { name }, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }
    async changeRoleStatus(roleId: string, status: boolean): Promise<any> {
        try {
            const response = await axios.put(`${this.baseUrl}/${roleId}/change-status`, { status }, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error changing role status:', error);
            throw error;
        }
    }
    async updateRole(roleId: string, data: { name?: string; permissions?: string[]; grantAll?: boolean }): Promise<any> {
        try {
            const response = await axios.put(`${this.baseUrl}/${roleId}`, data, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }
}

export default RoleService;