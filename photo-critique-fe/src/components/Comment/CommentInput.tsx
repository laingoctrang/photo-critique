import React, { useState } from "react";
import { SparklesIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Input, Modal } from "../common";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ImageInfo } from "../../services";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentInputProps {
  onSubmit: (content: string, selectedImageUrl?: string) => Promise<void>;
  onGenerate?: (content: string, selectedImageUrl: string) => Promise<void>;
  placeholder?: string;
  imageUrls?: ImageInfo[];
  isGenerating?: boolean;
  disabled?: boolean;
  generatedImageUrl?: string | null;
  onGeneratedImageChange?: (url: string | null) => void;
}

type ModalType = "post-with-generated" | "post-with-image" | null;

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onGenerate,
  placeholder = "Generate an edit, e.g.",
  imageUrls = [],
  isGenerating = false,
  disabled = false,
  generatedImageUrl: externalGeneratedImageUrl,
  onGeneratedImageChange,
}) => {
  const [content, setContent] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalGeneratedImageUrl, setInternalGeneratedImageUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Use external generated image URL if provided, otherwise use internal state
  const generatedImageUrl = externalGeneratedImageUrl !== undefined ? externalGeneratedImageUrl : internalGeneratedImageUrl;
  
  const setGeneratedImageUrl = (url: string | null) => {
    if (onGeneratedImageChange) {
      onGeneratedImageChange(url);
    } else {
      setInternalGeneratedImageUrl(url);
    }
  };

  // Filter only images (not videos)
  const availableImages = imageUrls.filter((img) =>
    img.contentType.startsWith("image/")
  );

  const selectedImage = selectedImageIndex !== null ? availableImages[selectedImageIndex] : null;

  const handlePostClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || disabled) return;

    // If there's a generated image, show confirmation to cancel it
    if (generatedImageUrl) {
      setShowModal("post-with-generated");
      setPendingAction(() => async () => {
        setGeneratedImageUrl(null);
        await handlePostSubmit();
      });
      return;
    }

    // If there's a selected image but no generated image, ask if they want to generate or post without
    if (selectedImage && onGenerate) {
      setShowModal("post-with-image");
      setPendingAction(() => async () => {
        await handlePostSubmit();
      });
      return;
    }

    // Otherwise, just post
    handlePostSubmit();
  };

  const handlePostSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), selectedImage?.url);
      // Clear form after successful submission
      setContent("");
      setSelectedImageIndex(null);
      setGeneratedImageUrl(null);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!content.trim() || !selectedImage || !onGenerate || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onGenerate(content.trim(), selectedImage.url);
      // Don't clear the form - keep content and selected image so user can see the generated image
      // The generated image URL will be updated by parent component via generatedImageUrl prop
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFromModal = async () => {
    if (!selectedImage || !onGenerate) return;
    setShowModal(null);
    setPendingAction(null);
    setIsSubmitting(true);
    try {
      await onGenerate(content.trim(), selectedImage.url);
      // Don't clear the form - keep content and selected image
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGenerate = !!(
    onGenerate &&
    content.trim() &&
    selectedImage &&
    !isGenerating &&
    !isSubmitting &&
    !disabled
  );

  const canPost = !!(content.trim() && !isSubmitting && !disabled);

  return (
    <>
      <div className="space-y-3">
        {/* Image Selector - Show if there are images available */}
        {availableImages.length > 0 && (
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

        {/* Generated Image Preview */}
        {generatedImageUrl && (
          <div className="relative rounded-lg overflow-hidden border-2 border-[#15B8A6] max-w-sm">
            <img
              src={generatedImageUrl}
              alt="Generated image"
              className="w-full h-auto object-cover"
            />
            <button
              type="button"
              onClick={() => setGeneratedImageUrl(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
              title="Remove generated image"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handlePostClick} className="flex gap-2">
          <div className="flex-1">
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

          {/* Generate Button - Always show if onGenerate is provided */}
          {onGenerate && (
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
        </form>
      </div>

      {/* Modal: Post with generated image - Cancel generated image */}
      <Modal
        isOpen={showModal === "post-with-generated"}
        onClose={() => {
          setShowModal(null);
          setPendingAction(null);
        }}
        title="Post Comment?"
        message="You have a generated image. Posting the comment will cancel the generated image. Do you want to continue?"
        confirmText="Post Comment"
        cancelText="Cancel"
        onConfirm={() => {
          if (pendingAction) {
            pendingAction();
          }
          setPendingAction(null);
        }}
        variant="default"
      />

      {/* Modal: Post with selected image - Generate or post without */}
      <Modal
        isOpen={showModal === "post-with-image"}
        onClose={() => {
          setShowModal(null);
          setPendingAction(null);
        }}
        title="Generate Image?"
        message="You have selected an image. Would you like to generate an AI image first, or post the comment without generating?"
        confirmText="Generate Image"
        cancelText="Post Without Generating"
        onConfirm={handleGenerateFromModal}
        onCancel={() => {
          setShowModal(null);
          if (pendingAction) {
            pendingAction();
          }
          setPendingAction(null);
        }}
        variant="default"
      />
    </>
  );
};
