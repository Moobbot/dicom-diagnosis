import { api } from './api';

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/auth';
    }

    async login(username: string, password: string): Promise<any> {
        const response = await api.post(`${this.baseUrl}/login`, {
            username,
            password
        });

        return response.data;
    }

    async logout(refreshToken: string): Promise<any> {
        await api.post(`${this.baseUrl}/logout`, {
            refreshToken
        });
    }
}

export default AuthService;
