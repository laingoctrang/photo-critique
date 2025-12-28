import { useEffect, useState, useRef, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { userService, type UserListItemResponse } from "../../services";
import { Loading, Button } from "../../components";
import { useNavigate } from "react-router-dom";
import { useFollowUser } from "../../hooks";
import { showToast } from "../../utils";
import { ToastType } from "../../components";

const PAGE_SIZE = 20;

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
  title: string;
}

export const FollowersFollowingModal: React.FC<FollowersFollowingModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
  title,
}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadData = async () => {
      setIsLoading(true);
      setPage(0);
      setUsers([]);
      setHasMore(true);

      try {
        const response = type === "followers"
          ? await userService.getFollowers(userId, 0, PAGE_SIZE)
          : await userService.getFollowing(userId, 0, PAGE_SIZE);

        setUsers(response.content);
        setHasMore(response.content.length === PAGE_SIZE && response.number < response.totalPages - 1);
        setPage(1);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load users";
        showToast(ToastType.ERROR, errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, userId, type]);

  // Load more
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !userId) return;

    try {
      setIsLoadingMore(true);
      const response = type === "followers"
        ? await userService.getFollowers(userId, page, PAGE_SIZE)
        : await userService.getFollowing(userId, page, PAGE_SIZE);

      if (response.content.length === 0) {
        setHasMore(false);
        return;
      }

      setUsers((prev) => [...prev, ...response.content]);
      setHasMore(response.content.length === PAGE_SIZE && response.number < response.totalPages - 1);
      setPage((prev) => prev + 1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load more users";
      showToast(ToastType.ERROR, errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore, userId, type]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && isOpen) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMore, isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No {type === "followers" ? "followers" : "following"} yet
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  onUserClick={() => {
                    onClose();
                    navigate(`/${user.username}`);
                  }}
                />
              ))}
              
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                </div>
              )}

              {/* Observer target */}
              {hasMore && !isLoadingMore && (
                <div ref={observerTarget} className="h-4" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface UserListItemProps {
  user: UserListItemResponse;
  onUserClick: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onUserClick }) => {
  const { follow, unfollow, isLoading } = useFollowUser({
    userId: user.id,
    isFollowing: user.isFollowing || false,
    followStatus: user.followStatus,
    onFollowSuccess: () => {
      // Update local state if needed
    },
    onUnfollowSuccess: () => {
      // Update local state if needed
    },
  });

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.isFollowing) {
      unfollow();
    } else {
      follow();
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onUserClick}
    >
      <img
        src={user.profilePicture || "/default-avatar.png"}
        alt={user.username}
        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
          {user.isOnline && (
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
      </div>
      <Button
        variant={user.isFollowing ? "secondary" : user.followStatus === "PENDING" ? "secondary" : "primary"}
        size="small"
        onClick={handleFollowClick}
        disabled={isLoading}
        className="flex-shrink-0"
      >
        {isLoading ? "..." : user.isFollowing ? "Following" : user.followStatus === "PENDING" ? "Pending" : "Follow"}
      </Button>
    </div>
  );
};

