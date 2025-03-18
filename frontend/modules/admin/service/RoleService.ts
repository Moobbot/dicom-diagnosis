import { getCookie } from 'cookies-next';
import { api } from './api';

class RoleService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = '/roles';
    }

    async getRoles(page?: number, limit?: number): Promise<any> {
        const response = await api.get(this.baseUrl, {
            params: { page, limit }
        });
        return response.data;
    }
    async createRole(name: string): Promise<any> {
        const response = await api.post(this.baseUrl, { name });
        return response.data;
    }
    async changeRoleStatus(roleId: string, status: boolean): Promise<any> {
        const response = await api.put(`${this.baseUrl}/${roleId}/change-status`, { status });
        return response.data;
    }
    async updateRole(roleId: string, data: { name?: string; permissions?: string[]; grantAll?: boolean }): Promise<any> {
        const response = await api.put(`${this.baseUrl}/${roleId}`, data);
        return response.data;
    }
}

export default RoleService;
