import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { rtdb, db } from '../lib/firebase';
import Panel from '../components/Panel';
import Button from '../components/Button';
import api from '../api';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const [globalPresence, setGlobalPresence] = useState(0);
    const [lobbyUsers, setLobbyUsers] = useState({ A: [], B: [], C: [], D: [] });
    const [bufferSizes, setBufferSizes] = useState({ A: 0, B: 0, C: 0, D: 0 });
    const [totalUsers, setTotalUsers] = useState(0);
    const [analytics, setAnalytics] = useState([]);
    const [spamDrops, setSpamDrops] = useState(0);

    const rooms = ['A', 'B', 'C', 'D'];

    useEffect(() => {
        // Global and per-lobby Presence
        const presenceRef = ref(rtdb, 'presence');
        const unsubRtdb = onValue(presenceRef, (snapshot) => {
             const data = snapshot.val();
             let count = 0;
             const usersPerLobby = { A: [], B: [], C: [], D: [] };

             if (data) {
                 rooms.forEach(room => {
                     const lobbyData = data[`lobby_${room}`];
                     if (lobbyData) {
                         const users = Object.keys(lobbyData);
                         count += users.length;
                         usersPerLobby[room] = users;
                     }
                 });
             }
             setGlobalPresence(count);
             setLobbyUsers(usersPerLobby);
        });

        // Buffer Health tracking
        const unsubDBs = rooms.map(roomId => {
            const q = query(collection(db, `rooms/${roomId}/messages`));
            return onSnapshot(q, (snapshot) => {
                setBufferSizes(prev => ({ ...prev, [roomId]: snapshot.size }));
            });
        });

        // Engagement Analytics (via GO Backend)
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/inktochat/analytics/');
                // Sort by total_actions descending
                const sorted = (res.data || []).sort((a,b) => (b.total_actions || 0) - (a.total_actions || 0));
                setAnalytics(sorted);
            } catch (e) {
                console.error("Failed to fetch backend analytics", e);
            }
        };

        // Total Users Count (via GO Backend)
        const fetchTotalUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                const list = Array.isArray(res.data) ? res.data : (res.data.users || []);
                setTotalUsers(list.length);
            } catch (e) {
                console.error("Failed to fetch total users", e);
            }
        };

        fetchAnalytics();
        fetchTotalUsers();
        const analyticsInterval = setInterval(() => {
            fetchAnalytics();
            fetchTotalUsers();
        }, 10000);

        // Spam Metrics Polling
        const fetchSpam = async () => {
            try {
                const res = await api.get('/inktochat/spam');
                setSpamDrops(res.data.drops);
            } catch (e) {
                console.error("Failed to fetch spam metrics", e);
            }
        };
        fetchSpam();
        const spamInterval = setInterval(fetchSpam, 5000);

        return () => {
            unsubRtdb();
            unsubDBs.forEach(unsub => unsub());
            clearInterval(analyticsInterval);
            clearInterval(spamInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-picto-bg p-4 sm:p-8 font-ds flex flex-col items-center">
            <header className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl sm:text-4xl font-ds text-picto-border uppercase border-b-4 border-picto-border pb-1 tracking-tighter">CENTRAL INTELLIGENCE</h1>
                <div className="flex gap-2">
                    <span className="bg-picto-border text-white px-3 py-1 text-xs border-2 border-white shadow-sm uppercase font-bold">ADMIN MODE</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

                {/* Presences Panel */}
                <Panel className="bg-white" title="Real-Time Presences" subtitle={`Global Active: ${globalPresence}`}>
                    <div className="mt-2 flex flex-col gap-4">
                        {rooms.map(room => (
                            <div key={room} className="border-2 border-picto-border p-3 bg-picto-bg/40">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-picto-accent font-bold uppercase text-sm">Room {room}</div>
                                    <div className="text-xs font-bold bg-picto-border text-white px-2 py-0.5">{lobbyUsers[room].length} / 16</div>
                                </div>
                                <div className="text-sm text-black flex flex-wrap gap-2">
                                    {lobbyUsers[room].length > 0 ? lobbyUsers[room].map(u => (
                                        <span key={u} className="bg-white px-2 py-1 border-2 border-picto-border text-xs shadow-[2px_2px_0_0_rgba(66,66,66,1)]">{u}</span>
                                    )) : <span className="opacity-40 italic text-xs py-1">No users present...</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Engagement Dashboard */}
                <Panel className="bg-white" title="Engagement Stats" subtitle="Top Activity via DataHub">
                    <div className="mt-2 flex flex-col gap-2 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                        {analytics.length === 0 ? (
                            <p className="text-gray-400 italic text-sm text-center py-8">No activity detected yet...</p>
                        ) : analytics.map((entry, idx) => (
                            <div key={entry.username || idx} className="flex justify-between items-center border-b-2 border-picto-panel-dark py-3 last:border-b-0 hover:bg-picto-bg/30 transition-colors px-1">
                                <div className="flex flex-col">
                                    <span className="font-bold uppercase text-picto-border text-sm">{entry.username}</span>
                                    <div className="flex gap-3 text-xs opacity-60 font-bold">
                                        <span className="text-blue-600">MSG: {entry.messages || 0}</span>
                                        <span className="text-picto-accent">DRW: {entry.drawings || 0}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold bg-picto-border text-white px-3 py-1 border-2 border-white text-sm shadow-sm">
                                        {entry.total_actions || 0}
                                    </span>
                                    <span className="text-[10px] uppercase opacity-40 font-bold mt-1">ACTIONS</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Buffer Health & Scaling */}
                <Panel className="bg-white" title="Identity & Storage" subtitle="System Scalability">
                    <div className="flex flex-col gap-6 mt-2">
                        <div className="border-4 border-picto-border p-4 bg-picto-accent/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="w-16 h-16 bg-picto-accent rounded-full"></div>
                            </div>
                            <div className="text-xs uppercase font-bold text-picto-border opacity-60 mb-1">Registered Identities</div>
                            <div className="text-4xl font-bold text-picto-border">{totalUsers} <span className="text-xs font-normal opacity-50 uppercase tracking-widest ml-1">accounts</span></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {rooms.map(room => (
                                <div key={room} className="border-2 border-picto-border p-3 flex flex-col items-center bg-picto-bg/20">
                                    <span className="text-xs font-bold uppercase mb-1">Room {room}</span>
                                    <div className="w-full bg-gray-200 h-2 border border-picto-border mb-2 relative">
                                        <div 
                                            className={`h-full transition-all duration-500 ${bufferSizes[room] >= 80 ? 'bg-red-500' : 'bg-picto-accent'}`}
                                            style={{ width: `${Math.min(bufferSizes[room], 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-xl font-bold ${bufferSizes[room] >= 90 ? 'text-red-600' : 'text-picto-border'}`}>
                                        {bufferSizes[room]}
                                    </span>
                                    <span className="text-[10px] uppercase opacity-50 font-bold">/ 100 MSG</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* System Maintenance */}
                <Panel className="bg-red-50" title="System Maintenance" subtitle="Destructive Operations">
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="p-3 border-2 border-dashed border-red-300 bg-red-100/50">
                            <p className="text-xs text-red-800 font-bold uppercase mb-3 text-center">Caution: Irreversible Actions</p>
                            
                            <div className="flex flex-col gap-3">
                                <Button 
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Wipe Analytics?',
                                            text: "This will clear all non-permanent identities and reset bloom filters!",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#424242',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'YES, WIPE GUESTS'
                                        });
                                        if (result.isConfirmed) {
                                            try {
                                                await api.post('/inktochat/analytics/reset');
                                                Swal.fire('Deleted!', 'Guest records and reservations cleared.', 'success');
                                                window.location.reload();
                                            } catch (e) {
                                                Swal.fire('Error', 'Failed to execute reset', 'error');
                                            }
                                        }
                                    }} 
                                    className="text-xs !bg-red-600 !text-white hover:!bg-red-700 w-full py-2 shadow-sm font-bold"
                                >
                                    WIPE GUEST ANALYTICS
                                </Button>

                                <Button 
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Clear All Chats?',
                                            text: "This deletes every message across all 4 rooms forever!",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#424242',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'YES, CLEAR HISTORY'
                                        });
                                        if (result.isConfirmed) {
                                            try {
                                                await api.post('/inktochat/analytics/clear-chats');
                                                Swal.fire('Cleared!', 'All room buffers have been emptied.', 'success');
                                            } catch (e) {
                                                Swal.fire('Error', 'Failed to clear chat buffers', 'error');
                                            }
                                        }
                                    }} 
                                    className="text-xs !bg-picto-border !text-white hover:!bg-black w-full py-2 shadow-sm font-bold"
                                >
                                    CLEAR CHAT HISTORY
                                </Button>
                            </div>
                        </div>
                        
                        <p className="text-[10px] opacity-60 italic text-center font-bold uppercase tracking-tight">
                            Handshake reservations and message blobs will be removed from Firestore and RTDB.
                        </p>
                    </div>
                </Panel>

            </div>
        </div>
    );
};

export default AdminDashboard;
