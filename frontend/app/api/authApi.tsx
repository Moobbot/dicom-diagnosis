import { env } from "@/config/env.config";
import { getCookie } from "cookies-next";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
    const token = getCookie('token');

    if (!token) {
        console.error('No token found in Cookie');
        throw new Error('No token found');
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const login = async () => {
    // Login implementation here
};

export const logout = async () => {
    try {
        // Get authorization headers
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        };

        // Send a POST request to the backend logout endpoint
        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers,
            credentials: 'include',
        });

        // Parse the response
        const result = await response.json();

        if (response.ok && result.success) {
            console.log(result.message);

            // Perform any additional frontend cleanup here
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');

            // Redirect the user to the login page or homepage
            window.location.href = '/auth/login';
        } else {
            console.error('Logout failed:', result.message);
        }
    } catch (error) {
        console.error('An error occurred during logout:', error);
    }
};
