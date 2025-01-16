import { api } from './api';
import axios from 'axios';
import { Base } from '@/types';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';

class UserService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/users';
    }

    async getUsers(page: number, limit: number): Promise<{ data: any[]; total: number; limit: number; pages: number }> {
        const response = await api.get(this.baseUrl, {
            params: { page, limit }
        });
        const { data, total, limit: responseLimit, pages } = response.data;
        return { data, total, limit: responseLimit, pages };
    }

    async getUserById(_id: string): Promise<any> {
        const response = await api.get(`${this.baseUrl}/${_id}`);
        return response.data;
    }

    async createUser(user: { username: string; roles: Base.Role[]; password: string; detail_user: { user_code: string; name: string; birth_date: string; address: string; gender: string } }): Promise<any> {
        const roles = user.roles.map((role) => role._id);
        const userData = { ...user, roles, detail_user: user.detail_user };
        // console.log('Creating user with data:', userData);
        const response = await api.post(this.baseUrl, userData);
        // console.log('Response from server:', response.data);
        return response.data;
    }

    async addRoleToUser(userId: string, roles: string): Promise<any> {
        const response = await api.patch(`${this.baseUrl}/${userId}/add-role`, { roles });
        return response.data;
    }

    async deleteRoleFromUser(userId: string, roles: string): Promise<any> {
        const response = await api.patch(`${this.baseUrl}/${userId}/delete-role`, { roles });
        return response.data;
    }

    async changeUserStatus(_id: string, status: boolean): Promise<any> {
        const response = await api.put(`${this.baseUrl}/${_id}/change-status`, { status });
        return response.data;
    }

    async updateUser(userId: string, userData: { name?: string; password?: string; roles?: string[] }): Promise<any> {
        const response = await api.put(`${this.baseUrl}/${userId}`, userData);
        return response.data.data;
    }

    async changeManyUserStatus(userIds: string[], status: boolean): Promise<any> {
        const response = await api.post(`${this.baseUrl}/change-many-status`, { userIds, status });
        return response.data;
    }
}

export default UserService;
