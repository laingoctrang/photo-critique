import React, { useState, useRef, useCallback } from "react";
import {
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  PhotoIcon,
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

interface FileUploadProps {
  files: FileUploadItemData[];
  onFilesChange: (files: FileUploadItemData[]) => void;
  onPreview?: (item: FileUploadItemData) => void;
  onViolationClick?: (item: FileUploadItemData) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  variant?: "default" | "compact" | "icon" | "square"; // UI variant
  className?: string; // className for drop zone
  itemClassName?: string; // className for file items
}


export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  onPreview,
  onViolationClick,
  maxFiles = 10,
  acceptedTypes = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  variant = "default",
  className,
  itemClassName,
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
      for (const file of newFiles) {
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
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
        >
          <CloudArrowUpIcon className="w-12 h-12 text-[#15B8A6] mx-auto mb-4 bg-[#15B8A6]/10 rounded-full p-2" />
          <p className="text-lg font-bold text-gray-600 text-center mb-2">
            Drag and drop your file here
          </p>
          <p className="text-sm text-gray-500 font-light mb-4">
            Supported Formats: JPEG, PNG
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

