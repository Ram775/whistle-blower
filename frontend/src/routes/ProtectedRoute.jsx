import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
    }

    if (!user) {
        // Admin route pe hai toh admin login pe bhejo, warna customer login pe
        const redirectPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/customer/login';
        return <Navigate to={redirectPath} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(Number(user.role_id))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;