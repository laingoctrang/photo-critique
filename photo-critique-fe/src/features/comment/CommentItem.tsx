import React, { useState, useEffect, useRef } from "react";
import { formatTimeAgo } from "../../utils";
import {
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
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
import { Checkbox, Modal } from "../../components";
import { useAuth } from "../../hooks";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentItemProps {
  comment: CommentResponse;
  onLike?: (commentId: string) => void;
  onReply?: (comment: CommentResponse) => void;
  onMarkHelpful?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string, isTopLevel?: boolean) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
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
  onEdit,
  onDelete,
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
  const { user } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<number | null>(null);
  
  const isReplying = replyingTo === comment.id;
  const isCommentAuthor = comment.user?.id === user?.id && !comment.isDelete;

  const timeAgo = formatTimeAgo(comment.createdAt);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutId = menuTimeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

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

  const handleEditClick = () => {
    // If this is a top-level comment (no parentCommentId), edit via CommentInput
    if (!comment.parentCommentId && onEdit) {
      onEdit(comment.id, comment.content, true);
      setShowMenu(false);
      return;
    }
    
    // Otherwise, edit inline (for replies)
    setIsEditing(true);
    setEditContent(comment.content);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSubmitEdit = async () => {
    if (!editContent.trim() || !onEdit || isSubmittingEdit) return;
    
    setIsSubmittingEdit(true);
    try {
      await onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(comment.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
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
        src={comment.isDelete ? "https://res.cloudinary.com/dxfoqdajm/image/upload/v1767462326/photocritique/1fc899c8-dc66-42a8-8582-263f86369f49.webp" : comment.user?.profilePicture}
        alt={comment.user?.username}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold",
              comment.isDelete ? "text-gray-400" : "text-gray-900"
            )}>
              {comment.isDelete ? "Unknown User" : comment.user?.fullName}
            </span> 
            <span className="text-sm text-gray-500">{timeAgo}</span>
            {comment.isHelpful && !comment.isDelete && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <StarIconSolid className="w-3 h-3" />
                Helpful
              </span>
            )}
          </div>

          {/* Menu button - Only show for comment author and not deleted */}
          {isCommentAuthor && !comment.isDelete && !selectable && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleEditClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 text-gray-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Text or Edit Mode */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#15B8A6] focus:border-transparent"
              rows={3}
              disabled={isSubmittingEdit}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmittingEdit}
                className="shrink-0"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={!editContent.trim() || isSubmittingEdit || editContent === comment.content}
                isLoading={isSubmittingEdit}
                className="shrink-0"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className={cn(
              "mb-1 whitespace-pre-wrap break-words text-sm",
              comment.isDelete ? "text-gray-400 italic" : "text-gray-800"
            )}>
              {comment.content}
            </p>

            {/* Generated Image - Only show if not deleted */}
            {comment.aiGeneratedImage && !comment.isDelete && (
                <CommentImage
                  aiGeneratedImage={comment.aiGeneratedImage}
                  originalImage={comment.originalImage}
                />
            )}
          </>
        )}

        {/* Actions - Hide for deleted comments */}
        {!selectable && !comment.isDelete && (
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
            {showHelpfulButton && isPostAuthor && !comment.isHelpful && comment.user?.id !== user?.id && (
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
              comment.user?.id !== user?.id && (
                <button
                  onClick={handleMarkHelpful}
                  className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <StarIconSolid className="w-5 h-5" />
                  <span className="text-sm">Unmark as helpful</span>
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
          <div className="mt-1">
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs italic cursor-pointer text-[#15B8A6] hover:underline font-medium"
              >
                View {comment.replies.length} {comment.replies.length !== 1 ? "replies" : "reply"}
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
                    onEdit={onEdit}
                    onDelete={onDelete}
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
                    className="text-xs italic cursor-pointer text-[#15B8A6] hover:underline font-medium"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
};

