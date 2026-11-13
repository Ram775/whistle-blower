import { Menu, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
            <button onClick={toggleSidebar} className="md:hidden text-gray-600 focus:outline-none">
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
                <span className="text-sm font-medium text-gray-700">
                    Welcome, <span className="font-bold">{user?.first_name || 'Admin'}</span>
                </span>
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserCircle className="w-6 h-6" />
                </div>
            </div>
        </header>
    );
};

export default Header;