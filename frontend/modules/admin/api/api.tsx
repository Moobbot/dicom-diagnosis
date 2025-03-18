import axios, { AxiosError } from 'axios';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // Timeout 10 giây
});

api.interceptors.request.use(
    (request) => {
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && !request.url?.includes('/auth/login')) {
                request.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config, response } = error;

        const status = response?.status;

        if (status === 401 && !config._retry && !config.url?.includes('/auth/login')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        config.headers['Authorization'] = `Bearer ${token}`;
                        return api(config);
                    })
                    .catch((err) => Promise.reject(err));
            }
            config._retry = true; // Thêm biến _retry vào config để tránh loop
            isRefreshing = true;

            try {
                console.log('Refreshing token...');

                const tokenData = await fetch('/api/auth', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const { refreshToken: oldRefreshToken } = await tokenData.json();

                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
                    refreshToken: oldRefreshToken
                });

                const { accessToken, refreshToken } = response.data;
                // console.log('New access token:', accessToken);

                localStorage.setItem('accessToken', accessToken);

                await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });

                api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                return api(config); // Thử lại request với accessToken mới
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                await fetch('/api/auth', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
