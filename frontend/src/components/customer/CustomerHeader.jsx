import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../utils/notify";
import LogoutModel from "../common/LogoutModel";

const CustomerHeader = () => {
  const navigate = useNavigate();
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false);

  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    notify.success("Logged out successfully");
    navigate("/login");
  };
  return (
    <div>
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="flex items-center space-x-10">
            <span className="text-sm text-gray-600">
              <span className="font-bold text-[#1b2a5e]">
                {user?.first_name + " " + user?.last_name}
              </span>
            </span>
            <button
              onClick={() => setIsLogoutModelOpen(true)}
              className="flex items-center text-sm text-red-600 hover:text-red-800 font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>

      <LogoutModel
        isOpen={isLogoutModelOpen}
        onClose={() => setIsLogoutModelOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default CustomerHeader;
