import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // App-level loader already covers this window

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  // Guards against the toast firing twice under React 18 StrictMode's
  // double-invoke behavior in development.
  const hasWarned = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin && !hasWarned.current) {
      hasWarned.current = true;
      toast.error("You don't have admin access.");
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
