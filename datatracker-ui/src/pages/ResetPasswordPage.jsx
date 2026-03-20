import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Panel from '../components/Panel';
import Button from '../components/Button';
import api from '../api';
import Swal from 'sweetalert2';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            Swal.fire('Error', 'Missing or invalid reset token.', 'error');
            return;
        }

        if (password.length < 6) {
            Swal.fire('Safety Alert', 'New password must be at least 6 characters long.', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Mismatch', 'Passwords do not match. Please verify.', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/reset-password/confirm', {
                token: token,
                new_password: password
            });

            await Swal.fire({
                title: 'Identity Restored',
                text: 'Your password has been successfully reset. Logging you in...',
                icon: 'success',
                confirmButtonColor: '#424242'
            });

            navigate('/');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || 'Validation failed. The reset link might be expired.';
            Swal.fire('System Rejection', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-picto-bg px-4">
                <Panel title="Security Terminal" className="w-full max-w-sm">
                    <div className="p-4 text-center">
                        <p className="text-red-500 font-bold uppercase mb-4 tracking-widest">ERROR: CRITICAL_MISSING_KEY</p>
                        <p className="text-sm opacity-70 mb-6">Unauthorized access detected. This terminal requires a valid security token to continue.</p>
                        <Button onClick={() => navigate('/')} className="w-full">RETURN TO GATEWAY</Button>
                    </div>
                </Panel>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-picto-bg px-4 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-5 dither-mask"></div>

            <Panel title="Identity Recovery" className="w-full max-w-sm relative z-10 shadow-lg" subtitle="SECURITY CLEARANCE GRANTED">
                <div className="p-2">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2 font-ds">
                        <p className="text-xs opacity-70 text-center uppercase tracking-wider">Configure your new credentials:</p>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold opacity-50 uppercase tracking-tighter ml-1">NEW PASSWORD</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="bg-white border-2 border-picto-border p-3 outline-none focus:border-picto-accent text-sm"
                                placeholder="******"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold opacity-50 uppercase tracking-tighter ml-1">CONFIRM PASSWORD</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                className="bg-white border-2 border-picto-border p-3 outline-none focus:border-picto-accent text-sm"
                                placeholder="******"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full h-14 uppercase font-bold mt-4"
                        >
                            {loading ? 'RECONFIGURING...' : 'RESET PASSWORD'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            disabled={loading}
                            className="text-[10px] opacity-40 hover:opacity-100 uppercase tracking-widest font-bold mt-2"
                        >
                            Abort Recovery
                        </button>
                    </form>
                </div>
            </Panel>
        </div>
    );
};

export default ResetPasswordPage;
