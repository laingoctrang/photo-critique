import React, { useEffect, useRef, useState } from "react";
import { SparklesIcon, PhotoIcon, ArrowPathIcon, PaperAirplaneIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button, Modal } from "../../components/common";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ImageInfo, commentService, type CommentResponse } from "../../services";
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
}

type ModalType = "post-with-image" | null;

export const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  placeholder = "Enter your comment",
  imageUrls = [],
  disabled = false,
  onCommentCreated,
}) => {
  const [content, setContent] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [showModal, setShowModal] = useState<ModalType>(null);

  // Filter only images (not videos)
  const availableImages = imageUrls.filter((img) =>
    img.contentType?.startsWith("image/")
  );

  const selectedImage = selectedImageIndex !== null ? availableImages[selectedImageIndex] : null;

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
      const newComment = await commentService.createComment({
        postId,
        content: content.trim(),
        originalImage: selectedImage?.url || undefined,
        aiGeneratedImage: generatedImageUrl || undefined,
      });

      // Clear form after successful submission
      setContent("");
      setSelectedImageIndex(0);
      setGeneratedImageUrl(null);

      // Notify parent component
      onCommentCreated?.(newComment);
      showToast(ToastType.SUCCESS, "Comment posted successfully");
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to post comment");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!content.trim() || !selectedImage || isSubmitting || disabled || isGenerating) return;

    setIsGenerating(true);
    setGeneratingProgress(0);

    try {
      const result = await commentService.generateImage(
        content.trim(),
        selectedImage.url,
        (progress) => {
          setGeneratingProgress(progress);
        }
      );

      // Store generated image URL
      setGeneratedImageUrl(result.imageUrl);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(0);
    }
  };

  const handleGenerateFromModal = async () => {
    if (!selectedImage) return;
    setShowModal(null);
    setIsGenerating(true);
    setGeneratingProgress(0);

    try {
      const result = await commentService.generateImage(
        content.trim(),
        selectedImage.url,
        (progress) => {
          setGeneratingProgress(progress);
        }
      );

      // Store generated image URL
      setGeneratedImageUrl(result.imageUrl);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(0);
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

  const canPost = !!(content.trim() && !isSubmitting && !disabled && !isGenerating);

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
                  onClick={() => setSelectedImageIndex(index === selectedImageIndex ? null : index)}
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
                  Selected image {selectedImageIndex! + 1} of {availableImages.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handlePostClick}>
          <div className="flex flex-col w-full border border-gray-300 rounded-2xl p-3 gap-4 items-end">
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
              onChange={(e) => setContent(e.target.value)}
              rows={1}
              disabled={disabled || isSubmitting || isGenerating}
            />

            {/* Action Buttons - Right aligned */}
            <div className="flex justify-end gap-2">
              {/* Generate Button - Always show if images are available */}
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

              {/* Post Button - Always show */}
              <Button
                type="submit"
                disabled={!canPost}
                isLoading={isSubmitting}
                className="shrink-0 p-3"
                leftIcon={PaperAirplaneIcon}
              >
              </Button>
            </div>
          </div>

          {/* Generating Progress - Below input, above buttons */}
          {isGenerating && (
            <div className="bg-[#15B8A6]/10 border-2 border-[#15B8A6]/30 rounded-2xl p-4 mt-4">
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="w-6 h-6 text-[#15B8A6] animate-spin" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#15B8A6]">
                      Generating image...
                    </span>
                    <span className="text-sm font-bold text-[#15B8A6]">
                      {Math.round(generatingProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#15B8A6]/20 rounded-full h-2">
                    <div
                      className="bg-[#15B8A6]/80 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generatingProgress}%` }}
                    />
                  </div>
                </div>
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

