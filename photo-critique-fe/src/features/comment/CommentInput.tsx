import React, { useEffect, useRef, useState } from "react";
import {
  SparklesIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button, Modal } from "../../components/common";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  type ImageInfo,
  commentService,
  type CommentResponse,
  generateService,
} from "../../services";
import { CommentImage } from "./CommentImage";
import { showToast } from "../../utils";
import { ToastType } from "../../components/Toast";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentInputProps {
  postId: string;
  placeholder?: string;
  imageUrls?: ImageInfo[];
  disabled?: boolean;
  onCommentCreated?: (comment: CommentResponse) => void;
  editingComment?: CommentResponse | null;
  onCancelEdit?: () => void;
  onCommentUpdated?: (comment: CommentResponse) => void;
}

type ModalType = "post-with-image" | null;

export const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  placeholder = "Enter your comment",
  imageUrls = [],
  disabled = false,
  onCommentCreated,
  editingComment = null,
  onCancelEdit,
  onCommentUpdated,
}) => {
  const MAX_COMMENT_LENGTH = 1000;
  const [content, setContent] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<"uploading" | "editing" | "done" | null>(null);
  const [showModal, setShowModal] = useState<ModalType>(null);

  // Filter only images (not videos)
  const availableImages = imageUrls.filter((img) =>
    img.contentType?.startsWith("image/")
  );

  const selectedImage =
    selectedImageIndex !== null ? availableImages[selectedImageIndex] : null;

  // Load editing comment data
  useEffect(() => {
    if (editingComment) {
      // Find and set the original image index
      if (editingComment.originalImage) {
        const imageIndex = availableImages.findIndex(
          (img) => img.url === editingComment.originalImage
        );
        
        if (imageIndex === -1) {
          showToast(ToastType.WARNING, "The original image for this comment is no longer available (may have been deleted or updated)");
          return;
        } else {
          setContent(editingComment.content);
          setGeneratedImageUrl(editingComment.aiGeneratedImage || null);
          setSelectedImageIndex(imageIndex);
          setIsEditing(true);
        }
      } else {
        setSelectedImageIndex(null);
        setContent(editingComment.content);
        setGeneratedImageUrl(editingComment.aiGeneratedImage || null);
        setIsEditing(true);
      }
    } else {
      // Reset form when not editing
      setIsEditing(false);
      if (content === "" && !generatedImageUrl) {
        setSelectedImageIndex(availableImages.length > 0 ? 0 : null);
      }
    }
    // eslint-disable-next-line
  }, [editingComment]);

  const handlePostClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || disabled) return;

    // If there's a selected image but no generated image, ask if they want to generate or post without
    if (selectedImage && imageUrls.length > 0 && !generatedImageUrl) {
      setShowModal("post-with-image");
      return;
    }

    // Otherwise, just post
    handlePostSubmit();
  };

  const handlePostSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isEditing && editingComment) {
        // Update existing comment
        const updatedComment = await commentService.updateComment(
          editingComment.id,
          {
            content: content.trim(),
            originalImage: selectedImage?.url || undefined,
            aiGeneratedImage: generatedImageUrl || undefined,
          },
          postId
        );

        // Clear form after successful update
        setContent("");
        setSelectedImageIndex(availableImages.length > 0 ? 0 : null);
        setGeneratedImageUrl(null);
        setIsEditing(false);

        // Notify parent component
        onCommentUpdated?.(updatedComment);
        showToast(ToastType.SUCCESS, "Comment updated successfully");
      } else {
        // Create new comment
        const newComment = await commentService.createComment({
          postId,
          content: content.trim(),
          originalImage: selectedImage?.url || undefined,
          aiGeneratedImage: generatedImageUrl || undefined,
        });

        // Clear form after successful submission
        setContent("");
        setSelectedImageIndex(availableImages.length > 0 ? 0 : null);
        setGeneratedImageUrl(null);

        // Notify parent component
        onCommentCreated?.(newComment);
        showToast(ToastType.SUCCESS, "Comment posted successfully");
      }
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || (isEditing ? "Failed to update comment" : "Failed to post comment"));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateClick = async () => {
    if (
      !content.trim() ||
      !selectedImage ||
      isSubmitting ||
      disabled ||
      isGenerating
    )
      return;

    setIsGenerating(true);
    setGenerationStatus("uploading");

    try {
      const result = await generateService.generateImage(
        content.trim(),
        selectedImage.url,
        (progress: number) => {
          // Map progress to status
          if (progress < 50) {
            setGenerationStatus("uploading");
          } else if (progress < 100) {
            setGenerationStatus("editing");
          } else {
            setGenerationStatus("done");
          }
        }
      );

      // Store generated image URL
      setGeneratedImageUrl(result.imageUrl);
      setGenerationStatus("done");
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to generate image");
      setGenerationStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromModal = async () => {
    if (!selectedImage) return;
    setShowModal(null);
    setIsGenerating(true);
    setGenerationStatus("uploading");

    try {
      const result = await generateService.generateImage(
        content.trim(),
        selectedImage.url,
        (progress: number) => {
          // Map progress to status
          if (progress < 50) {
            setGenerationStatus("uploading");
          } else if (progress < 100) {
            setGenerationStatus("editing");
          } else {
            setGenerationStatus("done");
          }
        }
      );

      // Store generated image URL
      setGeneratedImageUrl(result.imageUrl);
      setGenerationStatus("done");
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to generate image");
      setGenerationStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = !!(
    imageUrls.length > 0 &&
    content.trim() &&
    selectedImage &&
    !generatedImageUrl &&
    !isGenerating &&
    !isSubmitting &&
    !disabled
  );

  const canPost = !!(
    content.trim() &&
    !isSubmitting &&
    !disabled &&
    !isGenerating
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    const lineHeight = 24;
    const maxHeight = lineHeight * 5; // 5 lines max

    // Set height based on content, but cap at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Enable scroll if content exceeds max height
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [content]);

  return (
    <>
      <div className="space-y-3">
        {/* Image Selector - Show if there are images available */}
        {availableImages.length > 0 && !generatedImageUrl && (
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto">
              {availableImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex(
                      index === selectedImageIndex ? null : index
                    )
                  }
                  className={cn(
                    "relative shrink-0 w-20 h-20 lg:w-15 lg:h-15 rounded-xl overflow-hidden border-2 transition-all",
                    index === selectedImageIndex
                      ? "border-[#15B8A6]"
                      : "border-gray-300 hover:border-[#15B8A6]/50"
                  )}
                  disabled={disabled}
                >
                  <img
                    src={img.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === selectedImageIndex && (
                    <div className="absolute inset-0 bg-[#15B8A6]/10 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#15B8A6] flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedImage && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <PhotoIcon className="w-4 h-4" />
                <span>
                  Selected image {selectedImageIndex! + 1} of{" "}
                  {availableImages.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handlePostClick}>
          <div className="flex flex-col w-full border border-gray-300 rounded-2xl p-3 gap-4 items-end relative">
            <textarea
              ref={textareaRef}
              className="w-full border-none outline-none resize-none placeholder-gray-400 text-gray-800"
              style={{
                minHeight: "24px",
                lineHeight: "24px",
                maxHeight: "120px", // 5 lines * 24px
              }}
              placeholder={placeholder}
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setContent(e.target.value);
                }
              }}
              maxLength={MAX_COMMENT_LENGTH}
              rows={1}
              disabled={disabled || isSubmitting || isGenerating}
            />

            {/* Character Count - Left bottom, sát mép */}
            <span className="absolute bottom-3 left-3 text-xs text-gray-500">
              {content.length}/{MAX_COMMENT_LENGTH}
            </span>

            {/* Action Buttons - Right aligned */}
            <div className="flex justify-end gap-2">
              {/* Cancel Button - Show in edit mode */}
              {isEditing && onCancelEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onCancelEdit();
                    setContent("");
                    setGeneratedImageUrl(null);
                    setIsEditing(false);
                  }}
                  disabled={isSubmitting || isGenerating}
                  className="shrink-0"
                >
                  Cancel
                </Button>
              )}

              {/* Generate Button - Always show if images are available and not in error state */}
              {imageUrls.length > 0 && (
                <Button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={!canGenerate}
                  isLoading={isGenerating || (isSubmitting && canGenerate)}
                  leftIcon={SparklesIcon}
                  className="shrink-0"
                >
                  Generate
                </Button>
              )}

              {/* Post/Save Button - Always show */}
              <Button
                type="submit"
                disabled={!canPost}
                isLoading={isSubmitting}
                className="shrink-0 p-3"
                leftIcon={isEditing ? CheckIcon : PaperAirplaneIcon}
              ></Button>
            </div>
          </div>

          {/* Generating Status - Show when generating */}
          {isGenerating && generationStatus && (
            <div className="mt-4 bg-[#15B8A6]/10 border-2 border-[#15B8A6]/30 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="w-6 h-6 text-[#15B8A6] animate-spin" />
                <span className="text-sm font-medium text-[#15B8A6]">
                  {generationStatus === "uploading" && "Uploading image..."}
                  {generationStatus === "editing" && "Editing image..."}
                  {generationStatus === "done" && "Image generated successfully!"}
                </span>
              </div>
            </div>
          )}

          {/* Generated Image Preview - Below input, above buttons */}
          {generatedImageUrl && !isGenerating && (
            <div className="mt-2">
              <CommentImage
                aiGeneratedImage={generatedImageUrl}
                originalImage={selectedImage?.url || undefined}
                canDelete={true}
                onDelete={() => setGeneratedImageUrl(null)}
                className="max-w-sm max-h-auto"
              />
            </div>
          )}
        </form>
      </div>

      {/* Modal: Post with selected image - Generate or post without */}
      <Modal
        isOpen={showModal === "post-with-image"}
        onClose={() => {
          setShowModal(null);
        }}
        title="Generate Image?"
        message="You have selected an image. Would you like to generate an AI image first, or post the comment without generating?"
        confirmText="Generate Image"
        cancelText="Post Without Generating"
        onConfirm={handleGenerateFromModal}
        onCancel={() => {
          setShowModal(null);
          handlePostSubmit();
        }}
        variant="default"
      />
    </>
  );
};
