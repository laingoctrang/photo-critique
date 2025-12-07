import React, { useState } from "react";
import { formatTimeAgo } from "../../utils/timeUtils";
import {
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  HandThumbUpIcon as HandThumbUpIconSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import type { CommentResponse } from "../../services/commentService";
import { useAuth } from "../../hooks";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentItemProps {
  comment: CommentResponse;
  onLike: (commentId: string) => void;
  onReply?: (comment: CommentResponse) => void;
  onMarkHelpful?: (commentId: string) => void;
  isPostAuthor?: boolean;
  showHelpfulButton?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onMarkHelpful,
  isPostAuthor = false,
  showHelpfulButton = false,
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const timeAgo = formatTimeAgo(comment.createdAt);

  const handleLike = () => {
    onLike(comment.id);
  };

  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(comment.id);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <img
        src={comment.user.profilePicture}
        alt={comment.user.username}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
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
        <p className="text-gray-800 mb-2 whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Generated Image */}
        {comment.aiGeneratedImage && (
          <div className="mb-3 rounded-lg overflow-hidden max-w-sm">
            <img
              src={comment.aiGeneratedImage}
              alt="AI generated image"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-600">
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

        {/* Replies */}
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
      </div>
    </div>
  );
};
