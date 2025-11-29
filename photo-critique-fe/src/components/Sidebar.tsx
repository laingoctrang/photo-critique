import React from "react";
import { NavLink } from "react-router-dom";
import { SIDEBAR_MENU } from "../constants";
import { TabCategory, UserRole, type MenuItem } from "../types/enums";
import { useAuth } from "../hooks";

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
      className={`sidebar bg-white border-r border-gray-200 h-screen flex flex-col w-80 ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-4">
        <img src="/logo.png" alt="Logo" className="h-8 w-8 object-cover" />
        <span className="font-semibold">PhotoVerse</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Navigation */}
        {menuItems.main.length > 0 && (
          <div className="mb-6">
            <ul className="space-y-2">
              {menuItems.main.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}

        {/* Admin Section */}
        {menuItems.admin.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Administration
            </h4>
            <ul className="space-y-2">
              {menuItems.admin.map((item) => (
                <MenuItem key={item.id} item={item} isAdmin />
              ))}
            </ul>
          </div>
        )}

        {/* Moderator Section */}
        {menuItems.moderator.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Moderation
            </h4>
            <ul className="space-y-2">
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
const MenuItem: React.FC<{ item: MenuItem; isAdmin?: boolean }> = ({ item, isAdmin = false }) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive
              ? `bg-blue-50 text-blue-600 border border-blue-200 ${
                  isAdmin ? "border-l-4 border-l-blue-500" : ""
                }`
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
      >
        <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
        <div className="flex-1 text-left">
          <div className="font-medium">{item.label}</div>
        </div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-active:opacity-100"></div>
      </NavLink>
    </li>
  );
};

// Recent Conversations
const RecentConversations: React.FC<{ conversations: Conversation[] }> = ({ conversations }) => (
  <div className="border-t border-gray-200">
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        Recent Chats
        {conversations.some((c) => c.unreadCount > 0) && (
          <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        )}
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent conversations
          </p>
        ) : (
          conversations.map((conversation) => <ConversationItem key={conversation.id} conversation={conversation} />)
        )}
      </div>
    </div>
  </div>
);

const ConversationItem: React.FC<{ conversation: Conversation }> = ({ conversation }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
    <div className="relative">
      <img
        src={conversation.userAvatar || "/default-avatar.png"}
        alt={conversation.userName}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
          conversation.isOnline ? "bg-green-500" : "bg-gray-300"
        }`}
      ></div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-900 truncate">{conversation.userName}</h4>
        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
      </div>
      <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
    </div>
    {conversation.unreadCount > 0 && (
      <span className="bg-blue-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
        {conversation.unreadCount}
      </span>
    )}
  </div>
);

const SidebarFooter: React.FC = () => (
  <div className="p-4 border-t border-gray-200">
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>© 2024 MyApp</span>
      <button className="hover:text-gray-700 transition-colors">⚙️</button>
    </div>
  </div>
);
