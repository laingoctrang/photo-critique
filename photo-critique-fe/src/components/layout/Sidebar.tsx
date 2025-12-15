import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { SIDEBAR_MENU } from "../../constants";
import { TabCategory, UserRole, type MenuItem } from "../../types/enums";
import { useAuth } from "../../hooks";
import { Modal } from "../common";

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface SidebarProps {
  conversations?: Conversation[];
  className?: string;
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

export const Sidebar: React.FC<SidebarProps> = ({ conversations = [], className = "" }) => {
  const { user } = useAuth();
  if (!user || !user.roles || user.roles.length === 0) return null;

  const menuItems = getMenuItemsGroupedByCategory(user.roles);
  const shouldShowRecentChats = user.roles.includes(UserRole.USER);

  return (
    <div
      className={`sidebar bg-white h-full flex flex-col w-80 rounded-3xl ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 pb-5">
        <div className="relative">
          <img src="/logo.png" alt="Logo" className="h-9 w-9 object-cover rounded-xl" />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-[#15B8A6] to-[#2DD4BF] bg-clip-text text-transparent">
          PhotoVerse
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto hidden-scrollbar space-y-6">
        {/* Main Navigation */}
        {menuItems.main.length > 0 && (
          <div>
            <ul className="space-y-1.5">
              {menuItems.main.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}

        {/* Admin Section */}
        {menuItems.admin.length > 0 && (
          <div>
            <div className="flex items-center mb-3 px-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 bg-gray-100/80 rounded-full">
                Administration
              </h4>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>
            <ul className="space-y-1.5">
              {menuItems.admin.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}

        {/* Moderator Section */}
        {menuItems.moderator.length > 0 && (
          <div>
            <div className="flex items-center mb-3 px-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 bg-gray-100/80 rounded-full">
                Moderation
              </h4>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>
            <ul className="space-y-1.5">
              {menuItems.moderator.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Recent Conversations Section */}
      {shouldShowRecentChats && <RecentConversations conversations={conversations} />}

      {/* Footer */}
      <SidebarFooter />
    </div>
  );
};

// Reusable MenuItem using NavLink for SPA + active class
const MenuItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
            ? `bg-gradient-to-r from-[#15B8A6]/10 to-[#15B8A6]/5 text-[#0E7C70] font-medium 
                 shadow-[0_2px_10px_-2px_rgba(21,184,166,0.2)] border-l-3 border-[#15B8A6]}`
            : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 hover:translate-x-1"
          }`
        }
      >
        <Icon className="w-5 h-5 flex-shrink-0 transition-colors text-[#15B8A6]" />
        <div className="flex-1 text-left">
          <div className="font-medium">{item.label}</div>
        </div>
        <div className="w-2 h-2 bg-gradient-to-r from-[#15B8A6] to-[#2DD4BF] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </NavLink>
    </li>
  );
};

// Recent Conversations
const RecentConversations: React.FC<{ conversations: Conversation[] }> = ({ conversations }) => (
  <div className="border-t border-gray-100 pt-3">
    <div className="p-4 pt-0">
      <div className="sticky top-0 pt-4 pb-3 z-10">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
          <span className="bg-clip-text text-transparent">
            Recent Chats
          </span>
          {conversations.some((c) => c.unreadCount > 0) && (
            <span className="ml-2 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[22px] h-5 flex items-center justify-center shadow-sm">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </span>
          )}
        </h3>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {conversations.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">No recent conversations</p>
            <p className="text-xs text-gray-400 mt-1">Start a new chat to see them here</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        )}
      </div>
    </div>
  </div>
);

const ConversationItem: React.FC<{ conversation: Conversation }> = ({ conversation }) => (
  <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-[0_4px_12px_-2px_rgba(21,184,166,0.1)] border border-transparent hover:border-[#15B8A6]/20 cursor-pointer transition-all duration-300 group">
    <div className="relative flex-shrink-0">
      <div className="relative">
        <img
          src={conversation.userAvatar || "/default-avatar.png"}
          alt={conversation.userName}
          className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
        />
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${conversation.isOnline
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-gray-300 to-gray-400"
            }`}
        ></div>
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-gray-900 truncate">{conversation.userName}</h4>
        <span className="text-xs text-gray-500 font-medium">{conversation.timestamp}</span>
      </div>
      <p className="text-xs text-gray-500 truncate mt-0.5">{conversation.lastMessage}</p>
    </div>
    {conversation.unreadCount > 0 && (
      <span className="bg-gradient-to-r from-[#15B8A6] to-[#2DD4BF] text-white text-xs font-bold min-w-[22px] h-5 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
        {conversation.unreadCount}
      </span>
    )}
  </div>
);

const SidebarFooter: React.FC = () => {
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
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="w-fit h-10 px-4 flex items-center gap-3 text-gray-500 transition-colors duration-300 group cursor-pointer"
            title="Logout"
          >
            <ArrowLeftStartOnRectangleIcon
              className="w-5 h-5 text-gray-500 group-hover:text-[#15B8A6] transition-colors"
            />
            <span className="font-medium group-hover:text-[#15B8A6]">
              Logout
            </span>
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