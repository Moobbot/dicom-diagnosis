import { api } from '@/modules/admin/api/api';

// Types
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

export const getMe = async () => {
    try {
        const response = await api.get('/auth/me');
        console.log('User fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('An error occurred while fetching user:', error);
        throw error;
    }
};

export const getUserById = async (id: string) => {
    try {
        const response = await api.get(`/users/${id}`);
        console.log('User fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('An error occurred while fetching user:', error);
        throw error;
    }
};

export const updateUser = async (data: UpdateUserData) => {
    try {
        const response = await api.put(`/auth/update-profile`, data);
        console.log('User updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('An error occurred while updating user:', error);
        throw error;
    }
};
export const changeAvatar = async (file: File): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.put('/auth/change-avatar', formData);
        return response.data;
    } catch (error: any) {
        console.error('Error in changeAvatar:', error);
        throw error;
    }
}; 