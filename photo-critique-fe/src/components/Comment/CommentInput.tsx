import React, { useState } from "react";
import { SparklesIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "../";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ImageInfo } from "../../services/types";

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
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onGenerate,
  placeholder = "Generate an edit, e.g.",
  imageUrls = [],
  isGenerating = false,
  disabled = false,
}) => {
  const [content, setContent] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only images (not videos)
  const availableImages = imageUrls.filter((img) =>
    img.contentType.startsWith("image/")
  );

  const selectedImage = availableImages[selectedImageIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim() || !selectedImage || !onGenerate || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onGenerate(content.trim(), selectedImage.url);
      setContent("");
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

  return (
    <div className="space-y-3">
      {/* Image Selector - Only show if multiple images */}
      {availableImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
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
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
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

        {/* Generate Button - Only show if onGenerate is provided */}
        {onGenerate && (
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            isLoading={isGenerating || (isSubmitting && canGenerate)}
            leftIcon={SparklesIcon}
            className="shrink-0"
          >
            Generate
          </Button>
        )}

        {/* Submit Button - Only show if no generate button or as alternative */}
        {(!onGenerate || availableImages.length === 0) && (
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting || disabled}
            isLoading={isSubmitting}
            className="shrink-0"
          >
            Post
          </Button>
        )}
      </form>

      {/* Selected Image Indicator */}
      {selectedImage && availableImages.length > 1 && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <PhotoIcon className="w-4 h-4" />
          <span>
            Using image {selectedImageIndex + 1} of {availableImages.length}
          </span>
        </div>
      )}
    </div>
  );
};
