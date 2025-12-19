import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks";
import { Button, SearchBar } from "../common";
import { UserRole } from "../../types/enums";
import { SIDEBAR_MENU } from "../../constants";
import { BellIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
}

// Fake data
const mockUsers: User[] = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Smith" },
  { id: "3", name: "Charlie Brown" },
  { id: "4", name: "David Wilson" },
  { id: "5", name: "Eve Davis" },
];


export const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth()
  const showSearchBar = !location.pathname.includes("/admin") && !location.pathname.includes("/moderator");

  const getPageTitle = () => {
    const menuItem = SIDEBAR_MENU.find(item => item.path === location.pathname);
    if (menuItem?.roles && menuItem?.roles.includes(UserRole.USER)) {
      return null;
    }
    return menuItem?.label || null;
  };

  const pageTitle = getPageTitle();

  async function handleSearch(query: string): Promise<User[]> {
  // Giả lập delay mạng
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Lọc theo query (case-insensitive)
  return mockUsers.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );
}

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 mt-2 gap-5">
        {pageTitle && (
          <h2 className="text-3xl font-bold text-gray-900 whitespace-nowrap">
            {pageTitle}
          </h2>
        )}
        {/* Search - only show when user role */}
        {showSearchBar && (
          <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch}
            className="max-w-md m-auto"
            renderResult={(user) => <span>{user.name}</span>}
          />
        </div>
        )}

        {/* Notification and User Profile Section */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <Button
              variant="ghost" 
              size="small"
              className="p-2"
            >
              <BellIcon className="w-7 h-7" aria-hidden="true"/>
            </Button>
            <span className="absolute top-0 right-1 text-xs text-[#15B8A6] bg-[#E6FDF5] rounded-full w-5 h-5 flex items-center justify-center font-semibold pointer-events-none">12</span>
          </div>

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
