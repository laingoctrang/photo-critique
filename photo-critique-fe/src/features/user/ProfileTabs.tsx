export type TabType = "posts" | "saved" | "about";

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOwnProfile: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  isOwnProfile,
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8 px-6 pt-3">
        <button
          onClick={() => onTabChange("posts")}
          className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
            activeTab === "posts"
              ? "border-[#15B8A6] text-[#15B8A6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Posts
        </button>
        {isOwnProfile && (
          <button
            onClick={() => onTabChange("saved")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "saved"
                ? "border-[#15B8A6] text-[#15B8A6]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Saved
          </button>
        )}
        <button
          onClick={() => onTabChange("about")}
          className={`py-4 px-2 border-b-2 font-medium transition-colors ${
            activeTab === "about"
              ? "border-[#15B8A6] text-[#15B8A6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          About
        </button>
      </div>
    </div>
  );
};

