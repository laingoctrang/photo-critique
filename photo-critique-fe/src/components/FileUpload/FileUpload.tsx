import React, { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../Button";
import { FileUploadItem, type FileUploadItemData } from "./FileUploadItem";
import { uploadService } from "../../services/uploadService";
import { moderationService } from "../../services/moderationService";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
}


export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  onPreview,
  onViolationClick,
  maxFiles = 10,
  acceptedTypes = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
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
        alert(`You can only upload ${remainingSlots} more file(s)`);
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
          if (imageInfo.contentType.startsWith("image/") && imageInfo.url) {
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

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {files.length < maxFiles && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all",
            isDragging
              ? "border-[#15B8A6] bg-[#F0FDFA]"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Choose a file or drag & drop it here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            JPEG, PNG formats, up to {maxSize / 1024 / 1024} MB.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowseClick}
            leftIcon={PhotoIcon}
          >
            Browse File
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
      )}

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
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

