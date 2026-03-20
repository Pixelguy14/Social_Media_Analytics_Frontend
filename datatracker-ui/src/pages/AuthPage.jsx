import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import Panel from '../components/Panel';
import Button from '../components/Button';
import api from '../api';
import { auth } from '../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const { login, register: apiRegister, user, logout: apiLogout } = useAuth();
    const { logout: guestLogout, username, firebaseToken } = useAppStore();

    // Auth Modes: 0: Guest, 1: Login, 2: Register
    const [mode, setMode] = useState(0);

    const [nameInput, setNameInput] = useState('');
    const [email, setEmail] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { setUsername, setFirebaseToken } = useAppStore();
    const navigate = useNavigate();

    // Reset if disconnected manually
    const handleReset = () => {
        guestLogout();
    };

    // Redirect if fully connected
    useEffect(() => {
        if (firebaseToken && username) {
            navigate('/lobby');
        }
    }, [firebaseToken, username, navigate]);

    // Token Claim logic (The "Handshake")
    const claimIdentity = async (targetUsername) => {
        try {
            const res = await api.post('/inktochat/token', { username: targetUsername });
            const { token } = res.data;
            await signInWithCustomToken(auth, token);
            setFirebaseToken(token);
            setUsername(targetUsername);
            navigate('/lobby');
        } catch (e) {
            Swal.fire('Identity Blocked', e.response?.data?.error || 'Claim rejected', 'error');
        }
    };

    const handleGuestJoin = async (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        setLoading(true);
        await claimIdentity(nameInput);
        setLoading(false);
    };

    const handleAccountLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);

        const res = await login(email, password);
        if (res.success) {
            // After DataTracker login, claim using the account name
            const savedUser = JSON.parse(localStorage.getItem('user'));
            await claimIdentity(savedUser.username);
        } else {
            Swal.fire('Access Denied', res.error, 'error');
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await apiRegister(nameInput, email, usernameInput, password);
        if (res.success) {
            Swal.fire('Success', 'Account created! Logging in...', 'success');
            await claimIdentity(usernameInput);
        } else {
            Swal.fire('Error', res.error, 'error');
        }
        setLoading(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            Swal.fire('Missing Data', 'Please enter your email to recover your account.', 'warning');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/users/forgot-password', { email });
            Swal.fire('Request Received', res.data.message, 'info');
            setMode(1); // Return to login
        } catch (err) {
            Swal.fire('System Error', err.response?.data?.error || 'Failed to initiate recovery.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-picto-bg px-4 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-5 dither-mask"></div>

            <Panel title="InkToChat Gateway" className="w-full max-w-sm relative z-10 shadow-lg">
                <div className="flex border-b-2 border-picto-border mb-6 font-ds text-xs font-bold uppercase tracking-tight">
                    <button
                        onClick={() => setMode(0)}
                        className={`flex-1 py-3 transition-colors ${mode === 0 ? 'bg-picto-border text-white' : 'bg-picto-panel hover:bg-gray-200 text-picto-border'}`}
                    >
                        GUEST
                    </button>
                    <button
                        onClick={() => setMode(1)}
                        className={`flex-1 py-3 border-l-2 border-picto-border transition-colors ${mode === 1 ? 'bg-picto-accent text-white' : 'bg-picto-panel hover:bg-gray-200 text-picto-border'}`}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => setMode(2)}
                        className={`flex-1 py-3 border-l-2 border-picto-border transition-colors ${mode === 2 ? 'bg-blue-500 text-white' : 'bg-picto-panel hover:bg-gray-200 text-picto-border'}`}
                    >
                        REGISTER
                    </button>
                </div>

                <div className="px-2 pb-2">
                    {mode === 0 && (
                        <form onSubmit={handleGuestJoin} className="flex flex-col gap-4 py-2 font-ds">
                            <p className="text-xs opacity-70 text-center uppercase tracking-wider">Choose a temporary alias:</p>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                disabled={loading}
                                maxLength={10}
                                className="bg-white border-2 border-picto-border p-3 outline-none focus:border-picto-accent text-sm"
                                placeholder="NICKNAME"
                            />
                            <Button type="submit" disabled={loading || !nameInput.trim()} className="w-full h-14 uppercase font-bold">
                                {loading ? 'CONNECTING...' : 'JOIN AS GUEST'}
                            </Button>
                        </form>
                    )}

                    {mode === 1 && (
                        <form onSubmit={handleAccountLogin} className="flex flex-col gap-4 py-2 font-ds">
                            <p className="text-xs opacity-70 text-center uppercase tracking-wider">Secure DataHub Login:</p>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent"
                                placeholder="EMAIL"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent"
                                placeholder="PASSWORD"
                            />
                            <Button type="submit" disabled={loading} className="w-full h-14 !bg-picto-accent text-white uppercase font-bold">
                                {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setMode(3)}
                                className="text-[10px] opacity-50 hover:opacity-100 uppercase font-bold tracking-widest mt-1"
                            >
                                Forgot Password?
                            </button>
                        </form>
                    )}

                    {mode === 2 && (
                        <form onSubmit={handleRegister} className="flex flex-col gap-4 py-2 font-ds">
                            <p className="text-xs opacity-70 text-center uppercase tracking-wider">Create Permanent Identity:</p>
                            <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent" placeholder="FULL NAME" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent" placeholder="EMAIL" />
                            <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent" placeholder="USERNAME" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent" placeholder="PASSWORD" />
                            <Button type="submit" disabled={loading} className="w-full h-14 !bg-blue-500 text-white uppercase font-bold">
                                {loading ? 'ENROLLING...' : 'REGISTER & JOIN'}
                            </Button>
                        </form>
                    )}

                    {mode === 3 && (
                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 py-2 font-ds">
                            <p className="text-xs opacity-70 text-center uppercase tracking-wider">Account Recovery:</p>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white border-2 border-picto-border p-3 text-sm outline-none focus:border-picto-accent"
                                placeholder="REGISTERED EMAIL"
                            />
                            <Button type="submit" disabled={loading} className="w-full h-14 !bg-orange-500 text-white uppercase font-bold">
                                {loading ? 'SENDING...' : 'SEND RESET LINK'}
                            </Button>
                            <button 
                                type="button" 
                                onClick={() => setMode(1)}
                                className="text-[10px] opacity-40 hover:opacity-100 uppercase tracking-widest font-bold mt-2"
                            >
                                Return to Login
                            </button>
                        </form>
                    )}

                    {user && (
                        <div className="mt-6 pt-6 border-t-2 border-dashed border-picto-border text-center">
                            <p className="text-xs mb-3 uppercase font-bold text-picto-accent">Account Detected: {user.username}</p>
                            <div className="flex flex-col gap-3">
                                <Button onClick={() => claimIdentity(user.username)} className="text-sm !bg-blue-500 text-white py-2">RESUME SESSION</Button>
                                <Button onClick={() => { apiLogout(); guestLogout(); }} className="text-xs !bg-gray-400 text-white py-2">SIGN OUT</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Panel>
            <footer className="mt-8 text-xs font-ds text-picto-border opacity-50 uppercase tracking-[0.2em] text-center">
                LOG IN THE SYSTEM AS A GUEST OR REGISTER TO CREATE A PERMANENT IDENTITY
            </footer>
        </div>
    );
};

export default AuthPage;
