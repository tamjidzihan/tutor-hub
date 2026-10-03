import React from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { AdminResourceManagement } from '../components/dashboard/AdminResourceManagement';

export const DashboardUsersPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <DashboardLayout>
            <AdminResourceManagement
                resource="users"
                title="User Directory"
                subtitle="Review registered user accounts across all roles. Administrators can inspect and delete accounts, but cannot alter private credentials."
            />
        </DashboardLayout>
    );
};
