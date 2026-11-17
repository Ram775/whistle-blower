import React, { useState, useEffect } from "react";
import {
  getRoleFromToken,
} from "../../api/authHelper";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Lock,
  LogOut,
} from "lucide-react";
import { Tooltip } from "antd";
import logo from "/images/logo.png";
import LogoutModel from "../common/LogoutModel";

const Sidebar = ({ collapsed, setCollapsed, NavData = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getRoleFromToken();

  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  
  // Static full name (agar token se lena ho to change kar lena)
  const [fullName] = useState("Admin User");
  const initial = fullName ? fullName.charAt(0).toUpperCase() : "NA";
  
  const [openMenus, setOpenMenus] = useState({});

  // Function to check if any child route is active
  const isChildRouteActive = (menuItem, currentPath) => {
    if (menuItem.path && currentPath === menuItem.path) return true;

    if (menuItem.links) {
      for (const link of menuItem.links) {
        if (currentPath === link.path) return true;
      }
    }

    if (menuItem.subMenus) {
      for (const subMenu of menuItem.subMenus) {
        if (isChildRouteActive(subMenu, currentPath)) return true;
      }
    }
    return false;
  };


  const getActiveMenuName = (menus, currentPath) => {
    let deepestMatch = null;
    let maxDepth = -1;

    const searchMenu = (items, depth = 0) => {
      for (const item of items) {
        if (item.path && currentPath === item.path) {
          if (depth > maxDepth) {
            deepestMatch = { name: item.name, depth };
            maxDepth = depth;
          }
        }

        if (item.links) {
          const activeLink = item.links.find(
            (link) => currentPath === link.path,
          );
          if (activeLink && depth + 1 > maxDepth) {
            deepestMatch = { name: activeLink.label, depth: depth + 1 };
            maxDepth = depth + 1;
          }
        }

        if (item.subMenus) {
          searchMenu(item.subMenus, depth + 1);
        }
      }
    };
    searchMenu(menus);
    return deepestMatch?.name || null;
  };

  // Auto-expand menus based on current route (FIXED INFINITE LOOP)
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = {};

    const findAndExpandParents = (menus, parentPath = "") => {
      for (const menu of menus) {
        const menuPath = parentPath ? `${parentPath}-${menu.name}` : menu.name;

        if (isChildRouteActive(menu, currentPath)) {
          newOpenMenus[menuPath] = true;
          if (menu.subMenus) {
            findAndExpandParents(menu.subMenus, menuPath);
          }
        } else if (menu.subMenus) {
          findAndExpandParents(menu.subMenus, menuPath);
        }
      }
    };

    findAndExpandParents(NavData);
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // NavData removed from dependency to stop infinite loop

  // Update page title based on active menu (FIXED INFINITE LOOP)
  useEffect(() => {
    const currentPath = location.pathname;
    let activeMenuName = getActiveMenuName(NavData, currentPath);

    if (!activeMenuName) {
      if (currentPath.includes("edit-profile") || currentPath.includes("manage-profile")) {
        activeMenuName = "My Profile";
      } else if (currentPath.includes("change-password")) {
        activeMenuName = "Change Password";
      } else if (currentPath.includes("dashboard")) {
        activeMenuName = "Dashboard";
      }
    }

    if (activeMenuName) {
      document.title = `${activeMenuName} | GICRe Whistleblower`;
    } else {
      const pathSegments = currentPath.split("/").filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];
      const fallbackTitle = lastSegment
        ? lastSegment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "GICRe Whistleblower";
      document.title = `${fallbackTitle} | GICRe Whistleblower`;
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Removed dependencies to stop loop

  const toggleMenu = (menuName, level = 1) => {
    if (collapsed) return;

    setOpenMenus((prev) => {
      if (level === 1) {
        const isCurrentlyOpen = prev[menuName];
        return isCurrentlyOpen ? {} : { [menuName]: true };
      }
      return { ...prev, [menuName]: !prev[menuName] };
    });
  };

  const isMenuOpen = (menuName) => !!openMenus[menuName];

  const getLinkClass = (isActive) => `
    flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all w-full text-left
    ${collapsed ? "justify-center" : ""}
    ${
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
    }
  `;

  const handleMobileClose = () => {
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  };

  const handleLogoutAction = () => {
    setIsLogoutModelOpen(false);
    // Yahan apna logout logic dalna (jaise authService.manualLogout())
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed h-screen top-0 bottom-0 z-50 flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden
          ${
            collapsed
              ? "w-0 -left-full lg:w-20 lg:left-0 border-r-0 lg:border-r border-gray-200"
              : "w-64 left-0 border-r border-gray-200"
          } lg:sticky`}
      >
        {/* HEADER */}
        <div className="h-20 flex items-center px-4 border-b border-gray-200 shrink-0 relative">
          {!collapsed && (
            <div className="flex-1 flex justify-left">
              <div className="h-12 w-40">
                <img
                  className="w-full object-cover "
                  src={logo}
                  alt="Company logo"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`w-9 h-8 flex items-center justify-center rounded-md bg-[#162f6a] text-white transition-all outline-none
              ${collapsed ? "mx-auto" : "absolute right-4"}`}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1 custom-scrollbar">
          {NavData.map((menu) => {
            const Icon = menu.icon;
            const hasSubMenus = menu.subMenus?.length;
            const isOpen = isMenuOpen(menu.name);

            if (!hasSubMenus) {
              return (
                <NavLink
                  key={menu.name}
                  to={menu.path || "#"}
                  end
                  className={({ isActive }) => getLinkClass(isActive)}
                  onClick={() => {
                    setOpenMenus({});
                    handleMobileClose();
                  }}
                >
                  {Icon && <Icon size={20} className="shrink-0" />}
                  {!collapsed && (
                    <div className="font-medium">{menu.name}</div>
                  )}
                </NavLink>
              );
            }

            return (
              <div key={menu.name} className="relative">
                <button
                  onClick={() => toggleMenu(menu.name, 1)}
                  aria-expanded={isOpen}
                  className={getLinkClass(isOpen && !collapsed)}
                >
                  {Icon && <Icon size={20} className="shrink-0" />}
                  {!collapsed && (
                    <div className="flex flex-1 items-center justify-between overflow-hidden">
                      <span className="font-semibold truncate">
                        {menu.name}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* SUBMENU LEVEL 2 */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen && !collapsed
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-6 border-l border-gray-300 mt-1 space-y-1">
                    {menu.subMenus.map((sub) => {
                      const subHasLinks = sub.links?.length;
                      const subOpen = isMenuOpen(sub.name);

                      return (
                        <div key={sub.name}>
                          {subHasLinks ? (
                            <button
                              onClick={() => toggleMenu(sub.name, 2)}
                              aria-expanded={subOpen}
                              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:text-blue-600 outline-none focus:text-blue-600"
                            >
                              <span className="truncate">{sub.name}</span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform shrink-0 ${subOpen ? "rotate-90" : ""}`}
                              />
                            </button>
                          ) : (
                            <NavLink
                              to={sub.path || "#"}
                              end
                              onClick={handleMobileClose}
                              className={({ isActive }) =>
                                `block px-4 py-2 text-sm transition-colors ${
                                  isActive
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-500 hover:text-blue-600"
                                }`
                              }
                            >
                              <span>{sub.name}</span>
                            </NavLink>
                          )}

                          {/* LEVEL 3 */}
                          {subHasLinks && (
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                subOpen ? "max-h-60" : "max-h-0"
                              }`}
                            >
                              <div className="ml-4 border-l border-blue-100 space-y-1">
                                {sub.links.map((link) => (
                                  <NavLink
                                    key={link.path}
                                    to={link.path || "#"}
                                    end
                                    onClick={handleMobileClose}
                                    className={({ isActive }) =>
                                      `block px-4 py-1.5 text-xs transition-colors ${
                                        isActive
                                          ? "bg-blue-50 text-blue-700 font-medium"
                                          : "text-gray-500 hover:text-blue-800"
                                      }`
                                    }
                                  >
                                    {link.label}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* FOOTER - USER PROFILE */}
        <div className="border-t bg-[var(--color-primary-dark)] text-blue-200/90 font-bold shrink-0">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              !collapsed && isFooterExpanded
                ? "max-h-48 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-2 space-y-1 bg-[#162f6a]">
              <button
                onClick={() => {
                  navigate(
                    userRole === "User"
                      ? "/user/edit-profile"
                      : "/admin/dashboard"
                  );
                  handleMobileClose();
                }}
                className="w-full flex items-center gap-3 p-2.5 text-sm hover:bg-white/10 rounded transition-colors outline-none focus:bg-white/20"
              >
                <User size={16} /> <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate(
                    userRole === "User"
                      ? "/user/change-password"
                      : "/admin/change-password"
                  );
                  handleMobileClose();
                }}
                className="w-full flex items-center gap-3 p-2.5 text-sm hover:bg-white/10 rounded transition-colors outline-none focus:bg-white/20"
              >
                <Lock size={16} /> <span>Change Password</span>
              </button>

              <button
                onClick={() => setIsLogoutModelOpen(true)}
                className="w-full flex items-center gap-3 p-2.5 text-sm hover:bg-white/10 rounded transition-colors outline-none focus:bg-white/20"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => !collapsed && setIsFooterExpanded(!isFooterExpanded)}
            disabled={collapsed}
            aria-label="User Menu"
            className={`w-full flex items-center gap-3 px-5 py-1.5 hover:bg-white/5 transition-colors outline-none focus:bg-white/10
            ${collapsed ? "justify-center" : "justify-between"}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-7 h-7 shrink-0 bg-white text-blue-900 rounded-full flex items-center justify-center font-bold shadow-sm">
                {initial}
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold truncate max-w-[120px]">
                  <Tooltip title={fullName}>{fullName}</Tooltip>
                </span>
              )}
            </div>

            {!collapsed && (
              <ChevronUp
                size={18}
                className={`transition-transform duration-300 ${isFooterExpanded ? "rotate-180" : ""}`}
              />
            )}
          </button>
        </div>
      </aside>

      <LogoutModel
        isOpen={isLogoutModelOpen}
        onClose={() => setIsLogoutModelOpen(false)}
        onConfirm={handleLogoutAction}
      />
    </>
  );
};

export default Sidebar;