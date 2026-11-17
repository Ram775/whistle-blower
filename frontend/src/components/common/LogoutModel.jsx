import React from "react";
import ReactDOM from "react-dom";
import { X, AlertCircle } from "lucide-react";

const LogoutModel = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 border ">
      {/* Backdrop with blur - clickable to close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Responsive Modal Card */}
      <div
        className="relative bg-white w-[92%] max-w-[360px] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 
                      transform transition-all duration-300 ease-out
                      animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
      >
        {/* Top Status Bar */}
        <div className="h-1.5 w-full " />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            {/* Warning Icon with pulse effect background */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5 group">
              <AlertCircle
                className="text-red-500 group-hover:scale-110 transition-transform"
                size={32}
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Sign Out
            </h3>

            <p className="text-gray-500 text-sm sm:text-base mt-3 leading-relaxed">
              Are you sure you want to sign out?
            </p>
          </div>

          {/* Action Buttons - Adjusted for all screen sizes */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 px-4 py-3 btn_base btn_secondary text-gray-600 font-semibold border border-gray-200 rounded-xl 
                         hover:bg-gray-50 active:bg-gray-100 transition-all outline-none"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 order-1 sm:order-2 px-4 py-3 bg-red-500/95 btn_base border border-gray-200 text-white font-semibold rounded-xl 
                         hover:bg-red-600 active:bg-red-700 shadow-md shadow-red-200 transition-all outline-none"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Responsive Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2  text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default LogoutModel;