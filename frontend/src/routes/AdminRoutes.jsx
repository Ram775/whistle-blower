import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
// import ComplaintList from '../pages/admin/ComplaintList';
// import UserList from '../pages/admin/UserList';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
                {/* Layout ke andar saare admin pages aayenge */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    
                    {/* Placeholder routes (baad me inki files banayenge) */}
                    <Route path="/admin/complaints" element={<div className="p-4">Complaints Page (Coming Soon)</div>} />
                    <Route path="/admin/users" element={<div className="p-4">Users Page (Coming Soon)</div>} />
                    <Route path="/admin/master" element={<div className="p-4">Master Data (Coming Soon)</div>} />
                    <Route path="/admin/settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
                    <Route path="/admin/sliders" element={<div className="p-4">Sliders (Coming Soon)</div>} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AdminRoutes;