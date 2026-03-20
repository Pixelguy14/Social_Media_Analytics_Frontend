import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import Panel from '../components/Panel';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import useAppStore from '../store/useAppStore';

const rooms = ['A', 'B', 'C', 'D'];

const LobbySelection = () => {
    const navigate = useNavigate();
    const { setRoom } = useAppStore();
    const [counts, setCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });

    useEffect(() => {
        const unsubscribes = rooms.map(roomId => {
            const presenceRef = ref(rtdb, `presence/lobby_${roomId}`);
            return onValue(presenceRef, (snapshot) => {
                const data = snapshot.val();
                let count = 0;
                if (data) count = Object.keys(data).length;
                setCounts(prev => ({ ...prev, [roomId]: count }));
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, []);

    const joinRoom = (roomId) => {
        setRoom(roomId);
        navigate(`/room/${roomId}`);
    };

    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-picto-bg p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-4xl flex flex-col items-center gap-10">
                {/* Header Section */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <h1 className="text-3xl sm:text-5xl font-ds text-picto-border uppercase tracking-tighter border-b-8 border-picto-border pb-2 shadow-sm">
                        Select a Lobby
                    </h1>
                    <div className="flex gap-3">
                        <Button onClick={() => navigate('/dashboard')} className="text-xs !bg-blue-500 !text-white px-4 py-2">MY PROFILE</Button>
                        {user?.role === 'admin' && (
                            <Button onClick={() => navigate('/admin')} className="text-xs !bg-picto-accent !text-white px-4 py-2">ADMIN DASH</Button>
                        )}
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl px-4">
                    {rooms.map(r => (
                        <Panel
                            key={r}
                            className="group transition-all hover:translate-y-[-4px] hover:shadow-[8px_8px_0_0_rgba(66,66,66,1)] active:translate-y-[2px] active:shadow-none cursor-pointer"
                            title={`Room ${r}`}
                            subtitle={`${counts[r] || 0} / 16 Active Users`}
                        >
                            <div className="mt-6 flex flex-col gap-4">
                                <div className="w-full bg-picto-bg border-2 border-picto-border h-4 relative overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${counts[r] >= 14 ? 'bg-red-500' : 'bg-picto-accent'}`}
                                        style={{ width: `${(counts[r] / 16) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={() => joinRoom(r)} className="px-8 py-2 text-sm font-bold uppercase tracking-widest">
                                        JOIN
                                    </Button>
                                </div>
                            </div>
                        </Panel>
                    ))}
                </div>

                <footer className="opacity-30 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mt-4">
                    CHOOSE A LOBBY TO START MESSAGING
                </footer>
            </div>
        </div>
    );
};

export default LobbySelection;
