/* eslint-disable */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Panel from './Panel';
import Button from './Button';

const ProfileCard = () => {
    const { user, refreshProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch } = useForm();
    const currentColor = watch('color') || user?.color || 'black';

    const AVAILABLE_COLORS = [
        { name: 'Black', value: 'black' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Admin Red', value: 'red', adminOnly: true }
    ];
    const startEditing = () => {
        setValue('name', user.name || '');
        setValue('username', user.username || '');
        setValue('email', user.email || '');
        setValue('color', user.color || 'black');
        setIsEditing(true);
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await refreshProfile();
            Swal.fire({
                icon: 'success',
                title: 'Data Synced',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            Swal.fire('Error', 'Failed to fetch profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onUpdateProfile = async (data) => {
        setLoading(true);
        try {
            const payload = { ...data };
            if (!payload.password) delete payload.password;

            await api.put(`/users/${user.id}`, payload);
            await refreshProfile();

            setIsEditing(false);
            Swal.fire('Success', 'Profile updated!', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Delete Identity?',
            text: "This will wipe your DataTracker profile!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'YES, WIPE IT'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await api.delete(`/users/${user.id}`);
                Swal.fire('Wiped!', 'Account deleted.', 'success');
                logout();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete account', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Panel 
            title="User Profile" 
            subtitle="Persistent Identity"
            className="w-full max-w-4xl mx-auto"
        >
            <div className="flex flex-col gap-6">
                {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                        <div className="border-2 border-picto-panel-dark p-3 bg-white/50">
                            <dt className="text-xs uppercase opacity-60">Full Name</dt>
                            <dd className="text-lg font-bold">{user?.name || '-'}</dd>
                        </div>
                        <div className="border-2 border-picto-panel-dark p-3 bg-white/50">
                            <dt className="text-xs uppercase opacity-60">Username</dt>
                            <dd className="text-lg font-bold text-picto-accent">{user?.username}</dd>
                        </div>
                        <div className="border-2 border-picto-panel-dark p-3 bg-white/50">
                            <dt className="text-xs uppercase opacity-60">Role</dt>
                            <dd className="text-lg font-bold uppercase">{user?.role}</dd>
                        </div>
                        <div className="md:col-span-2 border-2 border-picto-panel-dark p-3 bg-white/50">
                            <dt className="text-xs uppercase opacity-60">Email Address</dt>
                            <dd className="text-lg break-all">{user?.email}</dd>
                        </div>
                        <div className="border-2 border-picto-panel-dark p-3 bg-white/50">
                            <dt className="text-xs uppercase opacity-60">Name Color</dt>
                            <dd className="text-lg font-bold uppercase" style={{ color: user?.color || 'black' }}>
                                {user?.color || 'Black'}
                            </dd>
                        </div>
                        <div className="lg:col-span-3 border-2 border-picto-panel-dark p-2 bg-black/5">
                            <dt className="text-[10px] uppercase opacity-40 font-mono italic">Trace ID</dt>
                            {/* SECURITY: Raw IDs displayed here should ideally be UUIDs to prevent IDOR/Enumeration attacks. */}
                            <dd className="text-[10px] font-mono opacity-50 break-all">{user?.id}</dd>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onUpdateProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase font-bold">Display Name</label>
                            <input {...register('name')} className="bg-white border-2 border-picto-border p-2 focus:outline-none focus:border-picto-accent" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase font-bold">Username</label>
                            <input {...register('username', { required: true })} className="bg-white border-2 border-picto-border p-2 focus:outline-none focus:border-picto-accent" />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-xs uppercase font-bold">Email</label>
                            <input type="email" {...register('email', { required: true })} className="bg-white border-2 border-picto-border p-2 focus:outline-none focus:border-picto-accent" />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-xs uppercase font-bold">New Password</label>
                            <input type="password" {...register('password')} placeholder="Keep blank if unchanged" className="bg-white border-2 border-picto-border p-2 focus:outline-none focus:border-picto-accent placeholder:opacity-30" />
                        </div>
                        
                        <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                            <label className="text-xs uppercase font-bold">Name Color</label>
                            <div className="flex gap-3">
                                {AVAILABLE_COLORS.map(c => {
                                    if (c.adminOnly && user?.role !== 'admin') return null;
                                    return (
                                        <label key={c.value} className="flex items-center gap-1 cursor-pointer">
                                            <input type="radio" value={c.value} {...register('color')} className="hidden peer" />
                                            <div 
                                                className={`w-8 h-8 rounded-full border-4 transition-all shadow-sm ${currentColor === c.value ? 'border-picto-accent scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: c.value === 'black' ? '#000' : c.value }}
                                                title={c.name}
                                            ></div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                            <Button type="button" onClick={() => setIsEditing(false)} className="!bg-gray-400">CANCEL</Button>
                            <Button type="submit" disabled={loading}>SAVE</Button>
                        </div>
                    </form>
                )}

                {!isEditing && (
                    <div className="flex flex-wrap gap-2 justify-end border-t-2 border-picto-panel-dark pt-4">
                        <Button onClick={handleRefresh} disabled={loading} className="!bg-blue-500 text-xs">SYNC</Button>
                        <Button onClick={startEditing} disabled={loading} className="text-xs">EDIT</Button>
                        <Button onClick={handleDeleteAccount} disabled={loading} className="!bg-red-500 text-xs">WIPE</Button>
                    </div>
                )}
            </div>
        </Panel>
    );
};

export default ProfileCard;
