import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/sidebar/AdminSidebar"; // 2nd code ka path
import Header from "../components/admin/Header";           // 2nd code ka path
import { Footer } from "antd/es/layout/layout";

const AdminLayout = () => {
  // 1st code ka logic: default laptop width ke hisaab se sidebar collapse rahe
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- 1. IMPROVED RESPONSIVE LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden relative">
      {/* SIDEBAR - Desktop par fixed, Mobile par overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out 
        ${isMobile && !collapsed ? "translate-x-0" : isMobile ? "-translate-x-full" : "relative translate-x-0"}`}
      >
        {/* 2nd code wala Sidebar props (collapsed, setCollapsed) */}
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* MOBILE OVERLAY - Jab sidebar khule toh baaki screen blur ho jaye */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* 2nd code wala Header props */}
        {/* <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        /> */}

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
         
          <div className="max-w-full mx-auto w-full overflow-hidden">
            <Outlet />
          </div>
        </main>

        
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;