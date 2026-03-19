import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import useAppStore from '../store/useAppStore';

const Layout = ({ children }) => {
    const { user, logout: apiLogout } = useAuth();
    const { logout: guestLogout } = useAppStore();
    const navigate = useNavigate();
    
    const handleFullLogout = () => {
        apiLogout();
        guestLogout();
    };

    return (
        <div className="min-h-screen bg-picto-bg flex flex-col font-ds overflow-x-hidden">
            {/* Pictochat-style Header */}
            <header className="bg-picto-panel border-b-4 border-picto-border p-3 sm:p-4 shadow-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
                    {/* Brand/Identity */}
                    <div 
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => navigate('/lobby')}
                    >
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-picto-border border-2 border-white flex items-center justify-center text-white font-bold text-lg sm:text-xl group-hover:bg-picto-accent transition-colors">
                            I
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-picto-border tracking-tighter uppercase">InkToChat</h1>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex flex-col text-left sm:text-right pr-3 border-r-2 border-picto-border/20">
                            <span className="text-picto-border font-bold text-sm sm:text-base leading-none uppercase truncate max-w-[120px]">
                                {user?.username || 'GUEST'}
                            </span>
                            <span className="text-picto-border opacity-50 text-[10px] sm:text-xs mt-0.5 truncate max-w-[120px]">
                                {user ? user.email : 'PIC-001'}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button onClick={() => navigate('/lobby')} className="text-xs px-2 py-0.5 sm:px-4 sm:py-1">LOBBY</Button>
                            {user?.role === 'admin' && (
                                <Button onClick={() => navigate('/admin')} className="text-xs !bg-picto-accent text-white px-2 py-0.5 sm:px-4 sm:py-1">ADMIN</Button>
                            )}
                            <Button onClick={handleFullLogout} className="text-xs !bg-gray-400 text-white px-2 py-0.5 sm:px-4 sm:py-1">OUT</Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-grow p-4 sm:p-8 relative">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="bg-picto-panel border-t-4 border-picto-border py-4 text-center">
                <p className="text-sm font-ds text-picto-border opacity-70 uppercase tracking-widest">
                    InkToChat v2.0 • DataTracker Integrated • 2026
                </p>
            </footer>
        </div>
    );
};

export default Layout;
