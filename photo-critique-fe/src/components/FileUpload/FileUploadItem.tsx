import React, { useState } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ImageInfo } from "../../services/types";
import type { ModerationResult } from "../../services/moderationService";
import { Button } from "../common";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FileUploadItemData {
  id: string;
  file?: File;
  imageInfo?: ImageInfo;
  title?: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  moderationResult?: ModerationResult;
}

interface FileUploadItemProps {
  item: FileUploadItemData;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onPreview?: (item: FileUploadItemData) => void;
  onViolationClick?: (item: FileUploadItemData) => void;
  isDragging?: boolean;
  variant?: "default" | "compact" | "icon" | "square"; // UI variant
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) {
    return PhotoIcon;
  }
  if (contentType.startsWith("video/")) {
    return VideoCameraIcon;
  }
  return DocumentIcon;
};

export const FileUploadItem: React.FC<FileUploadItemProps> = ({
  item,
  onDelete,
  onTitleChange,
  onPreview,
  onViolationClick,
  isDragging = false,
  variant = "default",
  className,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(item.title || "");
  const [isHovering, setIsHovering] = useState(false);

  const fileSize = item.imageInfo?.size || item.file?.size || 0;
  const contentType = item.imageInfo?.contentType || item.file?.type || "";
  
  // Use imageInfo.url if available (after upload), otherwise use file object URL
  // Store object URL in ref to cleanup properly
  const objectUrlRef = React.useRef<string | null>(null);
  
  // Calculate preview URL - prioritize uploaded URL over local file preview
  const previewUrl = React.useMemo(() => {
    // Priority 1: use uploaded URL if available (after successful upload)
    if (item.imageInfo?.url) {
      // Cleanup object URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      return item.imageInfo.url;
    }
    
    // Priority 2: Create object URL for local file preview (before upload)
    if (item.file) {
      // Cleanup previous object URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(item.file);
      objectUrlRef.current = url;
      return url;
    }
    
    return "";
  }, [item.imageInfo, item.file, item.status]);
  
  // Cleanup object URL on unmount or when imageInfo is available
  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [item.imageInfo?.url]);
  
  const Icon = getFileIcon(contentType);

  const handleTitleSubmit = () => {
    onTitleChange(item.id, titleValue);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTitleValue(item.title || "");
      setIsEditingTitle(false);
    }
  };

  const isViolating = item.moderationResult && !item.moderationResult.allowed;
  const isCompact = variant === "icon" || variant === "square" || variant === "compact";
  const sizeClass = variant === "icon" ? "w-10 h-10" : variant === "square" ? "w-16 h-16" : variant === "compact" ? "w-20 h-20" : "w-16 h-16";

  // Compact variant - only show image/icon with hover actions
  if (isCompact) {
    return (
      <div
        className={cn(
          "relative rounded-lg border-2 transition-all overflow-hidden",
          sizeClass,
          isDragging
            ? "border-[#15B8A6] bg-[#F0FDFA] opacity-50"
            : isViolating
            ? "border-red-500 bg-red-50"
            : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer",
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {contentType.startsWith("image/") && previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={item.title || "Preview"}
              className="w-full h-full object-cover"
            />
            {item.status === "uploading" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
            {isViolating && (
              <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              </div>
            )}
            {/* Hover overlay with actions */}
            {item.status !== "uploading" && isHovering && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
                {onPreview && item.status === "completed" && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(item);
                    }}
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-3xl transition-colors"
                    leftIcon={PhotoIcon}
                  >
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-3xl transition-colors"
                  leftIcon={TrashIcon}
                >
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
            <Icon className={cn(
              variant === "icon" ? "w-5 h-5" : variant === "square" ? "w-8 h-8" : "w-10 h-10",
              "text-gray-400"
            )} />
            {item.status === "uploading" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <ArrowPathIcon className={cn(
                  variant === "icon" ? "w-4 h-4" : "w-5 h-5",
                  "text-white animate-spin"
                )} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant - show full information
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
        isDragging
          ? "border-[#15B8A6] bg-[#F0FDFA] opacity-50"
          : isViolating
          ? "border-red-500 bg-red-50"
          : "border-gray-200 bg-white hover:border-gray-300 cursor-move",
        className
      )}
    >
      {/* File Icon/Preview */}
      <div className="relative shrink-0">
        {contentType.startsWith("image/") && previewUrl ? (
          <button
            type="button"
            onClick={() => onPreview?.(item)}
            className={cn(
              "w-16 h-16 rounded-lg overflow-hidden border transition-colors cursor-pointer relative",
              isViolating
                ? "border-red-500 hover:border-red-600"
                : "border-gray-200 hover:border-[#15B8A6]"
            )}
          >
            <img
              src={previewUrl}
              alt={item.title || "Preview"}
              className="w-full h-full object-cover"
            />
            {item.status === "uploading" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
            {isViolating && (
              <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            )}
          </button>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        {/* Title Input */}
        {isEditingTitle && item.status !== "uploading" ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="w-full px-2 py-1 text-sm font-medium border border-[#15B8A6] rounded focus:outline-none focus:ring-1 focus:ring-[#15B8A6]"
            autoFocus
            placeholder="Enter image title..."
          />
        ) : (
          <div
            className={cn(
              "text-sm font-medium transition-colors",
              item.status === "uploading"
                ? "text-white cursor-default"
                : "text-gray-900 cursor-text hover:text-[#15B8A6]"
            )}
            onClick={() => item.status !== "uploading" && setIsEditingTitle(true)}
            title={item.status === "uploading" ? undefined : "Click to edit title"}
          >
            {item.title || "Untitled"}
          </div>
        )}

        {/* File Size */}
        <div className="text-xs text-gray-500 mt-1">
          {formatFileSize(fileSize)}
        </div>

        {/* Progress Bar */}
        {item.status === "uploading" && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#15B8A6] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {item.progress}% uploaded
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 mt-1">
          {item.status === "uploading" && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />
              <span>Uploading...</span>
            </div>
          )}
          {item.status === "completed" && !isViolating && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircleIconSolid className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}
          {item.status === "completed" && isViolating && (
            <button
              type="button"
              onClick={() => onViolationClick?.(item)}
              className="flex items-center gap-1 text-xs text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors cursor-pointer"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Policy Violation</span>
            </button>
          )}
          {item.status === "error" && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <XMarkIcon className="w-4 h-4" />
              <span>{item.error || "Upload failed"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {item.status === "completed" && onPreview && (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="p-1.5 text-gray-400 hover:text-[#15B8A6] transition-colors"
            title="Preview"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

