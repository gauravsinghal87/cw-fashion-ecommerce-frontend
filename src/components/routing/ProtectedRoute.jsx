import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VerifyEmail = lazy(() => import('../../pages/auth/VerifyEmail'));

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return children;
  if (user?.role === 'admin' || user?.role === 'subadmin') return <Navigate to="/admin" replace />;
  if (user?.role === 'vendor') return <Navigate to="/vendor" replace />;
  return <Navigate to="/" replace />;
};

export const VerifyEmailAuthGuard = () => {
  const { user } = useSelector((state) => state.auth);
  if (user?.isEmailVerified) return <Navigate to="/" replace />;
  return <VerifyEmail />;
};
