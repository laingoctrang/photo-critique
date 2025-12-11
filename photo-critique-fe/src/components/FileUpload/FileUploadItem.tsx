import React, { useState } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ImageInfo } from "../../services/types";

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
}

interface FileUploadItemProps {
  item: FileUploadItemData;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onPreview?: (item: FileUploadItemData) => void;
  isDragging?: boolean;
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
  isDragging = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(item.title || "");

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

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
        isDragging
          ? "border-[#15B8A6] bg-[#F0FDFA] opacity-50"
          : "border-gray-200 bg-white hover:border-gray-300 cursor-move"
      )}
    >
      {/* File Icon/Preview */}
      <div className="relative shrink-0">
        {contentType.startsWith("image/") && previewUrl ? (
          <button
            type="button"
            onClick={() => onPreview?.(item)}
            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-[#15B8A6] transition-colors cursor-pointer"
          >
            <img
              src={previewUrl}
              alt={item.title || "Preview"}
              className="w-full h-full object-cover"
            />
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
        {isEditingTitle ? (
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
            className="text-sm font-medium text-gray-900 cursor-text hover:text-[#15B8A6] transition-colors"
            onClick={() => setIsEditingTitle(true)}
            title="Click to edit title"
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
          {item.status === "completed" && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircleIconSolid className="w-4 h-4" />
              <span>Completed</span>
            </div>
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

