import axios from 'axios';
import { Base } from '@/types';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import router from 'next/router';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class UserService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${NEXT_PUBLIC_API_BASE_URL}/users`;
    }

    private getAuthHeaders() {
        const token = getCookie('accessToken');

        if (!token) {
            console.error('No token found in Cookie');
            throw new Error('No token found');
        }
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getUsers(page: number, limit: number): Promise<{ data: any[]; total: number; limit: number; pages: number }> {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: this.getAuthHeaders(),
                params: { page, limit }
            });
            const { data, total, limit: responseLimit, pages } = response.data;
            return { data, total, limit: responseLimit, pages };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getUserById(_id: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/${_id}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async createUser(user: { username: string; roles: Base.Role[]; password: string; detail_user: { user_code: string; name: string; birth_date: string; address: string; gender: string } }): Promise<any> {
        try {
            const roles = user.roles.map((role) => role._id);
            const userData = { ...user, roles, detail_user: user.detail_user };
            console.log('Creating user with data:', userData);
            const response = await axios.post(this.baseUrl, userData, {
                headers: this.getAuthHeaders()
            });
            console.log('Response from server:', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error response:', error.response?.data);
            } else {
                console.error('Error creating user:', error);
            }
            throw error;
        }
    }

    async addRoleToUser(userId: string, roles: string): Promise<any> {
        try {
            const response = await axios.patch(
                `${this.baseUrl}/${userId}/add-role`,
                { roles },
                {
                    headers: this.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error adding role to user:', error);
            throw error;
        }
    }

    async deleteRoleFromUser(userId: string, roles: string): Promise<any> {
        try {
            const response = await axios.patch(
                `${this.baseUrl}/${userId}/delete-role`,
                { roles },
                {
                    headers: this.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting role from user:', error);
            throw error;
        }
    }

    async changeUserStatus(_id: string, status: boolean): Promise<any> {
        try {
            const response = await axios.put(
                `${this.baseUrl}/${_id}/change-status`,
                { status },
                {
                    headers: this.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error changing user status:', error);
            throw error;
        }
    }

    async updateUser(userId: string, userData: { name?: string; password?: string; roles?: string[] }): Promise<any> {
        try {
            const response = await axios.put(`${this.baseUrl}/${userId}`, userData, {
                headers: this.getAuthHeaders()
            });
            return response.data.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async changeManyUserStatus(userIds: string[], status: boolean): Promise<any> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/change-many-status`,
                { userIds, status },
                {
                    headers: this.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error changing user status:', error);
            throw error;
        }
    }
    static async logout(): Promise<void> {
        try {
            const token = getCookie('accessToken');
            if (!token) {
                console.error('No token found in cookies');
                return;
            }
            const response = await axios.post(`${NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.status === 200) {
                console.log('Logout successful');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    static async refreshToken(): Promise<void> {
        try {
            const response = await axios.post(`${NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {}, {
                withCredentials: true, // Chỉ gửi cookie
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 50000
            });

            if (response.data.success) {
                const newAccessToken = response.data.accessToken;
                // Save the access token in a cookie
                setCookie('accessToken', newAccessToken, { sameSite: 'strict' });
                console.log('Token refreshed successfully');
            } else {
                console.error('Failed to refresh token:', response.data.message);
                // Clear cookies and redirect to login page
                this.handleTokenRefreshFailure();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            // Clear cookies and redirect to login page
            this.handleTokenRefreshFailure();
        }
    }

    private static handleTokenRefreshFailure() {
        deleteCookie('accessToken');
    }
}

export default UserService;
