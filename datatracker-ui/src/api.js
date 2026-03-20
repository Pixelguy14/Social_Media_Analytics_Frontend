import axios from 'axios';

// SECURITY: Base URL loaded from environment to avoid leaking internal
// network topology (IPs, ports) into version control.
// NOTE: In Vite/React SPAs, these variables are BAKED IN at build time.
// If you change an environment variable on your VPS (Docker host),
// you MUST rebuild the container for the frontend to see the changes.
if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error(
        '[API] Missing VITE_API_BASE_URL environment variable. ' +
        'Copy .env.example to .env and set it.'
    );
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// SECURITY: The JWT is stored in localStorage for simplicity here.
// BEST PRACTICE: Move to Cookies with HttpOnly and Secure flags.
// - HttpOnly: Prevents JavaScript (and thus XSS) from reading the cookie.
// - Secure: Ensures the cookie is only sent over HTTPS.
// These flags must be set by the Go backend (Set-Cookie header).
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
        if (error.response) {
            if (error.response.status === 401) {
                // Auto-logout if waiting on 401
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('storage'));
            } else if (error.response.status === 403) {
                // Handle 403 Forbidden (UI Masking vs Security)
                // The frontend must gracefully handle cases where the user tries to access restricted APIs
                import('sweetalert2').then((Swal) => {
                    Swal.default.fire({
                        title: 'Access Denied',
                        text: 'You do not have permission to perform this action.',
                        icon: 'error',
                        confirmButtonColor: '#424242'
                    });
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;

