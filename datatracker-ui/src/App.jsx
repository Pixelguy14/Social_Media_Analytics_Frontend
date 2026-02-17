import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import './index.css';

const AppContent = () => {
  const { user, loading } = useAuth();

  // Skeleton Loader for professional UX
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 antialiased">
      {user ? <Dashboard /> : <AuthPage />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
