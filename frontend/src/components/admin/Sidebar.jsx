import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Image as ImageIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Box,
  Globe,
  Map,
  MapPin,
  Building2,
  Calendar,
  FileText,
  List,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMasterOpen, setIsMasterOpen] = useState(true); // Default open

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const masterItems = [
    { name: "Country", path: "/admin/master?tab=countries", icon: Globe },
    { name: "State", path: "/admin/master?tab=states", icon: Map },
    { name: "District", path: "/admin/master?tab=districts", icon: MapPin },
    { name: "City", path: "/admin/master?tab=cities", icon: Building2 },
    {
      name: "Event",
      path: "/admin/master?tab=vigilance-angles",
      icon: Calendar,
    },
    {
      name: "Disclosure Detail",
      path: "/admin/master?tab=disclosure-details",
      icon: FileText,
    },
  ];

  const isMasterActive = location.pathname.startsWith("/admin/master");

  return (
    <aside
      className={`bg-white text-gray-700 w-64 min-h-screen flex flex-col transition-all duration-300 border-r border-gray-200 ${isOpen ? "block" : "hidden"} md:block`}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-gray-100 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <div>
            <h1 className="text-sm font-bold text-blue-800 leading-tight">
              GICRe
            </h1>
            <p className="text-xs text-blue-600 font-semibold">Whistleblower</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700" : "text-gray-600"}`
              }
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboards
            </NavLink>
          </li>

          {/* Master (Expandable) */}
          <li>
            <button
              onClick={() => setIsMasterOpen(!isMasterOpen)}
              className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isMasterActive ? "text-blue-700" : "text-gray-600"}`}
            >
              <div className="flex items-center">
                <Box className="w-5 h-5 mr-3" />
                Master
              </div>
              {isMasterOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Sub Menu */}
            {isMasterOpen && (
              <ul className="pl-12 space-y-1 mt-1">
                {masterItems.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 text-sm hover:text-blue-700 transition-colors ${isActive ? "text-blue-700 font-semibold" : "text-gray-500"}`
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3"></span>
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Complaint List */}
          <li>
            <NavLink
              to="/admin/complaints"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700" : "text-gray-600"}`
              }
            >
              <List className="w-5 h-5 mr-3" />
              Complaint List
            </NavLink>
          </li>

          {/* Whistle Blower User */}
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700" : "text-gray-600"}`
              }
            >
              <Users className="w-5 h-5 mr-3" />
              Whistle Blower User
            </NavLink>
          </li>

          {/* Setting */}
          <li>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700" : "text-gray-600"}`
              }
            >
              <Settings className="w-5 h-5 mr-3" />
              Setting
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/sliders"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700" : "text-gray-600"}`
              }
            >
              <ImageIcon  className="w-5 h-5 mr-3" />
              Sliders
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
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
