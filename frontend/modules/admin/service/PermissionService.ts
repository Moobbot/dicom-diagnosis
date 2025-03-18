import { getCookie } from 'cookies-next';
import { api } from './api';

class PermissionService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = '/permissions';
    }

    async getPermissions(page?: number, limit?: number): Promise<any> {
        const response = await api.get(this.baseUrl, {
            params: { page, limit }
        });
        return response.data;
    }
    async createPermission(name: string): Promise<any> {
        const response = await api.post(this.baseUrl, { name }, {});
        return response.data;
    }
}

export default PermissionService;
