import { useState } from "react";
import { userService } from "../services";
import { showToast } from "../utils";
import { ToastType } from "../components";

interface UseFollowUserOptions {
  userId: string;
  isFollowing: boolean;
  followStatus?: string; // PENDING, ACCEPTED, etc.
  onFollowSuccess?: () => void;
  onUnfollowSuccess?: () => void;
  onPendingCancelSuccess?: () => void;
}

export const useFollowUser = ({ 
  userId, 
  isFollowing, 
  followStatus,
  onFollowSuccess, 
  onUnfollowSuccess,
  onPendingCancelSuccess
}: UseFollowUserOptions) => {
  const [showConfirmUnfollowModal, setShowConfirmUnfollowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const follow = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // If pending, cancel the request (by calling follow again which will delete the pending request)
      if (followStatus === "PENDING") {
        await userService.followUser(userId);
        onPendingCancelSuccess?.();
        showToast(ToastType.SUCCESS, "Follow request canceled");
      } else if (isFollowing) {
        setShowConfirmUnfollowModal(true);
      } else {
        await userService.followUser(userId);
        onFollowSuccess?.();
        showToast(ToastType.SUCCESS, "Followed successfully");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to follow user";
      showToast(ToastType.ERROR, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollow = async () => {
    if (!userId || !isFollowing) return;

    setIsLoading(true);
    try {
      await userService.unfollowUser(userId);
      onUnfollowSuccess?.();
      setShowConfirmUnfollowModal(false);
      showToast(ToastType.SUCCESS, "Unfollowed successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unfollow user";
      showToast(ToastType.ERROR, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    follow,
    unfollow,
    showConfirmUnfollowModal,
    setShowConfirmUnfollowModal,
    isLoading,
  };
};

