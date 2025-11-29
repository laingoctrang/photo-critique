import { useAuth } from "../hooks";
import { SearchBar } from "./SearchBar";

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
  const { user } = useAuth();

  async function handleSearch(query: string): Promise<User[]> {
  // Giả lập delay mạng
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Lọc theo query (case-insensitive)
  return mockUsers.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );
}

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Search */}
        <div className="p-6">
          <SearchBar 
            onSearch={handleSearch}
            className="w-full"
            renderResult={(user) => <span>{user.name}</span>}
          />
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-3">
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
