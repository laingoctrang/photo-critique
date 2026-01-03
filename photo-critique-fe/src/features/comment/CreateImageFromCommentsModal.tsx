import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon, SparklesIcon, CheckIcon, ArrowPathIcon, ArrowsRightLeftIcon, ArrowDownTrayIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button, Loading, ToastType } from "../../components";
import { showToast } from "../../utils";
import { commentService, generateService, imageGenerationHistoryService, type CommentResponse, type ImageInfo } from "../../services";
import { CommentItem } from "./CommentItem";
import { ImageCarousel } from "../../components/common/ImageCarousel";

interface CreateImageFromCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  imageUrls: ImageInfo[];
}

export const CreateImageFromCommentsModal: React.FC<CreateImageFromCommentsModalProps> = ({
  isOpen,
  onClose,
  postId,
  imageUrls,
}) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const pageRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCommentIds, setSelectedCommentIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imgRatio, setImgRatio] = useState<number | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const cancelTokenRef = useRef<{ cancelled: boolean } | null>(null);

  // Filter only images
  const availableImages = imageUrls.filter((img) => img.contentType?.startsWith("image/"));

  const selectedImage = availableImages[selectedImageIndex];
  const selectedImageUrl = selectedImage?.url;
  const displayImage = generatedImageUrl || selectedImageUrl;

  // Load image ratio
  const loadSizes = useCallback(async (imageUrl: string) => {
    try {
      const promises = new Promise<{ w: number; h: number }>((resolve) => {
        const el = document.createElement("img");
        el.onload = () =>
          resolve({ w: el.naturalWidth || 1, h: el.naturalHeight || 1 });
        el.onerror = () => resolve({ w: 800, h: 800 }); // fallback square
        el.src = imageUrl;
      });

      const sizes = await promises;
      if (sizes.w > sizes.h) {
        setImgRatio(sizes.w / sizes.h);
        return;
      }

      const screenW = window.innerWidth;
      let fallbackRatio = 3 / 4; // default mobile (taller)

      if (screenW < 640) {
        fallbackRatio = 2 / 3; // mobile
      } else if (screenW < 1024) {
        fallbackRatio = 4 / 5; // tablet
      } else {
        fallbackRatio = 3 / 2; // laptop/desktop
      }

      setImgRatio(Number(fallbackRatio.toFixed(4)));
    } catch {
      setImgRatio(Number((3 / 2).toFixed(4)));
    }
  }, []);

  // Load image ratio when image changes
  useEffect(() => {
    if (displayImage) {
      loadSizes(displayImage);
    }
  }, [displayImage, loadSizes]);

  const loadComments = useCallback(async (reset = false, targetPage?: number) => {
    if (!selectedImageUrl) return;

    setIsLoadingComments(true);
    try {
      const currentPage = reset ? 0 : (targetPage !== undefined ? targetPage : pageRef.current);
      const response = await commentService.getComments(
        postId,
        currentPage,
        10,
        'newest',
        selectedImageUrl
      );

      if (reset) {
        setComments(response.content);
        pageRef.current = 0;
      } else {
        setComments((prev) => [...prev, ...response.content]);
        if (targetPage !== undefined) {
          pageRef.current = targetPage;
        }
      }

      setHasMore(response.number < (response.totalPages - 1));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load comments";
      showToast(ToastType.ERROR, errorMessage);
    } finally {
      setIsLoadingComments(false);
    }
  }, [selectedImageUrl, postId]);

  // Load comments when image changes
  useEffect(() => {
    if (isOpen && selectedImageUrl) {
      loadComments(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedImageUrl]);


  const handleImageSelect = (index: number) => {
    if (isGenerating) return;
    setSelectedImageIndex(index);
    setSelectedCommentIds(new Set());
    pageRef.current = 0;
    setComments([]);
    setGeneratedImageUrl(null);
  };

  const handleCommentSelect = (commentId: string) => {
    if (isGenerating) return;
    setSelectedCommentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (isGenerating) return;
    if (selectedCommentIds.size === comments.length) {
      setSelectedCommentIds(new Set());
    } else {
      setSelectedCommentIds(new Set(comments.map((c) => c.id)));
    }
  };

  const handleReset = () => {
    setSelectedCommentIds(new Set());
    setGeneratedImageUrl(null);
  };

  const handleRegenerate = () => {
    setGeneratedImageUrl(null);
  };

  const handleCancelGenerate = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancelled = true;
      setIsGenerating(false);
      showToast(ToastType.INFO, "Generation cancelled");
    }
  };

  const handleDownloadImage = async () => {
    if (!generatedImageUrl) return;

    let downloadUrl = generatedImageUrl;

    if (generatedImageUrl.includes("res.cloudinary.com")) {
      downloadUrl = generatedImageUrl.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
    }

    window.open(downloadUrl, "_blank");

    // Fallback: fetch → blob
    try {
      const response = await fetch(generatedImageUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleCreatePost = () => {
    if (!generatedImageUrl) return;
    // Navigate to create page with the generated image
    navigate(`/create?imageUrl=${encodeURIComponent(generatedImageUrl)}&size=${selectedImage?.size || 0}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsCompareOpen(false);
    }
  };

  const handleGenerateEdits = async () => {
    if (selectedCommentIds.size === 0 || !selectedImageUrl) {
      showToast(ToastType.ERROR, "Please select at least one comment");
      return;
    }

    // Create cancel token
    cancelTokenRef.current = { cancelled: false };
    setIsGenerating(true);

    try {
      // Combine selected comments into a prompt
      const selectedComments = comments.filter((c) => selectedCommentIds.has(c.id));
      const combinedPrompt = selectedComments.map((c) => c.content).join(". ");

      const result = await generateService.generateImage(
        combinedPrompt,
        selectedImageUrl
      );

      // Only update if not cancelled
      if (!cancelTokenRef.current?.cancelled) {
        setGeneratedImageUrl(result.imageUrl);
        showToast(ToastType.SUCCESS, "Image generated successfully!");
        imageGenerationHistoryService.create({
          inputImageUrl: selectedImageUrl,
          outImageUrl: result.imageUrl,
          prompt: combinedPrompt,
        });
      }
    } catch (error: unknown) {
      if (!cancelTokenRef.current?.cancelled) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
        showToast(ToastType.ERROR, errorMessage);
      }
    } finally {
      setIsGenerating(false);
      cancelTokenRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-3xl overflow-hidden flex flex-col m-4">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Image from Comments</h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <XMarkIcon className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Main Content - 3 columns */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          <div className="lg:w-3/5 flex flex-col lg:flex-row border-b lg:border-b-0 border-gray-200">
            {/* Left Panel - Session Images */}
            <div className="w-full h-42 lg:h-full lg:w-1/4 border-r border-gray-200 flex flex:row lg:flex-col bg-white lg:relative">
              <div className="p-4 border-b border-gray-200 hidden lg:block">
                <h3 className="text-sm font-semibold text-gray-900 uppercase">
                  SESSION IMAGES
                </h3>
              </div>
              <div className="flex-1 flex flex-col lg:flex-row flex-nowrap lg:flex-wrap overflow-x-auto lg:overflow-x-hidden overflow-y-hidden lg:overflow-y-auto p-4 space-x-3 lg:space-x-0 lg:space-y-3 border-b border-gray-200">
                {availableImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`
                    relative rounded-lg overflow-hidden border-2 transition-all shrink-0 lg:shink w-34 h-34 lg:w-full
                    ${isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    ${index === selectedImageIndex
                        ? "border-[#15B8A6] ring-2 ring-[#15B8A6]/50"
                        : "border-gray-300 hover:border-gray-400"
                      }
                  `}
                  >
                    <img
                      src={img.url}
                      alt={`Version ${index + 1}`}
                      className="w-full h-full object-cover aspect-square"
                    />
                    {index === selectedImageIndex && (
                      <div className="absolute top-2 left-2 p-1 rounded-full bg-[#15B8A6]">
                        <CheckIcon className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded hidden lg:block">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Panel - Image Preview */}
            <div className="flex-1 flex flex-col bg-gray-50 relative">
              <div className="flex-1 flex items-center justify-center p-6 relative min-h-0 overflow-hidden">
                {displayImage && imgRatio && (
                  <>
                    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ aspectRatio: imgRatio }}
                      >
                        <ImageCarousel
                          images={[displayImage]}
                          fitMode="contain"
                          className="w-full h-full"
                          showPreview={true}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons or Metadata */}
              {generatedImageUrl ? (
                <div className="px-6 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={handleRegenerate}
                      className="text-gray-600 hover:text-gray-900 text-xs"
                      leftIcon={ArrowPathIcon}
                    >
                      Regenerate
                    </Button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setIsCompareOpen(true)}
                      className="text-gray-600 hover:text-gray-900 text-xs"
                      leftIcon={ArrowsRightLeftIcon}
                    >
                      Compare
                    </Button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={handleReset}
                      className="text-gray-600 hover:text-gray-900 text-xs"
                      leftIcon={TrashIcon}
                    >
                      Reset
                    </Button>
                    <div className="flex-1"></div>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleCreatePost}
                      leftIcon={PlusIcon}
                      className="px-3 py-2"
                      aria-label="Create Post"
                    >
                      Create Post
                    </Button>
                    <Button
                      variant="primary"
                      size="medium"
                      onClick={handleDownloadImage}
                      leftIcon={ArrowDownTrayIcon}
                      className="px-3 py-2 rounded-xl"
                      aria-label="Download Image"
                    >
                    </Button>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-600 bg-white">
                  <div className="flex gap-4">
                    <span>{selectedImage.name || "Image"}</span>
                    <span>•</span>
                    <span>{selectedImage.contentType?.split("/")[1].toUpperCase()}</span>
                    <span>•</span>
                    <span>{selectedImage.size ? `${(selectedImage.size / 1024 / 1024).toFixed(1)} MB` : "N/A"}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Panel - Feedback/Comments */}
          <div className="lg:w-2/5 border-l border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
                Comments
              </h3>
              <p className="text-xs text-gray-600">Select comments to refine the image</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingComments && comments.length === 0 ? (
                <Loading variant="text" text="Loading comments..." />
              ) : comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No comments for this image yet
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`
                      p-3 rounded-lg border transition-all
                      ${isGenerating ? "opacity-50" : ""}
                      ${selectedCommentIds.has(comment.id)
                        ? "bg-[#15B8A6]/10 border-[#15B8A6]"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <CommentItem
                      comment={comment}
                      selectable={!isGenerating}
                      isSelected={selectedCommentIds.has(comment.id)}
                      onSelect={handleCommentSelect}
                      selectedCommentIds={selectedCommentIds}
                      showReplies={false}
                    />
                  </div>
                ))
              )}

              {hasMore && !isLoadingComments && !isGenerating && (
                <button
                  onClick={() => {
                    const nextPage = pageRef.current + 1;
                    loadComments(false, nextPage);
                  }}
                  className="w-full py-2 text-sm text-[#15B8A6] hover:text-[#13A595] hover:underline font-medium"
                >
                  Load more comments
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 space-y-3 bg-white sticky bottom-0">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{selectedCommentIds.size} comment{selectedCommentIds.size !== 1 ? "s" : ""} selected</span>
                {!isGenerating && (
                  <button
                    onClick={handleSelectAll}
                    className="text-[#15B8A6] hover:text-[#13A595] hover:underline"
                  >
                    Select All
                  </button>
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleGenerateEdits}
                disabled={selectedCommentIds.size === 0 || isGenerating || !!generatedImageUrl}
                isLoading={isGenerating}
                leftIcon={SparklesIcon}
                className="w-full"
              >
                Generate Edits
              </Button>
            </div>
          </div>
        </div>

        {/* Generating Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 z-10 rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <SparklesIcon className="w-15 h-15 text-[#15B8A6] animate-bounce" />
              </div>
              <p className="text-white font-medium animate-pulse">Generating...</p>
              <Button
                variant="secondary"
                size="small"
                onClick={handleCancelGenerate}
                className="mt-2 bg-white/30 hover:bg-white/40 hover:border-gray-100 text-white border-white/30"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {isCompareOpen && selectedImageUrl && generatedImageUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
                  src={selectedImageUrl}
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
                  src={generatedImageUrl}
                  alt="AI generated image"
                  className="max-w-full max-h-[40vh] md:max-h-[85vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

