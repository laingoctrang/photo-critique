import React from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { FileUploadItemData } from "../FileUpload/FileUploadItem";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FileUploadItemData[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onIndexChange,
}) => {
  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const previewUrl =
    currentItem.imageInfo?.url ||
    (currentItem.file ? URL.createObjectURL(currentItem.file) : "");

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <XMarkIcon className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Buttons */}
      {items.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < items.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          )}
        </>
      )}

      {/* Content */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image/Video Preview */}
        <div className="flex items-center justify-center h-full">
          {currentItem.imageInfo?.contentType?.startsWith("image/") ||
          currentItem.file?.type.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt={currentItem.title || "Preview"}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          ) : currentItem.imageInfo?.contentType?.startsWith("video/") ||
            currentItem.file?.type.startsWith("video/") ? (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-[90vh] rounded-lg"
            />
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Preview not available for this file type</p>
            </div>
          )}
        </div>

        {/* Title and Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg">
          <p className="text-sm font-medium">
            {currentItem.title || "Untitled"} ({currentIndex + 1} / {items.length})
          </p>
        </div>
      </div>
    </div>
  );
};

