import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/app" replace />;
    }

    return children;
};

export default AdminRoute;
