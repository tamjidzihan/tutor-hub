import React from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { AdminResourceManagement } from '../components/dashboard/AdminResourceManagement';

export const DashboardTutorsPage: React.FC = () => {
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
                resource="tutors"
                title="Tutor Verification"
                subtitle="Review educational credentials, identity cards, verify teacher profiles, and manage active tutor availability."
            />
        </DashboardLayout>
    );
};
