import React from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header: Sticky and Z-indexed for professional feel */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo Area */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                D
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">DataTracker</h1>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col text-right border-r border-gray-200 pr-4">
                                <span className="text-sm font-semibold text-gray-900 leading-none">{user?.username || 'User'}</span>
                                <span className="text-xs text-gray-500 mt-1">{user?.email}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content: Controlled width for readability */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Footer: Vital for Portfolio look */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} DataTracker UI • Built with Google Antigravity • Developed by JJSA
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
