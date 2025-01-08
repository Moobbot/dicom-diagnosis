import { api } from './api';

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/auth';
    }

    async login(username: string, password: string): Promise<any> {
        const response = await api.post(
            `${this.baseUrl}/login`,
            {
                username,
                password
            },
            { withCredentials: true }
        );

        return response.data;
    }

    async logout(): Promise<any> {
        const response = await api.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });

        return response.data;
    }
}

export default AuthService;
