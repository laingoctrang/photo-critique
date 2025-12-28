import React, { useState } from "react";
import { formatTimeAgo } from "../../utils";
import {
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  HandThumbUpIcon as HandThumbUpIconSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import { type CommentResponse } from "../../services";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "../../components/common/Button";
import { CommentImage } from "./CommentImage";
import { Checkbox } from "../../components";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentItemProps {
  comment: CommentResponse;
  onLike?: (commentId: string) => void;
  onReply?: (comment: CommentResponse) => void;
  onMarkHelpful?: (commentId: string) => void;
  isPostAuthor?: boolean;
  showHelpfulButton?: boolean;
  replyingTo?: string | null;
  onSubmitReply?: (content: string) => Promise<void>;
  onCancelReply?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (commentId: string) => void;
  selectedCommentIds?: Set<string>;
  showReplies?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onMarkHelpful,
  isPostAuthor = false,
  showHelpfulButton = false,
  replyingTo,
  onSubmitReply,
  onCancelReply,
  selectable = false,
  isSelected = false,
  onSelect,
  selectedCommentIds,
  showReplies = true,
}) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  const isReplying = replyingTo === comment.id;

  const timeAgo = formatTimeAgo(comment.createdAt);

  const handleLike = () => {
    if (onLike) {
      onLike(comment.id);
    }
  };

  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(comment.id);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onSubmitReply || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    try {
      await onSubmitReply(replyContent.trim());
      setReplyContent("");
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    // Only handle if not clicking directly on checkbox or its label
    const target = e.target as HTMLElement;
    if (target.closest('input[type="checkbox"]') || target.closest('label')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(comment.id);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(comment.id);
  };

  return (
    <div 
      className={cn("flex gap-3", selectable && "cursor-pointer")}
      onClick={selectable ? handleSelect : undefined}
    >
      {/* Selection checkbox */}
      {selectable && (
        <div className="flex items-start pt-2">
          <Checkbox
            checked={isSelected}
            onChange={handleCheckboxChange}
            tabIndex={-1}
            className="w-5 h-5 rounded border-gray-300 text-[#15B8A6] focus:ring-[#15B8A6]"
          />
        </div>
      )}

      {/* Avatar */}
      <img
        src={comment.user.profilePicture}
        alt={comment.user.username}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {comment.user.fullName}
          </span> 
          <span className="text-sm text-gray-500">{timeAgo}</span>
          {comment.isHelpful && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <StarIconSolid className="w-3 h-3" />
              Helpful
            </span>
          )}
        </div>

        {/* Comment Text */}
        <p className="text-gray-800 mb-1 whitespace-pre-wrap break-words text-sm">
          {comment.content}
        </p>

        {/* Generated Image */}
        {comment.aiGeneratedImage && (
            <CommentImage
              aiGeneratedImage={comment.aiGeneratedImage}
              originalImage={comment.originalImage}
            />
        )}

        {/* Actions */}
        {!selectable && (
          <div className="flex items-center gap-4 text-gray-600">
            {onLike && (
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1.5 hover:text-gray-900 transition-colors",
                  comment.isLiked && "text-[#15B8A6]"
                )}
              >
                {comment.isLiked ? (
                  <HandThumbUpIconSolid className="w-5 h-5" />
                ) : (
                  <HandThumbUpIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{comment.likesCount}</span>
              </button>
            )}

            {onReply && (
              <button
                onClick={() => onReply(comment)}
                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span className="text-sm">Reply</span>
              </button>
            )}

            {/* Mark as Helpful - Only show for post author */}
            {showHelpfulButton && isPostAuthor && !comment.isHelpful && (
              <button
                onClick={handleMarkHelpful}
                className="flex items-center gap-1.5 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <StarIcon className="w-5 h-5" />
                <span className="text-sm">Mark as helpful</span>
              </button>
            )}

            {/* Already marked as helpful */}
            {showHelpfulButton &&
              isPostAuthor &&
              comment.isHelpful &&
              onMarkHelpful && (
                <button
                  onClick={handleMarkHelpful}
                  className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <StarIconSolid className="w-5 h-5" />
                  <span className="text-sm">Marked as helpful</span>
                </button>
              )}
          </div>
        )}

        {/* Reply Input */}
        {isReplying && onSubmitReply && (
          <div className="mt-3 pl-4 border-l-2 border-gray-200">
            <div className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15B8A6] focus:border-transparent"
                rows={3}
                disabled={isSubmittingReply}
              />
              <div className="flex gap-2 justify-end">
                {onCancelReply && (
                  <Button
                    variant="outline"
                    onClick={onCancelReply}
                    disabled={isSubmittingReply}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmittingReply}
                  isLoading={isSubmittingReply}
                  className="shrink-0"
                >
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && (
          <>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-[#15B8A6] hover:underline font-medium"
              >
                View {comment.replies.length} reply
                {comment.replies.length !== 1 ? "ies" : ""}
              </button>
            )}

            {isExpanded && (
              <div className="mt-2 space-y-4 pl-4 border-l-2 border-gray-200">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onLike={onLike}
                    onReply={onReply}
                    isPostAuthor={isPostAuthor}
                    showHelpfulButton={showHelpfulButton}
                    replyingTo={replyingTo}
                    onSubmitReply={onSubmitReply}
                    onCancelReply={onCancelReply}
                    selectable={selectable}
                    isSelected={selectedCommentIds ? selectedCommentIds.has(reply.id) : false}
                    onSelect={onSelect}
                    selectedCommentIds={selectedCommentIds}
                  />
                ))}
                {isExpanded && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-sm text-[#15B8A6] hover:underline font-medium"
                  >
                    Hide replies
                  </button>
                )}
                </div>
              )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

