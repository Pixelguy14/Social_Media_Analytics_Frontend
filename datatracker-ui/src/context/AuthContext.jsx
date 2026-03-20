/* eslint-disable */
// SECURITY: JWT and user data are stored in localStorage for persistence.
// This is vulnerable to XSS — any injected script can read these values.
// Mitigations in place:
//   1. CSP meta tag in index.html blocks unauthorized script sources
//   2. React's JSX auto-escapes all rendered user content
//   3. The user object is sanitized below before storage (sensitive fields stripped)
// For production hardening, migrate JWT to httpOnly cookies set by the backend.
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Initialize Auth State from LocalStorage
    useEffect(() => {
        const initAuth = () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                try {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();

        // Listen for storage events (multi-tab sync)
        window.addEventListener('storage', initAuth);
        return () => window.removeEventListener('storage', initAuth);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/users/login', { email, password });
            const { token: newToken, user: userData } = res.data;

            saveAuth(newToken, userData);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Login failed'
            };
        }
    };

    // Password strength validation
    function validatePassword(password) {
        const minLength = 8;

        // \p{Lu} matches any Unicode uppercase letter
        // \d matches any digit
        const hasUppercase = /\p{Lu}/u.test(password);
        const hasNumber = /\d/.test(password);
        const isLongEnough = password.length >= minLength;

        return hasUppercase && hasNumber && isLongEnough;
    }

    const register = async (name, email, username, password) => {
        try {
            // SECURITY: Frontend validation is purely for UX.
            // Malicious actors can bypass this using Postman/cURL.
            // The backend MUST perform the same (or stricter) validation.
            if (!validatePassword(password)) {
                return {
                    success: false,
                    error: 'Password must be at least 8 characters long and contain at least one number and one uppercase letter.'
                };
            }
            // 1. Create User
            await api.post('/users/', { name, username, email, password });

            // 2. Auto-login
            return await login(email, password);
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        window.location.href = '/'; // Simple redirect to clear any sensitive state
    };

    // SECURITY: Sanitize server response before persisting to localStorage.
    // Only keep fields the UI actually needs — strip passwordHash, internal IDs, etc.
    // BEST PRACTICE: Move to HttpOnly and Secure cookies via the backend.
    const sanitize_user_data = (raw) => {
        if (!raw) return null;
        const { passwordHash, password, __v, ...safe } = raw;
        return safe;
    };

    const saveAuth = (newToken, userData) => {
        const safeUser = sanitize_user_data(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(safeUser));
        setToken(newToken);
        setUser(safeUser);
    };

    const refreshProfile = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/users/${user.id}`);
            const updatedUser = sanitize_user_data(res.data);

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            console.error("Failed to refresh profile", err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            saveAuth,  // Exposed for manual updates if needed (e.g., profile edit)
            refreshProfile
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
