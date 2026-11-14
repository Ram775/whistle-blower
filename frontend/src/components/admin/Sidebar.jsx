import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Database,
  Settings,
  Image,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Complaints", path: "/admin/complaints", icon: FileText },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Master Data", path: "/admin/master", icon: Database },
    { name: "Sliders", path: "/admin/sliders", icon: Image },
    { name: "Settings", path: "/admin/settings", icon: Settings },
    { name: "My Profile", path: "/admin/profile", icon: UserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`bg-gray-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300 ${isOpen ? "block" : "hidden"} md:block`}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">
          Whistle-Blower
        </h1>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm hover:bg-gray-800 transition-colors ${isActive ? "bg-gray-800 border-l-4 border-blue-500 text-blue-400" : "text-gray-300"}`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors text-sm font-semibold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
