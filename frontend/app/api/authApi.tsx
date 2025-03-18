import AuthService from '@/modules/admin/service/AuthService';
import { deleteCookie, getCookie } from 'cookies-next';

// ✅ **Hàm xóa toàn bộ dữ liệu trên client**
const clearClientStorage = () => {
    console.log('🗑 Clearing all authentication data...');

    // Xóa cookies từ phía client (chỉ áp dụng với non-HttpOnly cookies)
    ['accessToken', 'refreshToken', 'permissions', 'grantAll'].forEach((cookie) => deleteCookie(cookie));

    // Xóa LocalStorage & SessionStorage
    localStorage.clear();
    sessionStorage.clear();
};

const getAuthHeaders = () => {
    const token = getCookie('token'); // 🔄 Đảm bảo tên token đúng

    if (!token) {
        console.warn('⚠ No token found in Cookie. Skipping authentication headers.');
        return null; // ✅ Trả về `null` thay vì throw error
    }

    return {
        Authorization: `Bearer ${token}`
    };
};

export const login = async (username: string, password: string) => {
    // Gọi login từ AuthService
    const response_data = await AuthService.login(username, password);
    return response_data;
};

export const logout = async (refreshToken: string) => {
    try {
        // 1️⃣ Gọi API logout từ backend
        const response = await AuthService.logout(refreshToken);
    } catch (error) {
        console.error('🚨 Error during logout:', error);
        clearClientStorage();

        setTimeout(() => {
            window.location.replace('/auth/login');
        }, 3000); // 3000ms = 3 giây
    }
};
