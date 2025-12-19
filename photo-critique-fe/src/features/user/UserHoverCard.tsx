import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { UserPostResponse } from "../../services";
import { useFollowUser } from "../../hooks";
import { ProfileStats, UnfollowModal } from "../../features/user";

interface UserHoverCardProps {
    user: UserPostResponse;
    isOwnProfile: boolean;
    onFollow?: () => void;
    onUserUpdate?: (updates: Partial<UserPostResponse>) => void;
}

export const UserHoverCard: React.FC<UserHoverCardProps> = ({
    user,
    isOwnProfile,
    onFollow,
    onUserUpdate,
}) => {
  const [hoverUser, setHoverUser] = useState(user);

  const { follow, unfollow, showConfirmUnfollowModal, setShowConfirmUnfollowModal } = useFollowUser({
    userId: hoverUser.id,
    isFollowing: hoverUser.isFollowing,
    onFollowSuccess: () => {
      const updatedUser = {
        ...hoverUser,
        isFollowing: true,
        followersCount: (hoverUser.followersCount || 0) + 1,
      };
      setHoverUser(updatedUser);
      onUserUpdate?.(updatedUser);
      onFollow?.();
    },
    onUnfollowSuccess: () => {
      const updatedUser = {
        ...hoverUser,
        isFollowing: false,
        followersCount: Math.max((hoverUser.followersCount || 0) - 1, 0),
      };
      setHoverUser(updatedUser);
      onUserUpdate?.(updatedUser);
      onFollow?.();
    },
  });

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    follow();
  };

  const handleUnfollowClick = () => {
    unfollow();
  };

  // Update hoverUser when user prop changes (only when user.id changes to avoid overwriting local state)
  const prevUserIdRef = useRef<string>(user.id);
  useEffect(() => {
    if (user.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user.id;
      setHoverUser(user);
    }
  }, [user, user.id]);

  return (
    <>
      <div 
        className="absolute top-8 left-0 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-[fadeInSlideDown_0.2s_ease-out_forwards]"
        onMouseEnter={(e) => {
          e.stopPropagation();
        }}
        onMouseLeave={() => {}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 p-5">
          {/* Header with Avatar and Name */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={hoverUser.profilePicture || "/default-avatar.png"}
                alt={hoverUser.username}
                className="w-18 h-18 rounded-full object-cover border-2 border-gray-200"
              />
              {hoverUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate" title={hoverUser.fullName}>{hoverUser.fullName}</h2>
              <p className="text-sm text-gray-900 font-light truncate">@{hoverUser.username}</p>
              <p className="text-sm text-gray-900 font-light italic truncate">Level {hoverUser.level} - {hoverUser.xpPoints} XP</p>
            </div>
          </div>

          {/* Stats */}
          {!isOwnProfile && (
            <ProfileStats 
              followersCount={hoverUser.followersCount || 0} 
              followingCount={hoverUser.followingCount || 0} 
              size="small"
            />
          )}

          {/* Follow Button */}
          {!isOwnProfile && (
            <Button
              variant={hoverUser.isFollowing ? "secondary" : "primary"}
              className="w-full rounded-xl"
              onClick={handleFollowClick}
              leftIcon={hoverUser.isFollowing ? undefined : ({ className }) => <PlusIcon className={`${className} text-white stroke-[3] p-0.5 rounded-full border-1 border-white`} />}
            >
              {!hoverUser.isFollowing ? "Follow" : hoverUser.followStatus === "PENDING" ? "Pending" : "Following"}
            </Button>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <UnfollowModal
          isOpen={showConfirmUnfollowModal}
          onClose={() => setShowConfirmUnfollowModal(false)}
          onConfirm={handleUnfollowClick}
        />
      </div>
    </>
  );
};
