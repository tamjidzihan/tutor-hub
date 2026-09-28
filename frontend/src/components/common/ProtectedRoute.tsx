import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from './FeedbackStates';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!isAuthenticated) {
    let authMessage = 'Please sign in to your account to continue.';
    if (location.pathname.startsWith('/become-a-tutor')) {
      authMessage = 'Please sign in to complete your tutor registration.';
    } else if (location.pathname.startsWith('/appoint-a-tutor')) {
      authMessage = 'Please sign in to post your tuition requirement.';
    } else if (location.pathname.startsWith('/dashboard')) {
      authMessage = 'Please sign in to access your dashboard.';
    }

    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search,
          message: authMessage
        }}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
