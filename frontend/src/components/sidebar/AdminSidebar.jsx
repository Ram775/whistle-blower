import Sidebar from "./Sidebar";

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
  Image as ImageIcon,
} from "lucide-react";
import { getRoleFromToken } from "../../api/authHelper";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const role = getRoleFromToken();
  const userMenu = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Master",
      path: null,
      icon: Box,
      subMenus: [
        {
          name: "Country",
          path: "/admin/master?tab=countries",
        },
        {
          name: "State",
          path: "/admin/master?tab=states",
        },
        {
          name: "District",
          path: "/admin/master?tab=districts",
        },
        {
          name: "City",
          path: "/admin/master?tab=cities",
        },
        {
          name: "Event",
          path: "/admin/master?tab=vigilance-angles",
        },
        {
          name: "Disclosure Detail",
          path: "/admin/master?tab=disclosure-details",
        },
      ],
    },
    {
      name: "Complaint List",
      path: "/admin/complaints",
      icon: List,
    },
    {
      name: "Whistle Blower User",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Setting",
      path: "/admin/settings",
      icon: Settings,
    },
    {
      name: "Sliders",
      path: "/admin/sliders",
      icon: ImageIcon,
    },
  ];

  return (
    /* h-screen aur relative classes add ki hain taaki Sidebar 
       poori screen par properly float kar sake mobile mein 
    */
    <div className="h-screen relative z-[50]">
      <Sidebar
        NavData={userMenu}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
         title={role || "Admin Panel"}
      />
    </div>
  );
};

export default AdminSidebar;