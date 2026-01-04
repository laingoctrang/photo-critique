import React, { useState, useRef, useCallback } from "react";
import {
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../common/Button";
import { FileUploadItem, type FileUploadItemData } from "./FileUploadItem";
import { uploadService } from "../../services/uploadService";
import { moderationService } from "../../services/moderationService";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { showToast } from "../../utils";
import { ToastType } from "../Toast";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Thumbnail component for default variant
interface ThumbnailItemProps {
  item: FileUploadItemData;
  index: number;
  onDelete: (id: string) => void;
  onPreview?: (item: FileUploadItemData) => void;
  onViolationClick?: (item: FileUploadItemData) => void;
  formatFileSize: (bytes: number) => string;
  getFileName: (item: FileUploadItemData) => string;
  getFileSize: (item: FileUploadItemData) => number;
  isDragging: boolean;
  dragOverIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  item,
  index,
  onDelete,
  onPreview,
  onViolationClick,
  formatFileSize,
  getFileName,
  getFileSize,
  isDragging,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const fileName = getFileName(item);
  const fileSize = getFileSize(item);
  const isUploading = item.status === "uploading";
  const isViolating = item.moderationResult && !item.moderationResult.allowed;
  
  // Use imageInfo.url if available, otherwise create object URL for file
  const previewUrl = React.useMemo(() => {
    if (item.imageInfo?.url) return item.imageInfo.url;
    if (item.file) {
      return URL.createObjectURL(item.file);
    }
    return "";
  }, [item.imageInfo?.url, item.file]);

  // Cleanup object URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "transition-all",
        isDragging && "opacity-50",
        dragOverIndex === index && "border-t-4 border-[#15B8A6]"
      )}
    >
      <div 
        className={cn(
          "w-full -h-full aspect-square rounded-2xl overflow-hidden relative group cursor-pointer",
          isViolating 
            ? "border-2 border-red-500 bg-red-50" 
            : "border border-gray-200 bg-white"
        )}
        onClick={() => {
          if (!isUploading && onPreview && item.status === "completed" && !isViolating) {
            onPreview(item);
          } else if (!isUploading && isViolating && onViolationClick) {
            onViolationClick(item);
          }
        }}
      >
        {/* Image Preview */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <PhotoIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
            <ArrowPathIcon className="w-10 h-10 text-white animate-spin mb-2" />
            <span className="text-sm text-white font-medium">
              {item.progress}%
            </span>
          </div>
        )}

        {/* Violation Overlay */}
        {!isUploading && isViolating && (
          <div className="absolute inset-0 bg-red-500/30 flex flex-col items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-xs text-red-700 font-semibold text-center px-2">
              Policy Violation
            </span>
          </div>
        )}

        {/* Delete Button */}
        {!isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <XMarkIcon className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Filename */}
      <div className="mt-2 text-sm text-gray-700 font-medium truncate max-w-[128px]">
        {fileName}
      </div>

      {/* File Size */}
      <div className="text-xs text-gray-500">
        {formatFileSize(fileSize)}
      </div>
    </div>
  );
};

interface FileUploadProps {
  files: FileUploadItemData[];
  onFilesChange: (files: FileUploadItemData[]) => void;
  onPreview?: (item: FileUploadItemData) => void;
  onViolationClick?: (item: FileUploadItemData) => void;
  onViolationDetected?: (item: FileUploadItemData) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  variant?: "default" | "compact" | "icon" | "square"; // UI variant
  className?: string; // className for drop zone
  itemClassName?: string; // className for file items
  style?: React.CSSProperties; // style for drop zone
}


export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  onPreview,
  onViolationClick,
  onViolationDetected,
  maxFiles = 10,
  acceptedTypes = ".jpg,.jpeg,.png,image/jpeg,image/png",
  maxSize = 10 * 1024 * 1024, // 10MB default
  variant = "default",
  className,
  itemClassName,
  style,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<FileUploadItemData[]>(files);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Keep filesRef in sync with files prop
  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const newFiles: File[] = Array.from(selectedFiles);
      const remainingSlots = maxFiles - files.length;

      if (newFiles.length > remainingSlots) {
        showToast(ToastType.ERROR, `You can only upload ${remainingSlots} more file(s)`);
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const allowedExtensions = [".png", ".jpg", ".jpeg"];
      
      for (const file of newFiles) {
        // Check file extension - only PNG and JPEG allowed (exclude JFIF)
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
        if (!allowedExtensions.includes(fileExtension)) {
          showToast(ToastType.ERROR, `File ${file.name} is not supported. Only PNG and JPEG images are allowed.`);
          continue;
        }
        
        // Check MIME type - only PNG and JPEG allowed
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          showToast(ToastType.ERROR, `File ${file.name} is not supported. Only PNG and JPEG images are allowed.`);
          continue;
        }
        
        if (file.size > maxSize) {
          showToast(ToastType.ERROR, `File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
          continue;
        }
        validFiles.push(file);
      }

      // Create upload items
      const newItems: FileUploadItemData[] = validFiles.map((file, index) => ({
        id: `file-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        progress: 0,
        status: "pending" as const,
      }));

      const updatedFiles = [...files, ...newItems];
      filesRef.current = updatedFiles;
      onFilesChange(updatedFiles);

      // Start uploading each file
      newItems.forEach(async (item) => {
        try {
          // Update status to uploading
          let currentFiles = filesRef.current;
          let updatedFiles = currentFiles.map((f) =>
            f.id === item.id ? { ...f, status: "uploading" as const } : f
          );
          filesRef.current = updatedFiles;
          onFilesChange(updatedFiles);

          // Upload file
          const imageInfo = await uploadService.uploadSingleFile(
            item.file!,
            (progress) => {
              currentFiles = filesRef.current;
              updatedFiles = currentFiles.map((f) =>
                f.id === item.id ? { ...f, progress } : f
              );
              filesRef.current = updatedFiles;
              onFilesChange(updatedFiles);
            }
          );

          // Update with completed status and imageInfo
          // Get the latest state to ensure we're working with current data
          currentFiles = filesRef.current;
          updatedFiles = currentFiles.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "completed" as const,
                  progress: 100,
                  imageInfo: imageInfo, // Ensure imageInfo is set
                }
              : f
          );
          filesRef.current = updatedFiles;
          onFilesChange(updatedFiles);

          // Check moderation for images
          if (imageInfo.contentType?.startsWith("image/") && imageInfo.url) {
            try {
              const moderationResponse = await moderationService.moderateBatch([
                imageInfo.url,
              ]);
              const moderationResult = moderationResponse.results[0];
              console.log(moderationResult);

              // Update file with moderation result
              currentFiles = filesRef.current;
              updatedFiles = currentFiles.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      moderationResult: moderationResult,
                    }
                  : f
              );
              filesRef.current = updatedFiles;
              onFilesChange(updatedFiles);

              // Auto-show violation modal if not allowed
              if (moderationResult && !moderationResult.allowed) {
                const violatedItem = updatedFiles.find((f) => f.id === item.id);
                if (violatedItem && onViolationDetected) {
                  onViolationDetected(violatedItem);
                }
              }
            } catch (error) {
              // If moderation fails, log but don't block upload
              console.error("Moderation check failed:", error);
            }
          }
          
        } catch (error: unknown) {
          // Update with error status
          const errorMessage = error instanceof Error ? error.message : "Upload failed";
          const currentFiles = filesRef.current;
          const updatedFiles = currentFiles.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "error" as const,
                  error: errorMessage,
                }
              : f
          );
          filesRef.current = updatedFiles;
          onFilesChange(updatedFiles);
        }
      });
    },
    [files, maxFiles, maxSize, onFilesChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    },
    [handleFileSelect]
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    const item = files.find((f) => f.id === id);
    if (item?.imageInfo?.url) {
      // Extract publicId from URL if needed
      // For now, we'll just remove from list
    }
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleTitleChange = (id: string, title: string) => {
    onFilesChange(
      files.map((f) => (f.id === id ? { ...f, title } : f))
    );
  };

  const handleItemDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleItemDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFiles = [...files];
    const [removed] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, removed);

    onFilesChange(newFiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Render drop zone based on variant
  const renderDropZone = () => {
    if (files.length >= maxFiles) return null;

    const baseClasses = cn(
      "border-2 border-dashed rounded-lg transition-all cursor-pointer",
            isDragging
              ? "border-[#15B8A6] bg-[#F0FDFA]"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
    );

    switch (variant) {
      case "icon":
        return (
          <div
            className={cn(baseClasses, "w-10 h-10 flex items-center justify-center", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            title="Upload file"
            style={style}
          >
            <PhotoIcon className="w-5 h-5 text-gray-400" />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        );

      case "square":
        return (
          <div
            className={cn(baseClasses, "w-16 h-16 flex items-center justify-center", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            title="Upload file"
            style={style}
          >
            <PhotoIcon className="w-6 h-6 text-gray-400" />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        );

      case "compact":
        return (
          <div
            className={cn(baseClasses, "p-3 flex items-center justify-center", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            title="Upload file"
            style={style}
          >
            <CloudArrowUpIcon className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Upload</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        );

      case "default":
      default:
        return (
          <div
            className={cn(baseClasses, "p-8 text-center", className)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={style}
        >
          <CloudArrowUpIcon className="w-12 h-12 text-[#15B8A6] mx-auto mb-4 bg-[#15B8A6]/10 rounded-full p-2" />
          <p className="text-lg font-bold text-gray-600 text-center mb-2">
            Drag and drop your file here
          </p>
          <p className="text-sm text-gray-500 font-light mb-4">
            Supported Formats: JPEG, PNG, JPG
            <br />
            Maximum file size: {maxSize / 1024 / 1024}MB
          </p>
          
          <Button
            type="button"
            variant="primary"
            onClick={handleBrowseClick}
            rightIcon={ArrowUpTrayIcon}
            className="text-sm"
          >
            Select File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
          />

          
          
        </div>
        );
    }
  };

  // Render default variant with new layout when files are uploaded
  if (variant === "default" && files.length > 0) {
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const getFileName = (item: FileUploadItemData): string => {
      if (item.imageInfo?.name) return item.imageInfo.name;
      if (item.file?.name) return item.file.name;
      return item.title || "Untitled";
    };

    const getFileSize = (item: FileUploadItemData): number => {
      return item.imageInfo?.size || item.file?.size || 0;
    };

    return (
      <div className="bg-white rounded-3xl space-y-4">
        {/* Uploaded Photos Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-gray-700">Uploaded Photos</h3>
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#15B8A6] text-white text-xs font-medium">
              {files.length}
            </div>
          </div>  
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((item, index) => (
            <ThumbnailItem
              key={item.id}
              item={item}
              index={index}
              onDelete={handleDelete}
              onPreview={onPreview}
              onViolationClick={onViolationClick}
              formatFileSize={formatFileSize}
              getFileName={getFileName}
              getFileSize={getFileSize}
              isDragging={draggedIndex === index}
              dragOverIndex={dragOverIndex}
              onDragStart={handleItemDragStart}
              onDragOver={handleItemDragOver}
              onDragLeave={handleItemDragLeave}
              onDrop={handleItemDrop}
              onDragEnd={handleItemDragEnd}
            />
          ))}

          {/* Add Photos Placeholder */}
          {files.length < maxFiles && (
            <div
              className={cn(
                "rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-12",
                isDragging
                  ? "border-[#15B8A6] bg-[#F0FDFA]"
                  : "border-[#15B8A6] bg-white hover:border-[#13A595] hover:bg-[#F0FDFA]",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              title="Add Photos"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="large" 
                  leftIcon={(className) => <PlusIcon className={`w-6 h-6 stroke-[2] ${className}`} />}
                  className="p-3 text-[#15B8A6] bg-[#15B8A6]/20 hover:bg-[#15B8A6]/20"
                >
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {renderDropZone()}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleItemDragStart(index)}
              onDragOver={(e) => handleItemDragOver(e, index)}
              onDragLeave={handleItemDragLeave}
              onDrop={(e) => handleItemDrop(e, index)}
              onDragEnd={handleItemDragEnd}
              className={cn(
                "transition-all",
                draggedIndex === index && "opacity-50",
                dragOverIndex === index && "border-t-4 border-[#15B8A6]"
              )}
            >
              <FileUploadItem
                item={item}
                onDelete={handleDelete}
                onTitleChange={handleTitleChange}
                onPreview={onPreview}
                onViolationClick={onViolationClick}
                isDragging={draggedIndex === index}
                variant={variant}
                className={itemClassName}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

