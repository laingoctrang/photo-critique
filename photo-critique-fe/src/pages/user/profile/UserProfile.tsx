import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userService, type UserProfileResponse, type PostListItemResponse } from "../../../services";
import { Loading, ToastType } from "../../../components";
import { showToast } from "../../../utils";
import { ProfileHeader, ProfileTabs, PostsGrid, AboutSection, UnfollowModal } from "../../../features/user";
import { PostDetailModal } from "../../../features";
import type { TabType } from "../../../features/user/ProfileTabs";
import { useFollowUser } from "../../../hooks";

export const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<PostListItemResponse[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      
      try {
        setIsLoading(true);
        const profileData = await userService.getUserProfileByUsername(username);
        setProfile(profileData);
        
        // Load posts count
        const postsResponse = await userService.getPostsByUserId(profileData.id, 0, 1);
        setPostsCount(postsResponse.totalElements);
      } catch (error: any) {
        showToast(ToastType.ERROR, error?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  useEffect(() => {
    if (!profile) return;

    const loadPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const response = await userService.getPostsByUserId(profile.id, 0, 20);
        setPosts(response.content);
      } catch (error: any) {
        showToast(ToastType.ERROR, error?.message || "Failed to load posts");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    if (activeTab === "posts") {
      loadPosts();
    }
  }, [profile, activeTab]);

  const { follow, unfollow, showConfirmUnfollowModal, setShowConfirmUnfollowModal } = useFollowUser({
    userId: profile?.id || "",
    isFollowing: profile?.isFollowing || false,
    followStatus: profile?.followStatus,
    onFollowSuccess: async () => {
      // Reload profile to get latest data from server
      try {
        const profileData = await userService.getUserProfileByUsername(username || "");
        setProfile(profileData);
      } catch (error: any) {
        // Fallback to optimistic update
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isFollowing: prev.followStatus === "ACCEPTED" || !prev.followStatus, // Set to true if ACCEPTED or new follow
            followStatus: prev.followStatus || "ACCEPTED",
            followersCount: (prev.followersCount || 0) + (prev.followStatus === "ACCEPTED" || !prev.followStatus ? 1 : 0),
          };
        });
      }
    },
    onUnfollowSuccess: async () => {
      // Reload profile to get latest data from server
      try {
        const profileData = await userService.getUserProfileByUsername(username || "");
        setProfile(profileData);
      } catch (error: any) {
        // Fallback to optimistic update
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isFollowing: false,
            followStatus: undefined,
            followersCount: Math.max((prev.followersCount || 0) - 1, 0),
          };
        });
      }
    },
    onPendingCancelSuccess: async () => {
      // Reload profile after canceling pending request
      try {
        const profileData = await userService.getUserProfileByUsername(username || "");
        setProfile(profileData);
      } catch (error: any) {
        // Fallback to optimistic update
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isFollowing: false,
            followStatus: undefined,
          };
        });
      }
    },
  });

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

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      <div className="min-w-5xl mx-auto">
        <ProfileHeader
          profile={profile}
          isOwnProfile={false}
          postsCount={postsCount}
          onFollow={follow}
        />
      </div>
      

      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl shadow-sm">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOwnProfile={false}
          />

          <div className="p-6">
            {activeTab === "about" ? (
              <AboutSection profile={profile} />
            ) : (
              <PostsGrid
                posts={posts}
                isLoading={isLoadingPosts}
                onPostClick={setSelectedPostId}
                emptyMessage="No posts yet"
              />
            )}
          </div>
        </div>
      </div>

      {selectedPostId && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}

      <UnfollowModal
        isOpen={showConfirmUnfollowModal}
        onClose={() => setShowConfirmUnfollowModal(false)}
        onConfirm={unfollow}
      />
    </div>
  );
};

