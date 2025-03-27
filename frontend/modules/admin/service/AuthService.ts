import { api } from '../api/api';

interface DetailUser {
    user_code?: string;
    name?: string;
    dob?: string; // YYYY-MM-DD
    address?: string;
    gender?: number;
}

interface UpdateUserData {
    password?: string;
    roles?: string[];
    detail_user?: DetailUser;
}

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/auth';
    }

    async login(username: string, password: string): Promise<any> {
        try {
            const response = await api.post(`${this.baseUrl}/login`, { username, password }, { withCredentials: true });

            return response.data;
        } catch (error) {
            console.error('🚨 Error in AuthService.login:', error);
            throw error;
        }
    }

    async logout(refreshToken: string): Promise<any> {
        try {
            const response = await api.post(`${this.baseUrl}/logout`, { refreshToken });

            return response;
        } catch (error) {
            console.error('🚨 Error in AuthService.logout:', error);
            throw error;
        }
    }

    async getMe() {
        try {
            const response = await api.get(`${this.baseUrl}/me`);

            return response.data;
        } catch (error) {
            console.error('🚨 Error in AuthService.getMe:', error);
            throw error;
        }
    }

    async updateProfile(data: UpdateUserData) {
        try {
            const response = await api.put(`${this.baseUrl}/update-profile`, data);
            return response.data;
        } catch (error) {
            console.error('🚨 Error in AuthService.getMe:', error);
            throw error;
        }
    }

    async changeAvatar(file: File) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.put(`${this.baseUrl}/change-avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('🚨 Error in AuthService.getMe:', error);
            throw error;
        }
    }
}

// ✅ Xuất một instance thay vì class
export default new AuthService();
