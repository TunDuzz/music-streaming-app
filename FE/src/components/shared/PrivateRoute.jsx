import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Enforce Admin strict separation: Admin cannot access /app
    if (userRole === 'Admin') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default PrivateRoute;
