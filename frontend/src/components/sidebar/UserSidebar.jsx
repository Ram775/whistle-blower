// import { useContext } from "react";
import { getRoleFromToken, getUsernameFromToken } from "../../auth/authHelper";

import Sidebar from "./Sidebar";

import {
  LayoutDashboard,
  Wallet,
  HandCoins,
  Power,
  Phone,
  MessageCircleQuestionMark,
  Mail,
  Shield,
  FileStack,
  MonitorUp,
} from "lucide-react";
import { LanguageContext } from "../../context/LanguageContext";
import { text } from "../../language/User/UserSidebar";
import { useContext } from "react";

const UserSidebar = ({ collapsed, setCollapsed }) => {
  const { lang } = useContext(LanguageContext);

  const role = getRoleFromToken()

  const t = text[lang];

  const userMenu = [
    {
      name: t.dashboard,
      path: "/user/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: t.upload_documents,
      path: null,
      icon: MonitorUp,
      subMenus: [
        {
          name: t.add,
          path: "/user/add",
        },
        {
          name: t.list,
          path: "/user/list",
        },
      ],
    },
  ];

  return (
    <div className="h-screen relative z-[50]">
      <Sidebar
        NavData={userMenu}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        title={role} 
      />
    </div>
  );
};

export default UserSidebar;