import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api',
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors like 401 Unauthorized
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Auto-logout if waiting on 401
            localStorage.removeItem('token');
            // Optional: Redirect to login or just let the UI handle the empty token
            window.dispatchEvent(new Event('storage')); // Trigger a storage event so other tabs/components might react
        }
        return Promise.reject(error);
    }
);

export default api;
