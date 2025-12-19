import { useState } from "react";
import { userService } from "../services";
import { showToast } from "../utils";
import { ToastType } from "../components";

interface UseFollowUserOptions {
  userId: string;
  isFollowing: boolean;
  onFollowSuccess?: () => void;
  onUnfollowSuccess?: () => void;
}

export const useFollowUser = ({ 
  userId, 
  isFollowing, 
  onFollowSuccess, 
  onUnfollowSuccess 
}: UseFollowUserOptions) => {
  const [showConfirmUnfollowModal, setShowConfirmUnfollowModal] = useState(false);

  const follow = async () => {
    if (!userId) return;
    
    if (isFollowing) {
      setShowConfirmUnfollowModal(true);
      return;
    }

    await userService.followUser(userId);
    onFollowSuccess?.();
    showToast(ToastType.SUCCESS, "Followed successfully");
  };

  const unfollow = async () => {
    if (!userId || !isFollowing) return;

    await userService.unfollowUser(userId);
    onUnfollowSuccess?.();
    setShowConfirmUnfollowModal(false);
    showToast(ToastType.SUCCESS, "Unfollowed successfully");
  };

  return {
    follow,
    unfollow,
    showConfirmUnfollowModal,
    setShowConfirmUnfollowModal,
  };
};

