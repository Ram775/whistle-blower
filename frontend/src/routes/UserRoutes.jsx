import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages (Aage banayenge)
import Login from '../pages/admin/Login'; 

const Unauthorized = () => <div className="p-8 text-center text-red-600 text-2xl font-bold mt-20">Unauthorized Access! (You don't have permission)</div>;

const UserRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Customer Protected Routes (Role 3) */}
            <Route element={<ProtectedRoute allowedRoles={[3]} />}>
                {/* <Route path="/customer/dashboard" element={<CustomerDashboard />} /> */}
            </Route>
        </Routes>
    );
};

export default UserRoutes;