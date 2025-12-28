import React, { useState, useEffect } from "react";
import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { showToast } from "../../utils";
import { commentService, type CommentResponse, type CommentSortOption, type ImageInfo } from "../../services";
import { ToastType } from "../../components/Toast";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  imageUrls?: ImageInfo[];
  postAuthorId?: string;
  onCommentAdded?: () => void;
  onCommentCountChange?: (count: number) => void;
}

const sortOptions: { value: CommentSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "mostLiked", label: "Most Liked" },
  { value: "helpful", label: "Helpful" },
];

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  commentsCount: initialCommentsCount,
  imageUrls = [],
  postAuthorId,
  onCommentAdded,
  onCommentCountChange,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<CommentSortOption>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const isPostAuthor = postAuthorId === user?.id;

  useEffect(() => {
    loadComments();
  }, [postId, sortOption, page]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await commentService.getComments(
        postId,
        page,
        10,
        sortOption
      );
      
      if (page === 0) {
        setComments(response.content);
      } else {
        setComments((prev) => [...prev, ...response.content]);
      }
      
      setHasMore(response.content.length === 10);
      setCommentsCount(response.totalElements);
      onCommentCountChange?.(response.totalElements);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentCreated = (newComment: CommentResponse) => {
    if (replyingTo) {
      // Add reply to parent comment
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingTo) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          // Also check nested replies
          const updateReplies = (comment: CommentResponse): CommentResponse => {
            if (comment.id === replyingTo) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
              };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(updateReplies),
              };
            }
            return comment;
          };
          return updateReplies(c);
        })
      );
      setReplyingTo(null);
    } else {
      // Add as top-level comment
      setComments((prev) => [newComment, ...prev]);
    }
    
    setCommentsCount((prev) => prev + 1);
    onCommentCountChange?.(commentsCount + 1);
    onCommentAdded?.();
  };

  const handleReply = (comment: CommentResponse) => {
    setReplyingTo(comment.id);
  };

  const handleSubmitReply = async (content: string) => {
    if (!replyingTo) return;
    try {
      const newComment = await commentService.createComment({
        postId,
        content,
        parentCommentId: replyingTo,
      });
      handleCommentCreated(newComment);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to post reply");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      if (comment.isLiked) {
        await commentService.unlikeComment(commentId, postId);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: false,
                  likesCount: Math.max(0, c.likesCount - 1),
                }
              : c
          )
        );
      } else {
        await commentService.likeComment(commentId, postId);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: true,
                  likesCount: c.likesCount + 1,
                }
              : c
          )
        );
      }
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to like comment");
    }
  };

  const handleMarkHelpful = async (commentId: string) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      if (comment.isHelpful) {
        await commentService.unmarkAsHelpful(commentId, postId);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, isHelpful: false } : c
          )
        );
      } else {
        await commentService.markAsHelpful(commentId, postId);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, isHelpful: true } : c
          )
        );
      }
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to mark comment");
    }
  };

  const handleSortChange = (sort: CommentSortOption) => {
    setSortOption(sort);
    setShowSortDropdown(false);
    setPage(0);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          Comments ({commentsCount})
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sortOptions.find((opt) => opt.value === sortOption)?.label}
            <ChevronDownIcon
              className={cn(
                "w-4 h-4 transition-transform",
                showSortDropdown && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                      sortOption === option.value &&
                        "bg-gray-50 text-[#15B8A6] font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-4 border-b border-gray-200">
        <CommentInput
          postId={postId}
          imageUrls={imageUrls}
          onCommentCreated={handleCommentCreated}
        />
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLikeComment}
              onReply={handleReply}
              onMarkHelpful={handleMarkHelpful}
              isPostAuthor={isPostAuthor}
              showHelpfulButton={isPostAuthor}
              replyingTo={replyingTo}
              onSubmitReply={handleSubmitReply}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))
        )}

        {hasMore && !isLoading && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="w-full py-2 text-sm text-[#15B8A6] hover:underline font-medium"
          >
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
};





