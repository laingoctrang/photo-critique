import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeftStartOnRectangleIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { SIDEBAR_MENU } from "../../constants";
import { TabCategory, UserRole, type MenuItem } from "../../types";
import { useAuth } from "../../hooks";
import { Button, Modal } from "../common";


interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const getMenuTabsByRoles = (roles: UserRole[]) => {
  return SIDEBAR_MENU.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );
};

const getMenuItemsGroupedByCategory = (roles: UserRole[]) => {
  const items = getMenuTabsByRoles(roles);

  return {
    main: items.filter((item) => item.category === TabCategory.MAIN),
    admin: items.filter((item) => item.category === TabCategory.ADMIN),
    moderator: items.filter((item) => item.category === TabCategory.MODERATOR),
  };
};

export const Sidebar: React.FC<SidebarProps> = ({ className = "", isCollapsed = false, onToggle }) => {
  const { user } = useAuth();
  if (!user || !user.roles || user.roles.length === 0) return null; 

  const menuItems = getMenuItemsGroupedByCategory(user.roles);

  return (
    <div
      className={`sidebar bg-white h-full flex flex-col ${isCollapsed ? "w-20" : "w-80"} rounded-3xl shadow-sm transition-all duration-300 ${className}`}
    >
      {/* Logo with Toggle Button */}
      <div className={`flex items-center ${isCollapsed ? "flex-col justify-center gap-2" : "justify-between"} p-5 pb-5 border-b border-gray-100`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="relative">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 object-cover rounded-xl" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-[#15B8A6]">
              PhotoVerse
            </span>
          )}
        </div>
        
        {/* Toggle Button */}
        {onToggle && (
          <Button
            variant="ghost"
            size="medium"
            className="p-2"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            leftIcon={isCollapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon}
          >
          </Button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto hidden-scrollbar space-y-6">
        {/* Main Navigation */}
        {menuItems.main.length > 0 && (
          <div>
            <ul className="space-y-1.5">
              {menuItems.main.map((item) => (
                <MenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
              ))}
            </ul>
          </div>
        )}

        {/* Admin Section */}
        {menuItems.admin.length > 0 && (
          <div>
            {!isCollapsed && (
              <div className="flex items-center mb-3 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 bg-gray-100/80 rounded-full">
                  Administration
                </h4>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </div>
            )}
            <ul className="space-y-1.5">
              {menuItems.admin.map((item) => (
                <MenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
              ))}
            </ul>
            <ul className="space-y-1.5">
              {menuItems.moderator.map((item) => (
                <MenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
              ))}
            </ul>
          </div>
        )}

        {/* Moderator Section */}
        {/* {menuItems.moderator.length > 0 && (
          <div>
            {!isCollapsed && (
              <div className="flex items-center mb-3 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 bg-gray-100/80 rounded-full">
                  Moderation
                </h4>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </div>
            )}
            <ul className="space-y-1.5">
              {menuItems.moderator.map((item) => (
                <MenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
              ))}
            </ul>
          </div>
        )} */}
      </nav>

      {/* Footer */}
      <SidebarFooter isCollapsed={isCollapsed} />
    </div>
  );
};

// Reusable MenuItem using NavLink for SPA + active class
const MenuItem: React.FC<{ item: MenuItem; isCollapsed?: boolean }> = ({ item, isCollapsed = false }) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `w-full flex items-center ${isCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-xl transition-all duration-300 group relative ${isActive
            ? `bg-[#15B8A6]/15 text-[#0E7C70] font-medium ${isCollapsed ? "" : "border-l-3 border-[#15B8A6]"}`
            : `text-gray-600 hover:bg-gray-100/80 ${isCollapsed ? "hover:scale-115" : "hover:translate-x-1"}`
          }`}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0 transition-colors text-[#15B8A6]" />
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left">
              <div className="font-medium">{item.label}</div>
            </div>
            <div className="w-2 h-2 bg-[#15B8A6] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </>
        )}
      </NavLink>
    </li>
  );
};

const SidebarFooter: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="p-4 border-t border-gray-100">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`${isCollapsed ? "px-2" : "px-4"} h-10 flex items-center gap-3 text-gray-500 transition-colors duration-300 group cursor-pointer`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <ArrowLeftStartOnRectangleIcon
              className="w-5 h-5 text-gray-500 group-hover:text-[#15B8A6] transition-colors"
            />
            {!isCollapsed && (
              <span className="font-medium group-hover:text-[#15B8A6]">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        variant="danger"
        showCancel={true}
      />
    </>
  );
};
