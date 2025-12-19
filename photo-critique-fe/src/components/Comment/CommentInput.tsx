import React, { useState } from "react";
import { SparklesIcon, PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button, Input, Modal } from "../common";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ImageInfo, commentService, type CommentResponse } from "../../services";
import { CommentImage } from "./CommentImage";
import { showToast } from "../../utils";
import { ToastType } from "../Toast";

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
  placeholder = "Generate an edit, e.g.",
  imageUrls = [],
  disabled = false,
  onCommentCreated,
}) => {
  const [content, setContent] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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
      setSelectedImageIndex(null);
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

  return (
    <>
      <div className="space-y-3">
        {/* Image Selector - Show if there are images available */}
        {availableImages.length > 0 && !generatedImageUrl && (
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* Option to not select any image */}
              <button
                type="button"
                onClick={() => setSelectedImageIndex(null)}
                className={cn(
                  "relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-50",
                  selectedImageIndex === null
                    ? "border-[#15B8A6] ring-2 ring-[#15B8A6]/20"
                    : "border-gray-200 hover:border-gray-300"
                )}
                disabled={disabled}
              >
                <span className="text-xs text-gray-500 font-medium">None</span>
                {selectedImageIndex === null && (
                  <div className="absolute inset-0 bg-[#15B8A6]/10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#15B8A6] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </button>
              {availableImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                    index === selectedImageIndex
                      ? "border-[#15B8A6] ring-2 ring-[#15B8A6]/20"
                      : "border-gray-200 hover:border-gray-300"
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
                        <span className="text-white text-xs font-bold">✓</span>
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
        <form onSubmit={handlePostClick} className="space-y-3">
          <div className="w-full">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              variant="outline"
              size="medium"
              fullWidth
              disabled={disabled || isSubmitting || isGenerating}
              className="rounded-2xl"
            />
          </div>

          {/* Generating Progress - Below input, above buttons */}
          {isGenerating && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="w-6 h-6 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Generating image...
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(generatingProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generatingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generated Image Preview - Below input, above buttons */}
          {generatedImageUrl && !isGenerating && (
            <CommentImage
              aiGeneratedImage={generatedImageUrl}
              originalImage={selectedImage?.url || undefined}
              canDelete={true}
              onDelete={() => setGeneratedImageUrl(null)}
              className="max-w-sm max-h-auto"
            />
            // <div className="relative rounded-lg overflow-hidden border-2 border-[#15B8A6] max-w-sm">
            //   <img
            //     src={generatedImageUrl}
            //     alt="Generated image"
            //     className="w-full h-auto object-cover"
            //   />
            //   <button
            //     type="button"
            //     onClick={() => setGeneratedImageUrl(null)}
            //     className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
            //     title="Remove generated image"
            //   >
            //     <XMarkIcon className="w-4 h-4" />
            //   </button>
            // </div>
          )}

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
              className="shrink-0"
            >
              Post
            </Button>
          </div>
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
