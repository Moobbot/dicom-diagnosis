'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useUser } from '../../../../layout/context/usercontext';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import { getCookie } from 'cookies-next/client';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const { setUser } = useUser();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden');

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            const response = await axios.post(`${NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                username,
                password
            }, {
                withCredentials: true,
            });

            if (response.data.success) {
                const data = response.data;

                // Lưu cookie
                setCookie('accessToken', data.accessToken, { maxAge: 60 * 5 });
                setCookie('permissions', JSON.stringify(data.data.permissions), { maxAge: 60 * 60 * 24 });
                setCookie('grantAll', data.data.grantAll, { maxAge: 60 * 60 * 24 });

                const refreshToken = getCookie('refreshToken');
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken as string);
                }

                localStorage.setItem('avatar', data.data.detail_user.avatar);

                setUser(data.data.user);

                router.push('/');
            } else {
                const detailMessage = response.data.message === 'User does not exist' ? 'Người dùng không tồn tại' :
                    response.data.message === 'Invalid credentials' ? 'Tên đăng nhập hoặc mật khẩu không chính xác' :
                        'Đăng nhập thất bại';

                toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: detailMessage });
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Đã xảy ra lỗi, vui lòng thử lại sau' });
        }
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <img
                                src={avatar ?? '/layout/images/logo.png'}
                                alt="logo"
                                className="mb-3"
                                style={{ height: '80px', width: '80px', borderRadius: '50%' }}
                            />
                            <div className="text-900 text-3xl font-medium mb-3">Welcome!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>
                        <div>
                            <label htmlFor="username1" className="block text-900 text-xl font-medium mb-2">
                                Username
                            </label>
                            <InputText id="username1" type="text" placeholder="Username" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} value={username} onChange={(e) => setUsername(e.target.value)} />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <Button label="Sign In" className="w-full p-3 text-xl" onClick={handleLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
