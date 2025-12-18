import React, { useMemo, useState } from "react";
import { EyeIcon, ArrowsRightLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../common/Button";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentImageProps {
  aiGeneratedImage: string;
  originalImage?: string;
  className?: string;
}

export const CommentImage: React.FC<CommentImageProps> = ({
  aiGeneratedImage,
  originalImage,
  className,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsPreviewOpen(false);
      setIsCompareOpen(false);
    }
  };

  const isLandscape = useMemo(() => {
    const img = document.createElement("img");
    img.onload = () => {
      return img.width > img.height;
    };
    img.src = aiGeneratedImage;
    return img.width > img.height;
  }, [aiGeneratedImage]);

  return (
    <>
      <div
        className={cn("relative inline-block rounded-3xl overflow-hidden", className)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={aiGeneratedImage}
          alt="AI generated image"
          className={cn("block object-contain", isLandscape ? "max-w-[200px] max-h-auto" : "max-w-auto max-h-[150px]")}
        />
        
        {/* Hover overlay with actions */}
        {isHovering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsPreviewOpen(true);
              }}
              className="p-2 text-white hover:bg-white/80 hover:text-gray-700 rounded-3xl transition-colors"
              leftIcon={EyeIcon}
            >
            </Button>
            
            {originalImage && (
              <Button
                variant="ghost"
                size="medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCompareOpen(true);
                }}
                className="p-2 text-white hover:bg-white/80 hover:text-gray-700 rounded-3xl transition-colors"
                leftIcon={ArrowsRightLeftIcon}
              >
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center h-full">
              <img
                src={aiGeneratedImage}
                alt="AI generated image preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareOpen && originalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsCompareOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <button
            onClick={() => setIsCompareOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row items-center justify-center h-full gap-4">
              {/* Original Image */}
              <div className="flex-1 flex flex-col items-center w-full md:w-auto">
                <div className="bg-black/60 text-white px-4 py-2 rounded-lg mb-2">
                  <p className="text-sm font-medium">Original</p>
                </div>
                <img
                  src={originalImage}
                  alt="Original image"
                  className="max-w-full max-h-[40vh] md:max-h-[85vh] object-contain rounded-lg"
                />
              </div>

              {/* Divider */}
              <div className="w-full md:w-px h-px md:h-[85vh] bg-white/20"></div>

              {/* Generated Image */}
              <div className="flex-1 flex flex-col items-center w-full md:w-auto">
                <div className="bg-black/60 text-white px-4 py-2 rounded-lg mb-2">
                  <p className="text-sm font-medium">Generated</p>
                </div>
                <img
                  src={aiGeneratedImage}
                  alt="AI generated image"
                  className="max-w-full max-h-[40vh] md:max-h-[85vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

