import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, set, onDisconnect, remove } from 'firebase/database';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { rtdb, db } from '../lib/firebase';
import useAppStore from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import Panel from '../components/Panel';
import Button from '../components/Button';
import CanvasComponent from '../components/CanvasComponent';
import api from '../api';
import Swal from 'sweetalert2';

const ChatRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username, setRoom } = useAppStore();
    const { user } = useAuth();
    const userColor = user?.color || 'black';
    const [textInput, setTextInput] = useState('');

    const [messages, setMessages] = useState([]);
    const [savedDrawings, setSavedDrawings] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const canvasRef = useRef(null);

    // Safety check
    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    // Setup Presence
    useEffect(() => {
        if (!username || !roomId) return;
        const userRef = ref(rtdb, `presence/lobby_${roomId}/${username}`);

        // Add user to presence and setup disconnect hook
        set(userRef, true);
        onDisconnect(userRef).remove();

        return () => {
            remove(userRef);
        };
    }, [roomId, username]);

    // Setup Firestore Messages listener
    useEffect(() => {
        if (!roomId) return;
        const q = query(
            collection(db, `rooms/${roomId}/messages`),
            orderBy('timestamp', 'desc'),
            limit(100)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
            // Reverse so newest is at the bottom
            setMessages(msgs.reverse());
        }, (error) => {
            console.error("Firestore (Messages) Subscribe Error:", error);
        });

        return () => unsubscribe();
    }, [roomId]);

    const handleLeave = () => {
        const userRef = ref(rtdb, `presence/lobby_${roomId}/${username}`);
        remove(userRef);
        setRoom(null);
        navigate('/lobby');
    };

    // Fetch Saved Drawings
    useEffect(() => {
        if (!user) return;
        api.get('/inktochat/drawings')
            .then(res => setSavedDrawings(res.data || []))
            .catch(e => console.error("Failed to fetch drawings", e));
    }, [user]);

    const handleSaveDrawing = async (blob) => {
        try {
            let bytesArray;
            if (blob.toUint8Array) {
                bytesArray = Array.from(blob.toUint8Array());
            } else if (blob instanceof Uint8Array) {
                bytesArray = Array.from(blob);
            } else if (Array.isArray(blob)) {
                bytesArray = blob;
            } else {
                bytesArray = Array.from(new Uint8Array(blob));
            }

            await api.post('/inktochat/drawings', { blob: bytesArray });
            // Refresh list
            const res = await api.get('/inktochat/drawings');
            setSavedDrawings(res.data || []);
            Swal.fire({
                title: 'Saved!',
                text: 'Drawing Added to DataHub Storage',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to save drawing.', 'error');
        }
    };

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;

        try {
            await api.post('/inktochat/message', {
                username,
                room: roomId,
                text: textInput,
                color: userColor
            });
            setTextInput('');
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to send message.', 'error');
        }
    };

    const handleDrawSubmit = async (bitArray) => {
        try {
            await api.post('/inktochat/draw', {
                username,
                room: roomId,
                blob: bitArray,
                color: userColor
            });
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to send drawing.', 'error');
        }
    };

    const handleDeleteDrawing = async (drawingId) => {
        try {
            await api.delete(`/inktochat/drawings/${drawingId}`);
            setSavedDrawings(prev => prev.filter(d => d.id !== drawingId));
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to delete drawing.', 'error');
        }
    };

    const renderMessage = (msg) => {
        return (
            <div key={msg.id} className={`border-b-2 border-picto-panel p-2 ${msg.username === username ? 'bg-picto-panel/20' : ''}`}>
                <div className="flex justify-between items-center mb-1">
                    <span
                        className="font-ds font-bold uppercase block text-xs"
                        style={{ color: msg.color === 'black' ? 'inherit' : (msg.color || 'inherit') }}
                    >
                        {msg.username} {msg.username === username && '(YOU)'}
                    </span>
                    {msg.blob && user && (
                        <button onClick={() => handleSaveDrawing(msg.blob)} className="text-[10px] bg-blue-100 px-2 py-0.5 border-2 border-picto-border shadow-sm text-blue-700 font-bold hover:bg-blue-200 transition-colors">SAVE</button>
                    )}
                </div>
                {msg.blob ? (
                    <div className="flex justify-start">
                        <DrawingViewer blob={msg.blob} scale={0.6} />
                    </div>
                ) : (
                    <p className="font-ds text-sm leading-tight text-picto-border">{msg.text || '[Action/Binary Data]'}</p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-picto-bg py-4 sm:py-8 px-2 sm:px-4 flex flex-col lg:flex-row gap-6 items-start justify-center overflow-x-hidden">
            {/* Left: Chat Viewer */}
            <Panel className="w-full max-w-lg h-[500px] sm:h-[600px] shadow-lg" title={`Room ${roomId}`}>
                {/* Scrollable area */}
                <div className="flex-grow overflow-y-scroll min-h-0 pt-2 shadow-inner bg-black/5 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="p-8 text-center font-ds text-picto-border opacity-50 text-xs uppercase tracking-widest">Waiting for incoming data...</div>
                    ) : (
                        messages.map(renderMessage)
                    )}
                </div>

                {/* Bottom Input Area */}
                <div className="mt-auto pt-3 flex flex-col gap-2 bg-picto-panel border-t-2 border-picto-border px-1 pb-1">
                    <form onSubmit={handleTextSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="MESSAGE..."
                            className="flex-grow bg-white border-2 border-picto-border text-black px-3 py-2 font-ds focus:outline-none focus:border-picto-accent text-sm uppercase"
                        />
                        <Button type="submit" className="text-xs shrink-0 px-6">SEND</Button>
                    </form>
                    <div className="flex justify-between items-center px-1">
                        <Button onClick={handleLeave} className="text-[10px] !bg-gray-400 !py-1 !text-white px-4">LEAVE ROOM</Button>
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">SECURE CHANNEL {roomId}</span>
                    </div>
                </div>
            </Panel>

            {/* Right Side Container */}
            <div className="relative flex flex-col gap-4 w-full max-w-fit mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-4 items-start w-full relative">
                    {/* Drawer Layer */}
                    <Panel
                        className="w-full sm:w-auto max-w-[550px] h-auto sm:h-[600px] flex-shrink-0 relative"
                        title={`Board: ${username}`}
                        headerAction={user && (
                            <Button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`text-[10px] !py-1 px-3 shadow-sm ${isSidebarOpen ? '!text-white' : '!bg-blue-500 !text-white'}`}
                            >
                                {isSidebarOpen ? 'CLOSE HUB' : 'DATAHUB'}
                            </Button>
                        )}
                    >
                        <div className="p-1 sm:p-2 bg-white/50">
                            <CanvasComponent
                                ref={canvasRef}
                                onDrawSubmit={handleDrawSubmit}
                                onSaveDrawing={handleSaveDrawing}
                                canSave={!!user}
                            />
                        </div>
                    </Panel>

                    {/* Sidebar */}
                    {isSidebarOpen && user && (
                        <Panel
                            className="w-full sm:w-72 h-[400px] sm:h-[600px] overflow-hidden bg-gray-100 flex-shrink-0 shadow-2xl border-picto-accent"
                            title="DataHub Storage"
                            subtitle={`${savedDrawings.length} BLOBS STORED`}
                        >
                            <div className="flex-grow overflow-y-auto custom-scrollbar p-3 flex flex-col gap-4 bg-white/40">
                                {savedDrawings.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-12">
                                        <div className="w-12 h-12 border-2 border-picto-border border-dashed mb-2"></div>
                                        <span className="text-[10px] font-bold uppercase">No records found</span>
                                    </div>
                                )}
                                {savedDrawings.map((d, i) => (
                                    <div
                                        key={d.id || i}
                                        onClick={() => canvasRef.current?.loadBlob(d.blob)}
                                        className="group relative border-2 border-picto-border p-2 bg-white hover:bg-picto-bg transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex justify-center bg-white mb-2 overflow-hidden border border-picto-panel">
                                            <DrawingViewer blob={d.blob} scale={0.4} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold opacity-40 uppercase">BLOB-{(d.id || i).toString().slice(-4)}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteDrawing(d.id);
                                                }}
                                                className="px-3 text-[10px] font-bold bg-red-500 text-white py-1 border-2 border-picto-border active:translate-y-0.5 hover:bg-red-600 transition-colors"
                                            >
                                                DEL
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}
                </div>
            </div>
        </div>
    );
};

// Viewer component to reconstruct 1-bit array on a canvas visually
const DrawingViewer = ({ blob, scale = 1 }) => {
    const canvasRef = React.useRef(null);
    const displayWidth = Math.floor(256 * scale);
    const displayHeight = Math.floor(192 * scale);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !blob) return;

        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(256, 192);
        const data = imgData.data;

        // Handle Firestore Blob objects, raw Uint8Arrays, or Base64 Strings from REST API
        let bytes;
        if (typeof blob === 'string') {
            const binaryString = atob(blob);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
        } else if (blob?.toUint8Array) {
            bytes = blob.toUint8Array();
        } else if (blob instanceof Uint8Array) {
            bytes = blob;
        } else if (Array.isArray(blob)) {
            bytes = new Uint8Array(blob);
        } else {
            bytes = new Uint8Array(blob);
        }

        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            for (let j = 0; j < 8; j++) {
                const pixelIndex = i * 8 + j;
                if (pixelIndex >= 256 * 192) break;

                const isBlack = (byte >> (7 - j)) & 1;
                const color = isBlack ? 0 : 255;

                data[pixelIndex * 4] = color; // r
                data[pixelIndex * 4 + 1] = color; // g
                data[pixelIndex * 4 + 2] = color; // b
                data[pixelIndex * 4 + 3] = 255;   // a
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }, [blob]);

    return (
        <canvas
            ref={canvasRef}
            width={256}
            height={192}
            className="border-2 border-picto-border bg-white"
            style={{
                imageRendering: 'pixelated',
                width: `${displayWidth}px`,
                height: `${displayHeight}px`
            }}
        />
    );
};

export default ChatRoom;
