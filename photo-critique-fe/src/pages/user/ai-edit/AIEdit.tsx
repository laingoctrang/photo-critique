import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button, FileUpload, type FileUploadItemData, ImageCarousel } from "../../../components";
import { showToast } from "../../../utils";
import { ToastType } from "../../../components";
import { generateService, imageGenerationHistoryService, type ImageGenerationHistoryResponse, uploadService, moderationService } from "../../../services";
import { HistoryView } from "./HistoryView";

export const AIEdit = () => {
  const navigate = useNavigate();
  const MAX_PROMPT_LENGTH = 1000;

  const [files, setFiles] = useState<FileUploadItemData[]>([]);
  const [prompt, setPrompt] = useState("");

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const cancelTokenRef = useRef<{ cancelled: boolean } | null>(null);

  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showTextViolationModal, setShowTextViolationModal] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "history">("chat");

  const [imgRatio, setImgRatio] = useState<number | null>(null);

  const loadSizes = async (imageUrl: string) => {
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
  };

  const handleFilesChange = async (newFiles: FileUploadItemData[]) => {
    setFiles(newFiles);

    if (newFiles[0]?.imageInfo?.url) {
      setOriginalImage(newFiles[0].imageInfo.url);
      setAiGeneratedImage(null);
      await loadSizes(newFiles[0].imageInfo.url);
    } else {
      setOriginalImage(null);
      setAiGeneratedImage(null);
      setImgRatio(null);
    }
  };

  const handleRemoveImage = () => {
    setFiles([]);
    setOriginalImage(null);
    setAiGeneratedImage(null);
    setPrompt("");
    uploadService.deleteFile(originalImage?.split("/").pop() || "");
  };

  const handleDownloadImage = async () => {
    if (!aiGeneratedImage) return;

    let downloadUrl = aiGeneratedImage;

    if (aiGeneratedImage.includes("res.cloudinary.com")) {
      downloadUrl = aiGeneratedImage.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
    }

    window.open(downloadUrl, "_blank");

    // Fallback: fetch → blob
    try {
      const response = await fetch(aiGeneratedImage, { mode: "cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${url}-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleCreatePost = () => {
    if (!aiGeneratedImage) return;
    // Navigate to create page with the generated image
    navigate(`/create?imageUrl=${encodeURIComponent(aiGeneratedImage)}&size=${files[0]?.imageInfo?.size}`);
  };

  const handleShowHistory = () => {
    setViewMode("history");
  };

  const handleShowChat = () => {
    setViewMode("chat");
  };

  const handleRegenerate = () => {
    setAiGeneratedImage(null);
  };

  const handleReEdit = async (history: ImageGenerationHistoryResponse) => {
    // Create FileUploadItemData from history
    const fileItem: FileUploadItemData = {
      id: `history-${history.id}`,
      imageInfo: {
        url: history.inputImageUrl,
        name: history.inputImageUrl.split("/").pop() || "image.jpg",
        size: 0, // Size not available from history
        contentType: "image/" + (history.inputImageUrl.split(".").pop() || "jpeg"),
      },
      title: history.inputImageUrl.split("/").pop() || "image.jpg",
      progress: 100,
      status: "completed",
    };

    setFiles([fileItem]);
    setOriginalImage(history.inputImageUrl);
    setPrompt(history.prompt);
    setAiGeneratedImage(history.outImageUrl);
    setViewMode("chat");
    // Load image sizes
    await loadSizes(history.inputImageUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsCompareOpen(false);
    }
  };

  // Auto-resize textarea with max 5 lines
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    const lineHeight = 24;
    const maxHeight = lineHeight * 5; // 5 lines max  

    // Set height based on content, but cap at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Enable scroll if content exceeds max height
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_PROMPT_LENGTH) {
      setPrompt(e.target.value);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast(ToastType.ERROR, "Please enter a prompt");
      return;
    }

    if (!originalImage) {
      showToast(ToastType.ERROR, "Please upload an image first");
      return;
    }

    // Check text moderation
    try {
      const textModeration = await moderationService.moderateText(prompt.trim());
      if (!textModeration.allowed) {
        setShowTextViolationModal(true);
        return;
      }
    } catch (error) {
      console.error("Text moderation check failed:", error);
      // Continue if moderation check fails
    }

    // Check moderation results - block if any image violates policy
    const violatingFile = files[0]?.moderationResult && !files[0]?.moderationResult?.allowed;

    if (violatingFile) {
      setShowViolationModal(true);
      return;
    }

    // Create cancel token
    cancelTokenRef.current = { cancelled: false };
    setIsGenerating(true);

    try {
      const result = await generateService.generateImage(
        prompt.trim(),
        originalImage,
        undefined,
        cancelTokenRef.current
      );

      // Only update if not cancelled
      if (!cancelTokenRef.current?.cancelled) {
        setAiGeneratedImage(result.imageUrl);
        await loadSizes(result.imageUrl);
        // save to history
        imageGenerationHistoryService.create({
          inputImageUrl: originalImage,
          outImageUrl: result.imageUrl,
          prompt: prompt.trim(),
        });
      }
    } finally {
      setIsGenerating(false);
      cancelTokenRef.current = null;
    }
  };

  const handleCancelGenerate = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancelled = true;
      setIsGenerating(false);
      showToast(ToastType.INFO, "Generation cancelled");
    }
  };

  const currentFile = files[0];
  const isUploaded = currentFile?.status === "completed" && currentFile?.imageInfo;
  const isFileUploading = currentFile && (currentFile.status === "pending" || currentFile.status === "uploading");
  const hasViolation = currentFile?.moderationResult && !currentFile?.moderationResult?.allowed;
  const displayImage = aiGeneratedImage || originalImage;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* View Mode Switch */}
      <div className="">
        {viewMode === "history" && (
          <div className="flex justify-between items-start">
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Recent Edits</h1>
              <p className="text-gray-500 font-light text-sm mb-4">Manage and revisit your past generations.</p>
            </div>
            <Button
              variant="secondary"
              size="medium"
              onClick={handleShowChat}
              leftIcon={SparklesIcon}
              className="text-sm rounded-xl"
            >
              New Edit
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {viewMode === "history" ? (
        <HistoryView onReEdit={handleReEdit} />
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {!isUploaded ? (
            /* Upload Area */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-start flex-shrink-0">
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Ready to edit?</h1>
                  <p className="text-gray-500 font-light text-sm mb-4">Upload an image to start applying AI enhancements.</p>
                </div>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleShowHistory}
                  leftIcon={ClockIcon}
                  className="text-sm rounded-xl"
                >
                  View History
                </Button>
              </div>
              
              <div className="flex-1 min-h-0 relative overflow-hidden">
                {/* Loading Overlay when uploading */}
                {isFileUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-50 rounded-3xl border-2 border-dashed border-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <ArrowPathIcon className="w-12 h-12 text-[#15B8A6] animate-spin" />
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-gray-700">
                         Uploading image to cloudinary...
                        </p>
                        <div className="w-64 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#15B8A6] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentFile?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <FileUpload
                  files={files}
                  onFilesChange={handleFilesChange}
                  maxFiles={1}
                  acceptedTypes=".jpg,.jpeg,.png,image/jpeg,image/png"
                  maxSize={10 * 1024 * 1024}
                  className="h-[calc(100vh-285px)] w-full rounded-3xl flex flex-col justify-center items-center hover:border-[#15B8A6] hover:bg-[#F0FDFA]"
                  itemClassName="rounded-3xl opacity-0"
                />
              </div>


            </div>
          ) : (
            /* Image Display Area */
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 overflow-hidden">
              {/* Image Container */}
              <div className="relative w-full flex items-center justify-center flex-1 overflow-hidden">

                {/* Image with blur when generating */}
                {displayImage && imgRatio && (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
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
                )}

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

                {/* Violation Overlay */}
                {hasViolation && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 z-10 rounded-3xl">
                    <div className="flex flex-col items-center text-center px-4">
                      <ExclamationTriangleIcon
                        className="w-20 h-20 text-red-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setShowViolationModal(true);
                        }}
                      />
                      <p className="text-white font-medium">Image violates content policy</p>
                      <p className="text-red-200 text-sm">Please remove this image and upload a new one</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls Bar */}
              <div className={`absolute top-4 right-4 z-10 rounded-full bg-white/30 hover:bg-white/20 text-white transition-colors ${(isGenerating || aiGeneratedImage) ? "opacity-0 pointer-events-none" : ""}`}>
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={handleRemoveImage}
                  disabled={isGenerating}
                  className="p-2"
                  leftIcon={XMarkIcon}
                  title="Delete Image"
                >
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Toolbar - Show after image is generated - Only in chat mode */}
      {viewMode === "chat" && (
        <>
          {aiGeneratedImage ? (
            <div className="flex-shrink-0 mx-1 mb-1 mt-4">
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                {/* Regenerate Button */}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleRegenerate}
                  className="text-gray-600 hover:text-gray-900 text-xs"
                  leftIcon={ArrowPathIcon}
                >
                  Regenerate
                </Button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300"></div>

                {/* Compare Button */}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setIsCompareOpen(true)}
                  className="text-gray-600 hover:text-gray-900 text-xs"
                  leftIcon={ArrowsRightLeftIcon}
                >
                  Compare
                </Button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300"></div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleRemoveImage}
                  className="text-gray-600 hover:text-gray-900 text-xs"
                  leftIcon={TrashIcon}
                >
                  Clear
                </Button>

                {/* Spacer */}
                <div className="flex-1"></div>

                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleCreatePost}
                  leftIcon={DocumentPlusIcon}
                >
                  Create Post
                </Button>

                {/* Download Button - Primary */}
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleDownloadImage}
                  leftIcon={ArrowDownTrayIcon}
                >
                  Download Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 mx-1 mb-1 mt-4">
              <div className="flex gap-3">
                <div className={`
          flex flex-col w-full border border-gray-300 shadow-sm rounded-2xl p-3 gap-2 relative
          ${isTextareaFocused ? "border-[#15B8A6] ring-2 ring-[#15B8A6]/70" : ""}
          ${isGenerating ? "bg-gray-200/10" : "bg-white hover:bg-gray-50"}`
                }>
                  <textarea
                    ref={textareaRef}
                    className="w-full border-none outline-none resize-none text-sm placeholder-gray-400 text-gray-800"
                    style={{
                      height: "90px",
                      lineHeight: "24px",
                      overflowY: "auto",
                    }}
                    placeholder="Describe what you want to edit...(max 1000 characters)"
                    value={prompt}
                    onChange={handlePromptChange}
                    maxLength={MAX_PROMPT_LENGTH}
                    onFocus={() => setIsTextareaFocused(true)}
                    onBlur={(e) => {
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      if (relatedTarget?.closest('button')) {
                        return;
                      }
                      setIsTextareaFocused(false);
                    }}
                    disabled={isGenerating || hasViolation}
                    rows={1}
                  />
                  
                  {/* Bottom row: Character Count (left) and Button (right) */}
                  <div className="flex justify-between items-center w-full">
                    {/* Character Count - Left */}
                    <span className="text-xs text-gray-500">
                      {prompt.length}/{MAX_PROMPT_LENGTH}
                    </span>
                    
                    {/* Button - Right */}
                    <Button
                      variant="ghost"
                      size="large"
                      leftIcon={({ className }) => <ArrowUpIcon className={`${className} p-1 bg-[#15B8A6] rounded-full text-white`} />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleGenerate();
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      disabled={isGenerating || isFileUploading || !prompt.trim() || !isUploaded || hasViolation}
                      className="rounded-xl p-0 flex-shrink-0 border-none outline-none disabled:opacity-30"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Compare Modal - Only show in chat mode */}
      {viewMode === "chat" && isCompareOpen && originalImage && aiGeneratedImage && (
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
              {aiGeneratedImage && (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Violation Modal - Only show in chat mode */}
      {viewMode === "chat" && showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowViolationModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
            {/* Header with gradient */}
            <div className="bg-red-500 px-6 py-5">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Content Policy Violation
                  </h3>

                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4">
                <p className="text-gray-500 leading-relaxed">
                  Your image violates our content policy. Sensitive or violent images are not allowed. Please remove any violating images before posting.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Content Guidelines:
                </p>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Do not post sensitive or violent images</li>
                  <li>Do not post images with violent tendencies</li>
                  <li>Remove any images flagged with warnings</li>
                  <li>Only images that pass moderation can be published</li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    setShowViolationModal(false);
                    handleRemoveImage();
                  }}
                  className="px-6"
                >
                  Got it, remove image
                </Button>
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="medium"
              onClick={() => setShowViolationModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
              leftIcon={XMarkIcon}
            />
          </div>
        </div>
      )}

      {/* Text Violation Modal - Only show in chat mode */}
      {viewMode === "chat" && showTextViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTextViolationModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
            {/* Header with gradient */}
            <div className="bg-red-500 px-6 py-5">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Content Policy Violation
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4">
                <p className="text-gray-500 leading-relaxed">
                  Your text violates our content policy. Offensive or hateful content is not allowed. Please revise your prompt before generating.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Content Guidelines:
                </p>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Do not use offensive or hateful language</li>
                  <li>Do not include inappropriate content in your prompt</li>
                  <li>Keep your prompts respectful and appropriate</li>
                  <li>Only prompts that pass moderation can be used</li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    setShowTextViolationModal(false);
                  }}
                  className="px-6"
                >
                  Got it, I'll revise
                </Button>
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="medium"
              onClick={() => setShowTextViolationModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
              leftIcon={XMarkIcon}
            />
          </div>
        </div>
      )}

    </div>
  );
};
