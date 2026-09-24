import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { TutorDashboard } from '../components/dashboard/TutorDashboard';
import { StudentParentDashboard } from '../components/dashboard/StudentParentDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { Navigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      {user.role === 'TUTOR' && <TutorDashboard />}
      {(user.role === 'PARENT' || user.role === 'STUDENT') && <StudentParentDashboard />}
      {(user.role === 'ADMIN' || user.role === 'STAFF') && <AdminDashboard />}
    </DashboardLayout>
  );
};
