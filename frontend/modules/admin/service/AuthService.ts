import { api } from '../api/api';

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
}

// ✅ Xuất một instance thay vì class
export default new AuthService();