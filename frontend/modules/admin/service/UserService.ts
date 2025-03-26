import axios from 'axios';
import { api } from '../api/api';
import { Base } from '@/types';

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

    async createUser(user: { username: string; roles: Base.Role[]; password: string; detail_user: { user_code: string; name: string; dob: string; address: string; gender: string; avatar: string } }): Promise<any> {
        const roles = user.roles.map((role) => role._id);
        const userData = { ...user, roles, detail_user: user.detail_user };
        console.log('Request data:', JSON.stringify(userData, null, 2)); // Log dữ liệu gửi đi với định dạng đẹp

        try {
            const response = await api.post(this.baseUrl, userData);
            console.log('Response data:', JSON.stringify(response.data, null, 2)); // Log phản hồi từ server với định dạng đẹp
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Lỗi từ server:', JSON.stringify(error.response.data, null, 2)); // Log chi tiết lỗi từ server
            } else {
                console.error('Lỗi tạo người dùng:', error);
            }
            throw error;
        }
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

    async updateUser(userId: string, userData: { name?: string; password?: string; roles?: string[]; user_code?: string }): Promise<any> {
        try {
            // Trước tiên, lấy thông tin đầy đủ của user hiện tại
            const currentUserResponse = await this.getUserById(userId);
            const currentUser = currentUserResponse.data || currentUserResponse;

            // Tạo đối tượng cập nhật với cấu trúc phù hợp
            const updateData: any = {
                roles: userData.roles || currentUser.roles.map((role: any) => role._id)
            };

            // Nếu có password và không rỗng, thêm vào request
            if (userData.password && userData.password.trim() !== '') {
                updateData.password = userData.password;
            }

            // Cập nhật detail_user với các trường cần thiết
            updateData.detail_user = {
                ...currentUser.detail_user,
                name: userData.name || currentUser.detail_user.name,
                user_code: userData.user_code || currentUser.detail_user.user_code
            };

            console.log('Cập nhật người dùng với dữ liệu:', JSON.stringify(updateData, null, 2));

            // Gửi yêu cầu cập nhật với tham số preserveFields=true để giữ các trường khác
            const response = await api.put(`${this.baseUrl}/${userId}`, updateData, {
                params: { preserveFields: true }
            });

            console.log('Phản hồi cập nhật:', JSON.stringify(response.data, null, 2));

            // Kết hợp dữ liệu hiện tại với dữ liệu mới từ response
            const updatedUser = {
                ...currentUser,
                ...(response.data.data || response.data),
                detail_user: {
                    ...currentUser.detail_user,
                    ...((response.data.data || response.data).detail_user || {})
                }
            };

            return updatedUser;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Lỗi cập nhật người dùng:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Lỗi cập nhật người dùng:', error);
            }
            throw error;
        }
    }

    async changeManyUserStatus(userIds: string[], status: boolean): Promise<any> {
        const response = await api.post(`${this.baseUrl}/change-many-status`, { userIds, status });
        return response.data;
    }
}

export default UserService;