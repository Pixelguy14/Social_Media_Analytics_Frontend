import axios from 'axios';

// SECURITY: Base URL loaded from environment to avoid leaking internal
// network topology (IPs, ports) into version control.
if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error(
        '[API] Missing VITE_API_BASE_URL environment variable. ' +
        'Copy .env.example to .env and set it.'
    );
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// SECURITY: The JWT is stored in localStorage for simplicity. This means
// any successful XSS attack can steal it. The CSP meta tag in index.html
// is the primary mitigation. For production, migrate to httpOnly cookies
// set by the Go backend (Set-Cookie: HttpOnly; Secure; SameSite=Strict).
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
            window.dispatchEvent(new Event('storage'));
        }
        return Promise.reject(error);
    }
);

export default api;

