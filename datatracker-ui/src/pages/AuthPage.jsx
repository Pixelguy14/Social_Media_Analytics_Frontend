import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const { login, register } = useAuth();
    const [authMode, setAuthMode] = useState('login');
    const [loading, setLoading] = useState(false);

    const { register: registerForm, handleSubmit, formState: { errors } } = useForm();

    const onAuthSubmit = async (data) => {
        setLoading(true);
        let result;

        if (authMode === 'login') {
            result = await login(data.email, data.password);
        } else {
            result = await register(data.username, data.email, data.password);
        }

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: authMode === 'login' ? 'Welcome back!' : 'Account Created!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Failed',
                text: result.error
            });
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
            <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-lg">
                <h2
                    id="login-heading"
                    className="
                    text-2xl font-bold text-center mb-4 
                    focus:outline-none
                    hover:text-blue-600
                    transition-colors duration-300 ease-in-out">
                    {authMode === 'login' ? 'Login' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit(onAuthSubmit)} className="space-y-4">

                    {/* Register (username, email, password)*/}
                    {/* Login (email, password)*/}

                    {authMode === 'register' && (
                        <div>
                            <label
                                id="username-label"
                                htmlFor="username"
                                className="
                                block text-sm font-medium 
                                text-gray-700
                                focus:outline-none  
                                hover:text-blue-600 
                                transition-colors duration-300 ease-in-out">
                                Username
                            </label>

                            <input
                                id="username-input"
                                {...registerForm('username', { required: 'Username is required' })}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                        </div>
                    )}

                    <div>
                        <label
                            id="email-label"
                            htmlFor="email"
                            className="
                                block text-sm font-medium 
                                text-gray-700
                                focus:outline-none  
                                hover:text-blue-600 
                                transition-colors duration-300 ease-in-out">Email</label>
                        <input
                            id="email-input"
                            type="email"
                            {...registerForm('email', { required: 'Email is required' })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label
                            id="password-label"
                            htmlFor="password"
                            className="
                                block text-sm font-medium 
                                text-gray-700
                                focus:outline-none  
                                hover:text-blue-600 
                                transition-colors duration-300 ease-in-out">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            {...registerForm('password', { required: 'Password is required' })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                    </div>

                    <button
                        type="submit"
                        id="submit-button"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        id="toggle-auth-mode"
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="text-sm text-blue-600 hover:text-blue-500 hover:underline focus:outline-none"
                    >
                        {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
