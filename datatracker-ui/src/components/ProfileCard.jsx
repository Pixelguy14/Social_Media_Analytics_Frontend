import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ProfileCard = () => {
    const { user, refreshProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue } = useForm();

    const startEditing = () => {
        setValue('name', user.name || '');
        setValue('username', user.username || '');
        setValue('email', user.email || '');
        setIsEditing(true);
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await refreshProfile();
            Swal.fire({
                icon: 'success',
                title: 'Profile Refreshed',
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
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await api.delete(`/users/${user.id}`);
                Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
                logout();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete account', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">My Profile</h3>
                {!isEditing && (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button onClick={handleRefresh} disabled={loading} className="flex-1 sm:flex-none text-sm text-blue-600 hover:underline disabled:opacity-50">Refresh</button>
                        <button onClick={startEditing} disabled={loading} className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50">Edit</button>
                        <button onClick={handleDeleteAccount} disabled={loading} className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50">Delete</button>
                    </div>
                )}
            </div>
            <div className="px-4 py-5 sm:p-6">
                {!isEditing ? (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user?.name || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900 break-all">{user?.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1"><span className="inline-block text-sm text-gray-900 uppercase tracking-wide px-3 py-1 rounded bg-gray-100">{user?.role}</span></dd>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="mt-1 text-xs text-gray-400 font-mono break-all">{user?.id}</dd>
                        </div>
                    </dl>
                ) : (
                    <form onSubmit={handleSubmit(onUpdateProfile)} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input {...register('name')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input {...register('username', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" {...register('email', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                            <input type="password" {...register('password')} placeholder="Leave blank to keep current" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="w-full sm:w-auto bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1">Cancel</button>
                            <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 order-1 sm:order-2">Save Changes</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileCard;
