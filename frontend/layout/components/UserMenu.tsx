import { useRouter } from 'next/navigation';
import React from 'react';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { Button } from 'primereact/button';
import { logout } from '@/app/api/authApi';
import UserService from '../../modules/admin/service/UserService';
import AuthService from '@/modules/admin/service/AuthService';
import { useUserContext } from '../context/usercontext';

const UserMenu = () => {
    const router = useRouter();
    const authService = new AuthService();
    const { user } = useUserContext();

    const handleLogout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('accessToken');
            window.location.href = 'auth/login';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                background: '#fff',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                width: '220px',
                zIndex: 1000,
                overflow: 'hidden',
                fontFamily: 'Arial, sans-serif'
            }}
        >
            <div
                style={{
                    padding: '12px 16px',
                    background: '#f0f0f0',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '1px solid #ddd'
                }}
            >
                Tài khoản của bạn
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li
                    style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f9f9f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    <img src={user?.detail_user.avatar || 'frontend/public/layout/images/logo.svg'} alt="User Information" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <a href="/user-info" style={{ textDecoration: 'none', color: '#333' }}>
                        Thông tin người dùng
                    </a>
                </li>
                <li
                    style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#ff4d4f',
                        fontWeight: 'bold',
                        transition: 'background 0.3s ease, color 0.3s ease'
                    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#ffe5e5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    Đăng xuất
                </li>
            </ul>
        </div>
    );
};

export default UserMenu;
