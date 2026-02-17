import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
    const { user } = useAuth();
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            const list = Array.isArray(res.data) ? res.data : (res.data.users || []);
            setAllUsers(list);
        } catch (err) {
            Swal.fire('Error', 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchAllUsers();
        } else {
            Swal.fire('Error', 'No session found. Please login.', 'error');
            // redirect to login
        }
    }, []);

    const openAdminEdit = (targetUser) => {
        setEditingUser(targetUser);
        setValue('name', targetUser.name || '');
        setValue('email', targetUser.email || '');
        setValue('username', targetUser.username || '');
        setValue('role', targetUser.role || 'user');
    };

    const onAdminUpdateUser = async (data) => {
        if (!editingUser) return;
        setLoading(true);
        try {
            console.log('Updating user:', data);
            await api.put(`/users/${editingUser.id}`, { ...data });

            Swal.fire('Updated!', `User ${editingUser.username} updated.`, 'success');
            setEditingUser(null);
            reset();
            fetchAllUsers();
        } catch (err) {
            console.log('Error updating user:', err);
            Swal.fire('Error', err.response?.data?.error || 'Failed to update user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onAdminDeleteUser = async (targetId) => {
        if (targetId === user.id) {
            Swal.fire('Action Denied', "You cannot delete yourself from the admin panel.", 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Delete User?',
            text: "This action cannot be undone by you.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete user'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await api.delete(`/users/${targetId}`);
                Swal.fire('Deleted', 'User removed.', 'success');
                fetchAllUsers();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete user', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 bg-gray-50">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Dashboard</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all registered users.</p>
                </div>
                <button onClick={fetchAllUsers} disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700">
                    {loading ? 'Loading...' : 'Fetch Users'}
                </button>
            </div>

            {allUsers.length > 0 && (
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full overflow-hidden rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allUsers.map((u, index) => (
                                    <tr key={u.id || `user-${index}`}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {u.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{u.username}</div>
                                                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                            <span className="truncate">{u.id}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 sm:space-x-3">
                                            <button onClick={() => openAdminEdit(u)} className="text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm">Edit</button>
                                            {u.id !== user.id && (
                                                <button onClick={() => onAdminDeleteUser(u.id)} className="text-red-600 hover:text-red-900 text-xs sm:text-sm">Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Admin Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none p-4">
                    {/* Backdrop: Darker and blurred for that premium Swal look */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                        onClick={() => setEditingUser(null)}
                    ></div>

                    {/* Modal Card */}
                    <div className="relative w-full max-w-lg mx-auto z-50 transform transition-all">
                        <div className="relative flex flex-col w-full bg-white border-0 rounded-xl shadow-2xl outline-none focus:outline-none p-4 sm:p-6">

                            {/* Header - Swal Style */}
                            <div className="text-center pb-4">
                                <h3 className="text-2xl font-semibold text-gray-800">
                                    Edit User
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 italic">
                                    Modifying: {editingUser.username}
                                </p>
                            </div>

                            {/* Body */}
                            <div className="relative flex-auto py-2">
                                <form id="adminEditForm" onSubmit={handleSubmit(onAdminUpdateUser)} className="space-y-5">
                                    <div className="group">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Name</label>
                                        <input
                                            {...register('name')}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Username</label>
                                        <input
                                            {...register('username')}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Email</label>
                                        <input
                                            {...register('email')}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Role</label>
                                        <select
                                            {...register('role')}
                                            disabled={editingUser.id === user.id}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:bg-gray-200 disabled:cursor-not-allowed"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {editingUser.id === user.id && (
                                            <p className="mt-2 text-[10px] text-red-400 font-medium">Restricted: You cannot change your own administrative permissions.</p>
                                        )}
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Password</label>
                                        <input
                                            {...register('password')}
                                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Footer - Swal Styled Buttons */}
                            <div className="flex items-center justify-center p-4 space-x-3 border-t border-gray-100 mt-4">
                                <button
                                    type="submit"
                                    form="adminEditForm"
                                    className="px-6 py-2.5 bg-[#3085d6] text-white font-medium text-sm rounded shadow-md hover:bg-[#2b77c0] transition-colors duration-150 ease-in-out"
                                >
                                    Save changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-6 py-2.5 bg-[#aaa] text-white font-medium text-sm rounded shadow-md hover:bg-[#999] transition-colors duration-150 ease-in-out"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
