import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { SearchBar } from "../common";
import { SIDEBAR_MENU } from "../../constants";
import { userService } from "../../services/userService";
import type { User } from "../../types";

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth()
  const showSearchBar = !location.pathname.includes("/admin") && !location.pathname.includes("/moderator");

  const getPageTitle = () => {
    const menuItem = SIDEBAR_MENU.find(item => item.path === location.pathname);
    return menuItem?.label || null;
  };

  const pageTitle = getPageTitle();

  async function handleSearch(query: string): Promise<User[]> {
    try {
      const users = await userService.searchUsers(query);
      return users;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  const handleUserClick = (selectedUser: User) => {
    if (selectedUser.username) {
      navigate(`/${selectedUser.username}`);
    }
  };

  const handleEnter = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur">
      <div className="flex items-center justify-between py-3 gap-5 border-b border-gray-200">
        {pageTitle && !showSearchBar && (
          <h2 className="text-3xl font-bold text-gray-900 whitespace-nowrap">
            {pageTitle}
          </h2>
        )}
        {/* Search - only show when user role */}
        {showSearchBar && (
          <div className="flex-1">
          <SearchBar 
            placeholder="Search users or posts"
            onSearch={handleSearch}
            onResultClick={handleUserClick}
            onEnter={handleEnter}
            className="max-w-sm lg:max-w-md"
            renderResult={(user) => (
              <div className="flex items-center gap-3">
                <img
                  src={user.profilePicture || "/default-avatar.png"}
                  alt={user.username || user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.fullName || user.username}</span>
                  {user.username && (
                    <span className="text-xs text-gray-500">@{user.username}</span>
                  )}
                </div>
              </div>
            )}
          />
        </div>
        )}

        {/* Notification and User Profile Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* <div className="relative">
            <Button
              variant="ghost" 
              size="small"
              className="p-2"
            >
              <BellIcon className="w-7 h-7" aria-hidden="true"/>
            </Button>
            <span className="absolute top-0 right-1 text-xs text-[#15B8A6] bg-[#E6FDF5] rounded-full w-5 h-5 flex items-center justify-center font-semibold pointer-events-none">12</span>
          </div> */}

          {/* User Profile */}
          <div className="relative">
            <img
              src={user?.profilePicture || "/default-avatar.png"}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover border-1 border-gray-300"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
