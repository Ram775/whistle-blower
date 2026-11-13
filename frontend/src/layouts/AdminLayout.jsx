import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Complaints', path: '/admin/complaints', icon: '📝' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Master Data', path: '/admin/master', icon: '🗂️' },
        { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
        { name: 'Sliders', path: '/admin/sliders', icon: '🖼️' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`bg-gray-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-wider text-blue-400">Whistle-Blower</h1>
                </div>
                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-6 py-3 text-sm hover:bg-gray-800 transition-colors ${location.pathname === item.path ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors text-sm font-semibold">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-600 focus:outline-none">
                        ☰
                    </button>
                    <div className="flex items-center space-x-4 ml-auto">
                        <span className="text-sm font-medium text-gray-700">Welcome, {user?.first_name || 'Admin'}</span>
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user?.first_name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;