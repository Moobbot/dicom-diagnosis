import { api } from '../api/api';

class PermissionService {
    private baseUrl: string;
    constructor() {
        this.baseUrl = '/permissions';
    }

    async getPermissions(): Promise<any> {
        const response = await api.get(this.baseUrl);
        return response.data.data; // Return the data field from the response
    }

    async createPermission(name: string): Promise<any> {
        const response = await api.post(this.baseUrl, { name }, {});
        return response.data;
    }

    async updatePermission(id: string, description: string): Promise<any> {
        const response = await api.put(`${this.baseUrl}/${id}`, { description });
        return response.data;
    }
}

export default PermissionService;