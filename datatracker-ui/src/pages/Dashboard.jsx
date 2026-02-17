import React from 'react';
import Layout from '../components/Layout';
import ProfileCard from '../components/ProfileCard';
import AdminPanel from '../components/AdminPanel';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <Layout>
            {/* Profile Card */}
            <ProfileCard />

            <br></br>

            {/* Admin Panel */}
            {user?.role === 'admin' && (
                <AdminPanel />
            )}

            <br></br>

            {/* Future: Analytics */}
        </Layout>
    );
};

export default Dashboard;
