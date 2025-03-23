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
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (request) => {
        if (typeof window !== 'undefined' && !request.url?.includes('/auth/login')) {
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

// Response interceptor for auth and retry logic
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config, response } = error;

        // Handle retry logic first
        if (config && config.retry && (!config._retryCount || config._retryCount < config.retry)) {
            config._retryCount = config._retryCount || 0;
            config._retryCount += 1;

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
            return api(config);
        }

        // Handle authentication errors
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
            config._retry = true;
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

                return api(config);
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
