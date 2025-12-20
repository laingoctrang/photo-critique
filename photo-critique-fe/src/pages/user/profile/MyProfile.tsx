import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loading, ToastType } from "../../../components";
import { showToast } from "../../../utils";
import { ProfileHeader, ProfileTabs, PostsGrid, AboutSection } from "../../../features/user";
import { PostDetailModal } from "../../../features";
import type { TabType } from "../../../features/user/ProfileTabs";
import { userService, type PostListItemResponse, type UserProfileResponse } from "../../../services";

export const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<PostListItemResponse[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostListItemResponse[]>([]);
  const [draftPosts, setDraftPosts] = useState<PostListItemResponse[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await userService.getProfile();
        setProfile(profileData);
        
        // Load posts count
        const postsResponse = await userService.getPostsByUserId(profileData.id, 0, 1);
        setPostsCount(postsResponse.totalElements);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
        showToast(ToastType.ERROR, errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const loadPosts = async () => {
      try {
        setIsLoadingPosts(true);
        if (activeTab === "posts") {
          const response = await userService.getPostsByUserId(profile.id, 0, 20);
          setPosts(response.content);
        } else if (activeTab === "saved") {
          const response = await userService.getSavedPosts(0, 20);
          setSavedPosts(response.content);
        } else if (activeTab === "drafted") {
          const response = await userService.getDraftPosts(0, 20);
          setDraftPosts(response.content);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load posts";
        showToast(ToastType.ERROR, errorMessage);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPosts();
  }, [profile, activeTab]);

  const handleFollow = () => {
    // Not applicable for own profile
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading variant="fullscreen" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Profile not found</div>
      </div>
    );
  }

  const getDisplayPosts = () => {
    if (activeTab === "posts") return posts;
    if (activeTab === "saved") return savedPosts;
    if (activeTab === "drafted") return draftPosts;
    return [];
  };

  const displayPosts = getDisplayPosts();

  const handlePostClick = (postId: string) => {
    if (activeTab === "drafted") {
      // Navigate to create page with postId to edit draft
      navigate(`/create?edit=${postId}`);
    } else {
      setSelectedPostId(postId);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="min-w-5xl mx-auto">
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          postsCount={postsCount}
          onFollow={handleFollow}
        />
      </div>
      

      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl shadow-sm">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOwnProfile={true}
          />

          <div className="p-6 mt-2">
            {activeTab === "about" ? (
              <AboutSection profile={profile} />
            ) : (
              <PostsGrid
                posts={displayPosts}
                isLoading={isLoadingPosts}
                onPostClick={handlePostClick}
                emptyMessage={`No ${activeTab === "saved" ? "saved " : activeTab === "drafted" ? "drafted " : ""}posts yet`}
              />
            )}
          </div>
        </div>
      </div>

      {selectedPostId && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}
    </div>
  );
};

