import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Panel from './Panel';
import Button from './Button';

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
        fetchAllUsers();
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
            await api.put(`/users/${editingUser.id}`, { ...data });
            Swal.fire('Identity Rewritten', `User ${editingUser.username} updated.`, 'success');
            setEditingUser(null);
            reset();
            fetchAllUsers();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onAdminDeleteUser = async (targetId) => {
        if (targetId === user.id) {
            Swal.fire('Access Denied', "Self-deletion is restricted.", 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Identity?',
            text: "This wipes all user trace data.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'DELETE'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await api.delete(`/users/${targetId}`);
                Swal.fire('Wiped!', 'Trace removed.', 'success');
                fetchAllUsers();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete user', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Panel 
            title="User Management" 
            subtitle="Registered DataHub Identities" 
            className="w-full"
        >
            <div className="flex justify-end mb-4">
                <Button onClick={fetchAllUsers} disabled={loading} className="text-xs">SYNC DATA</Button>
            </div>

            <div className="overflow-x-auto border-2 border-picto-panel-dark bg-white/20">
                <table className="min-w-full divide-y-2 divide-picto-panel-dark font-ds">
                    <thead className="bg-picto-panel-dark">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs uppercase tracking-tighter">Identity</th>
                            <th className="px-4 py-2 text-left text-xs uppercase tracking-tighter">Role</th>
                            <th className="px-4 py-2 text-right text-xs uppercase tracking-tighter">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-picto-panel-dark">
                        {allUsers.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-picto-border text-white flex items-center justify-center font-bold border-2 border-white">
                                            {u.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold uppercase">{u.username}</div>
                                            <div className="text-[10px] opacity-60 font-mono lower">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] px-1 font-bold border ${u.role === 'admin' ? 'bg-picto-accent border-white text-white' : 'border-picto-border'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button onClick={() => openAdminEdit(u)} className="text-[10px] !py-1">EDIT</Button>
                                        <Button onClick={() => onAdminDeleteUser(u.id)} className="text-[10px] !bg-red-500 !py-1">X</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Admin Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Panel title="Edit Identity" className="w-full max-w-sm" showCloseBtn onClose={() => setEditingUser(null)}>
                        <form onSubmit={handleSubmit(onAdminUpdateUser)} className="flex flex-col gap-4 pt-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold">Display Name</label>
                                <input {...register('name')} className="bg-white border-2 border-picto-border p-2 focus:outline-none font-ds" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold">Username</label>
                                <input {...register('username')} className="bg-white border-2 border-picto-border p-2 focus:outline-none font-ds" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold">Role</label>
                                <select {...register('role')} className="bg-white border-2 border-picto-border p-2 focus:outline-none font-ds uppercase text-xs">
                                    <option value="user">USER</option>
                                    <option value="admin">ADMIN</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" onClick={() => setEditingUser(null)} className="!bg-gray-400">CANCEL</Button>
                                <Button type="submit">SAVE</Button>
                            </div>
                        </form>
                    </Panel>
                </div>
            )}
        </Panel>
    );
};

export default AdminPanel;
