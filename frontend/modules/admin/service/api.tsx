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
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (request) => {
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
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

        if (status === 401 && !config._retry) {
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
                const response = await api.post('/auth/refresh-token', {}, { withCredentials: true });
                const { accessToken } = response.data;
                // console.log('New access token:', accessToken);

                localStorage.setItem('accessToken', accessToken);

                api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                return api(config); // Thử lại request với accessToken mới
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
