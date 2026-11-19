import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

const CustomerHeader = () => {
  const { user, logout } = useAuth();
   const handleLogout = () => {
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    };
  return (
    <div>
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome,{" "}
              <span className="font-bold text-[#1b2a5e]">
                {user?.first_name}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-red-600 hover:text-red-800 font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default CustomerHeader;
