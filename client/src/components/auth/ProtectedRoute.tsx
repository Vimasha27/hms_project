import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole } = useAuth();

  const isAuthorized = !allowedRoles || hasRole(allowedRoles);

  useEffect(() => {
    if (isAuthenticated && !isAuthorized) {
      toast.error('Access Denied: You do not have permission to view that section.');
    }
  }, [isAuthenticated, isAuthorized]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
