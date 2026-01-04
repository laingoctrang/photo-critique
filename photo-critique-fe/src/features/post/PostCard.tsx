import React, { useEffect, useState, useRef } from "react";
import { PrivacyType, ReactionType, ReportContentType } from "../../types";
import { Reaction, ContentExpandable, ImageCarousel, ToastType, Button, ReportModal, Modal } from "../../components";
import { showToast, formatDateTime } from "../../utils";
import { postService, type PostListItemResponse, type UserPostResponse } from "../../services";
import {
  BookmarkIcon,
  ChatBubbleBottomCenterIcon,
  EllipsisHorizontalIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  ArrowLeftIcon,
  UsersIcon,
  // ShareIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid, SparklesIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { UserHoverCard } from "../user";
import { CreateImageFromCommentsModal } from "../comment/CreateImageFromCommentsModal";

interface PostCardProps {
  post: PostListItemResponse;
  isViewDetail?: boolean;
  onPostClick?: (postId: string) => void;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isViewDetail = false,
  onPostClick,
  showBackButton = false,
  onBackButtonClick = () => { },
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentPost, setCurrentPost] = useState<PostListItemResponse>(post);

  const isPostAuthor = currentPost.user.id === user?.id;

  const [imgRatio, setImgRatio] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isHovering, setIsHovering] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const [showCreateImageModal, setShowCreateImageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const menuTimeoutRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync currentPost with post prop when it changes
  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  useEffect(() => {
    let mounted = true;

    const loadSizes = async () => {
      try {
        const promises = post.imageUrls.map(
          (img) =>
            new Promise<{ w: number; h: number }>((resolve) => {
              const el = document.createElement("img");
              el.onload = () =>
                resolve({ w: el.naturalWidth || 1, h: el.naturalHeight || 1 });
              el.onerror = () => resolve({ w: 800, h: 800 }); // fallback square
              el.src = img.url;
            })
        );

        const sizes = await Promise.all(promises);
        if (!mounted) return;

        // landscape: w > h
        const landscape = sizes.filter((s) => s.w > s.h);

        if (landscape.length > 0) {
          const ratio = Math.max(...landscape.map((s) => s.w / s.h));
          setImgRatio(Number(ratio.toFixed(4)));
          return;
        }

        const screenW = window.innerWidth;
        let fallbackRatio = 3 / 4; // default mobile (taller)

        if (screenW < 640) {
          fallbackRatio = 2 / 3; // mobile
        } else if (screenW < 1024) {
          fallbackRatio = 4 / 5; // tablet
        } else {
          fallbackRatio = 3 / 2; // laptop/desktop
        }

        setImgRatio(Number(fallbackRatio.toFixed(4)));
      } catch {
        setImgRatio(Number((3 / 2).toFixed(4)));
      }
    };

    if (post.imageUrls.length > 0) loadSizes();
    else setImgRatio(null);

    return () => {
      mounted = false;
    };
  }, [post]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const formattedDate = formatDateTime(post.createdAt);

  const privacyIcon = (privacy: PrivacyType): React.ReactNode => {
    switch (privacy) {
      case PrivacyType.PUBLIC:
        return <GlobeAltIcon className="w-4 h-4" title="Public" />;
      case PrivacyType.PRIVATE:
        return <LockClosedIcon className="w-4 h-4" title="Private" />;
      case PrivacyType.FOLLOWER_ONLY:
        return <UsersIcon className="w-4 h-4" title="Follower Only" />;
      default:
        return "";
    }
  };

  const handleReaction = async (
    postId: string,
    reactionType: ReactionType | null
  ) => {
    const previousReaction = currentPost.userReaction;
    const previousLikesCount = currentPost.likesCount;
    const wasLiked = previousReaction !== null && previousReaction !== undefined;
    const willBeLiked = reactionType !== null;

    try {
      // Optimistic update
      setCurrentPost((prev) => {
        const newLikesCount = wasLiked && !willBeLiked
          ? Math.max(0, (prev.likesCount || 0) - 1)
          : !wasLiked && willBeLiked
            ? (prev.likesCount || 0) + 1
            : prev.likesCount || 0;

        return {
          ...prev,
          userReaction: reactionType ?? undefined,
          likesCount: newLikesCount,
        };
      });

      if (reactionType !== null) {
        await postService.addReaction(postId, reactionType);
      } else {
        await postService.removeReaction(postId);
      }
    } catch (error: unknown) {
      // Revert on error - reload post data
      try {
        const updatedPost = await postService.getPostById(postId);
        // Convert PostResponse to PostListItemResponse format
        setCurrentPost({
          id: updatedPost.id,
          user: updatedPost.user,
          caption: updatedPost.caption,
          imageUrls: updatedPost.imageUrls,
          privacy: updatedPost.privacy,
          status: updatedPost.status || currentPost.status,
          likesCount: updatedPost.likesCount,
          commentsCount: updatedPost.commentsCount,
          sharesCount: updatedPost.sharesCount,
          isLiked: updatedPost.isLiked,
          userReaction: updatedPost.userReaction,
          isSaved: updatedPost.isSaved,
          createdAt: updatedPost.createdAt,
        });
      } catch {
        // If reload fails, just revert to previous state
        setCurrentPost((prev) => ({
          ...prev,
          userReaction: previousReaction ?? undefined,
          likesCount: previousLikesCount,
        }));
      }
      const errorMessage = error instanceof Error ? error.message : "Failed to update reaction";
      showToast(ToastType.ERROR, errorMessage);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      setIsSaving(true);
      let result: boolean | string = true;
      if (currentPost.isSaved) {
        result = await postService.unsavePost(postId);
      } else {
        result = await postService.savePost(postId);
      }
      if (result)
        setCurrentPost((prev: PostListItemResponse) => ({ ...prev, isSaved: !prev.isSaved }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save post";
      showToast(ToastType.ERROR, message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPost = () => {
    // TODO: Navigate to edit page
    navigate(`/create?edit=${currentPost.id}`);
    // showToast(ToastType.INFO, "Edit post functionality coming soon");
    setShowMenu(false);
  };

  const handleDeletePost = async () => {
    const result = await postService.softDeletePost(currentPost.id);
    if (result) {
      showToast(ToastType.SUCCESS, "Post deleted successfully");
      setCurrentPost({} as PostListItemResponse);
      navigate("/");
    } else {
      showToast(ToastType.ERROR, result as string);
    }
    setShowMenu(false);
  };

  const handleReportPost = () => {
    setShowReportModal(true);
    setShowMenu(false);
  };

  return (
    <div
      className={`bg-white rounded-3xl
                w-full max-w-full h-full
                mx-auto px-4 sm:px-0
                ${isViewDetail ? "" : "shadow-sm sm:max-w-md md:max-w-lg lg:max-w-3xl"}`}
      data-post-id={currentPost.id}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Header Left */}
        <div className="relative flex items-center justify-between">
          {showBackButton && (
            <Button
              variant="ghost"
              size="medium"
              onClick={onBackButtonClick}
              className="text-sm text-gray-600 hover:text-gray-800 w-10 h-10 mr-2 ml-[-10px]"
              title="Back"
              leftIcon={ArrowLeftIcon}
            >
            </Button>
          )}
          <img
            src={currentPost.user.profilePicture}
            alt={currentPost.user.username}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onClick={() => { navigate(`/${currentPost.user.username}`) }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setIsHovering(true);
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = window.setTimeout(() => {
                setIsHovering(false);
                hoverTimeoutRef.current = null;
              }, 150); // Delay 150ms before hiding
            }}
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">
              {currentPost.user.fullName}
            </p>
            <p className="flex items-center gap-1 text-xs text-gray-500 justify-center">
              @{currentPost.user.username} · {formattedDate} · {privacyIcon(currentPost.privacy)}
            </p>
          </div>

          {isHovering && (
            <div
              className="absolute"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setIsHovering(true);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = window.setTimeout(() => {
                  setIsHovering(false);
                  hoverTimeoutRef.current = null;
                }, 150);
              }}
            >
              <UserHoverCard
                user={currentPost.user}
                isOwnProfile={isPostAuthor}
                onFollow={() => { }}
                onUserUpdate={(updates) => {
                  setCurrentPost((prev: PostListItemResponse) => ({ ...prev, user: updates as UserPostResponse }));
                }}
              />
            </div>
          )}
        </div>

        {/* Header Right */}
        <div className="flex items-center justify-between">
          {currentPost.imageUrls && currentPost.imageUrls.length > 0 && currentPost.commentsCount > 0 && (
            <Button
              variant="primary"
              size="medium"
              onClick={() => setShowCreateImageModal(true)}
              className="gap-0 md:gap-2 text-sm bg-[#15B8A6]/10 text-[#15B8A6] font-bold hover:bg-[#15B8A6]/15 hover:animate-pulse"
              title="Create image from comments"
              leftIcon={SparklesIcon}
            >
              <span className="hidden md:block">AI Edit</span>
            </Button>
          )}
          <div className="ml-3 relative" ref={menuRef}>
            <div
              className="cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              onMouseEnter={() => {
                if (menuTimeoutRef.current) {
                  clearTimeout(menuTimeoutRef.current);
                  menuTimeoutRef.current = null;
                }
                setShowMenu(true);
              }}
              onMouseLeave={() => {
                menuTimeoutRef.current = window.setTimeout(() => {
                  setShowMenu(false);
                  menuTimeoutRef.current = null;
                }, 150);
              }}
            >
              <EllipsisHorizontalIcon className="w-6 h-6 text-gray-600" />
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onMouseEnter={() => {
                  if (menuTimeoutRef.current) {
                    clearTimeout(menuTimeoutRef.current);
                    menuTimeoutRef.current = null;
                  }
                  setShowMenu(true);
                }}
                onMouseLeave={() => {
                  menuTimeoutRef.current = window.setTimeout(() => {
                    setShowMenu(false);
                    menuTimeoutRef.current = null;
                  }, 150);
                }}
              >
                {isPostAuthor ? (
                  <>
                    <button
                      onClick={handleEditPost}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <PencilIcon className="w-5 h-5 text-gray-600" />
                      <span>Edit post</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                      <span>Delete post</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReportPost}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <FlagIcon className="w-5 h-5 text-red-600" />
                    <span>Report post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image */}
      {currentPost.imageUrls.length > 0 && imgRatio && (
        <div className={`block px-4 ${currentPost.caption ? "" : "pb-4"}`}>
            <div className="w-full" style={{ aspectRatio: imgRatio }}>
              <ImageCarousel
                images={currentPost.imageUrls.map((img) => img.url)}
                fitMode="contain"
                showPreview={true}
              />
            </div>
          </div>
        )}

      {/* Caption */}
      {currentPost.caption && (
        <ContentExpandable
          text={currentPost.caption}
          scrollTargetSelector="[data-post-id]"
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        {/* Left foooter */}
        <div className="flex gap-6 items-center">
          <div className="flex gap-1 items-center">
            {/* Reaction Button */}
            <Reaction
              targetId={currentPost.id}
              initialUserReaction={currentPost.userReaction}
              onReaction={handleReaction}
              size="md"
              showCount={false}
            />
            <span className="text-gray-600">{currentPost.likesCount}</span>
          </div>
          <div
            className="flex gap-1 items-center hover:underline cursor-pointer"
            onClick={() => {
              if (onPostClick) {
                onPostClick(currentPost.id);
              } else {
                navigate(`/post/${currentPost.id}`);
              }
            }}
          >
            <ChatBubbleBottomCenterIcon className="w-6 h-6 text-gray-600" />
            <span className="text-gray-600">{currentPost.commentsCount}</span>
          </div>
          {/* <div className="flex gap-1 items-center">
            <ShareIcon className="w-6 h-6 text-gray-600" />
            <span className="text-gray-600">{currentPost.sharesCount}</span>
          </div> */}

        </div>

        {/* Right foooter */}
        {!isPostAuthor && (
          <div
            className={`cursor-pointer ${isSaving ? "opacity-50 pointer-events-none" : ""
              }`}
            onClick={() => handleSavePost(currentPost.id)}
          >
            {currentPost.isSaved ? (
              <BookmarkIconSolid className="w-6 h-6 text-[#15B8A6]" />
            ) : (
              <BookmarkIcon className="w-6 h-6 text-gray-600" />
            )}
          </div>
        )}
      </div>

      {/* Create Image from Comments Modal */}
      {currentPost.imageUrls && currentPost.imageUrls.length > 0 && (
        <CreateImageFromCommentsModal
          isOpen={showCreateImageModal}
          onClose={() => setShowCreateImageModal(false)}
          postId={currentPost.id}
          imageUrls={currentPost.imageUrls}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType={ReportContentType.POST}
        contentId={currentPost.id}
        onReportSubmitted={() => {
          // Optionally refresh post data or show confirmation
        }}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
        message={`Are you sure you want to delete this post?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeletePost}
        variant="danger"
        showCancel={false}
      />
    </div>


  );
};
