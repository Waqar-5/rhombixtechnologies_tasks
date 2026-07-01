import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink)]">
        <span className="pulse-dot is-coral" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return children;
};

export default PublicRoute;
