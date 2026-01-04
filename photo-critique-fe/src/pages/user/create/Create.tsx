import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GlobeAltIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Button, FileUpload, PreviewModal, type FileUploadItemData } from "../../../components";
import { postService } from "../../../services/postService";
import { moderationService } from "../../../services/moderationService";
import { PostStatus, PrivacyType } from "../../../types/enums";
import { showToast } from "../../../utils";
import { ToastType } from "../../../components";
import type { ImageInfo } from "../../../services/types";

export const Create = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get("edit");

  const initialFiles = searchParams.get("imageUrl");

  let fileItem: FileUploadItemData | undefined;
  if (initialFiles) {
    fileItem = {
      id: `${initialFiles}`,
      imageInfo: {
        url: initialFiles,
        name: initialFiles.split("/").pop() || "",
        size: Number(searchParams.get("size") || 0),
        contentType: "image/" + (initialFiles.split(".").pop() || "jpg"),
      },
      moderationResult: {
        image_url: initialFiles,
        allowed: true,
        label: "",
        confidence: 0,
        probabilities: {
          safe: 0,
          sexy: 0,
          violence: 0,
        },
      },
      title: initialFiles.split("/").pop() || "",
      progress: 100,
      status: "completed",
    };
  }

  const [caption, setCaption] = useState("");
  const MAX_CAPTION_LENGTH = 5000;
  // const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyType>(PrivacyType.PUBLIC);
  const [files, setFiles] = useState<FileUploadItemData[]>(fileItem ? [fileItem] : []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showCaptionViolationModal, setShowCaptionViolationModal] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  const [statusPost, setStatusPost] = useState<PostStatus | undefined>(undefined);

  // Load draft post if editing
  useEffect(() => {
    const loadDraftPost = async () => {
      if (!editPostId) return;

      try {
        setIsLoadingDraft(true);
        const post = await postService.getPostById(editPostId);
        setStatusPost(post.status);

        // Populate form with draft data
        setCaption(post.caption || "");
        // setTags(post.tags || []);
        setPrivacy(post.privacy);

        // Convert imageUrls to FileUploadItemData format
        const draftFiles: FileUploadItemData[] = (post.imageUrls || []).map((img, index) => ({
          id: `draft-${index}`,
          file: undefined,
          status: "completed" as const,
          progress: 100,
          imageInfo: img,
          moderationResult: {
            image_url: img.url,
            allowed: true,
            label: "",
            confidence: 0,
            probabilities: {
              safe: 0,
              sexy: 0,
              violence: 0,
            },
          },
        }));
        setFiles(draftFiles);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load draft post";
        showToast(ToastType.ERROR, errorMessage);
        navigate("/create");
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadDraftPost();
  }, [editPostId, navigate]);

  const handleFilesChange = (newFiles: FileUploadItemData[]) => {
    setFiles(newFiles);
  };

  const handleViolationDetected = (_item: FileUploadItemData) => {
    setShowViolationModal(true);
  };

  const handlePreview = (item: FileUploadItemData) => {
    const index = files.findIndex((f) => f.id === item.id);
    if (index !== -1) {
      setPreviewIndex(index);
      setShowPreview(true);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    // Validate files
    const completedFiles = files.filter((f) => f.status === "completed" && f.imageInfo);
    if ((completedFiles.length === 0 && !caption.trim()) && !isDraft) {
      showToast(ToastType.ERROR, "Please upload at least one image or add a caption");
      return;
    }

    // Check if any files are still uploading
    const uploadingFiles = files.filter((f) => f.status === "uploading");
    if (uploadingFiles.length > 0 && !isDraft) {
      showToast(ToastType.ERROR, "Please wait for all files to finish uploading");
      return;
    }

    // Check if all completed images have been moderated
    const completedImageFiles = completedFiles.filter(
      (f) => f.imageInfo?.contentType?.startsWith("image/")
    );
    const unmoderatedFiles = completedImageFiles.filter(
      (f) => !f.moderationResult
    );
    if (unmoderatedFiles.length > 0 && !isDraft) {
      showToast(
        ToastType.ERROR,
        "Please wait for all images to be checked for content policy compliance"
      );
      return;
    }

    // Check moderation results - block if any image violates policy
    const violatingFiles = files.filter(
      (f) => f.moderationResult && !f.moderationResult.allowed
    );
    if (violatingFiles.length > 0 && !isDraft) {
      setShowViolationModal(true);
      return;
    }

    // Check caption moderation if not draft
    if (!isDraft && caption.trim()) {
      try {
        const captionModeration = await moderationService.moderateText(caption.trim());
        if (!captionModeration.allowed) {
          setShowCaptionViolationModal(true);
          return;
        }
      } catch (error) {
        console.error("Caption moderation check failed:", error);
        // Continue if moderation check fails
      }
    }

    try {
      // Prepare image info with titles
      const imageInfos: ImageInfo[] = completedFiles.map((file) => ({
        url: file.imageInfo!.url,
        name: file.title || file.imageInfo!.name,
        size: file.imageInfo!.size,
        contentType: file.imageInfo!.contentType,
      }));

      if (isDraft) {
        setIsSavingDraft(true);

        if (editPostId) {
          // Update existing draft
          const response = await postService.updatePost(editPostId, {
            imageUrls: imageInfos.length > 0 ? imageInfos : undefined,
            caption: caption.trim() || undefined,
            privacy,
            // tags: tags.length > 0 ? tags : undefined,
            status: "DRAFTED",
          });
          showToast(ToastType.SUCCESS, response.message || "Draft updated successfully!");
        } else {
          // Create new draft
          const response = await postService.createPost({
            imageUrls: imageInfos.length > 0 ? imageInfos : undefined,
            caption: caption.trim() || undefined,
            privacy,
            // tags: tags.length > 0 ? tags : undefined,
            status: "DRAFTED",
          });
          showToast(ToastType.SUCCESS, response.message || "Draft saved successfully!");
          // Update URL to include edit param
          navigate(`/create?edit=${response.id}`, { replace: true });
        }

        setIsSavingDraft(false);
        return;
      }

      setIsSubmitting(true);

      if (editPostId) {
        // Update draft to POSTED
        const response = await postService.updatePost(editPostId, {
          imageUrls: imageInfos.length > 0 ? imageInfos : undefined,
          caption: caption.trim() || undefined,
          privacy,
          // tags: tags.length > 0 ? tags : undefined,
          status: "POSTED",
        });
        
        showToast(ToastType.SUCCESS, response.message || statusPost === PostStatus.POSTED ? "Post updated successfully!" : "Post published successfully!");
        navigate(`/post/${response.id}`);
      } else {
        // Create new post
        const response = await postService.createPost({
          imageUrls: imageInfos.length > 0 ? imageInfos : undefined,
          caption: caption.trim() || undefined,
          privacy,
          // tags: tags.length > 0 ? tags : undefined,
          status: "POSTED",
        });
        showToast(ToastType.SUCCESS, response.message || "Post created successfully!");
        navigate(`/post/${response.id}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${editPostId ? "update" : "create"} post`;
      showToast(ToastType.ERROR, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const privacyOptions = [
    {
      value: PrivacyType.PUBLIC,
      label: "Public",
      icon: GlobeAltIcon,
      description: "Everyone can see your post.",
    },
    {
      value: PrivacyType.FOLLOWER_ONLY,
      label: "Followers Only",
      icon: UsersIcon,
      description: "Only people who follow you can view this.",
    },
    {
      value: PrivacyType.PRIVATE,
      label: "Private",
      icon: LockClosedIcon,
      description: "Only you can see this post.",
    },
  ];

  if (isLoadingDraft) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading draft...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-3xl shadow-sm flex flex-col">
      <div className="p-6 h-full flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-800 flex-shrink-0 mb-1">Create Post</h1>
        <span className="text-sm text-gray-500 mb-4">Upload at least one image to create a post.</span>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-y-auto hidden-scrollbar lg:overflow-hidden">
          {/* Left Column - File Upload */}
          <div className="flex flex-col h-full min-h-0 lg:overflow-hidden">
            <div className="flex-1 lg:overflow-y-auto space-y-6 hidden-scrollbar">
              <FileUpload
                files={files}
                onFilesChange={handleFilesChange}
                onPreview={handlePreview}
                onViolationClick={() => setShowViolationModal(true)}
                onViolationDetected={handleViolationDetected}
                maxFiles={10}
                acceptedTypes=".jpg,.jpeg,.png,image/jpeg,image/png"
                maxSize={10 * 1024 * 1024} // 10MB
                className="lg:h-[calc(100vh-222px)] w-full rounded-3xl flex flex-col justify-center items-center hover:border-[#15B8A6] hover:bg-[#F0FDFA]"
              />
            </div>
          </div>

          {/* Right Column - Post Details */}
          <div className="flex flex-col h-full min-h-0 lg:overflow-hidden">
            <div className="flex-1 lg:overflow-y-auto lg:space-y-6 px-1">
              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Caption
                  </label>
                  <span className="text-xs text-gray-500">
                    {caption.length}/{MAX_CAPTION_LENGTH}
                  </span>
                </div>
                <div className="relative border border-gray-300 rounded-2xl focus:outline-none focus:border-[#15B8A6]/60 focus:ring-2 focus:ring-[#15B8A6]/50 px-4 py-2">
                  <textarea
                    value={caption}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CAPTION_LENGTH) {
                        setCaption(e.target.value);
                      }
                    }}
                    placeholder="Write a captivating caption..."
                    rows={6}
                    className="w-full border-none focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="lg:border-t border-gray-200 py-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Privacy Settings
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {privacyOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = privacy === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPrivacy(option.value)}
                        className={`
                          w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left
                          ${isSelected
                            ? "border-[#15B8A6]/60 bg-[#F0FDFA]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`
                              w-5 h-5
                              ${isSelected ? "text-[#15B8A6]" : "text-gray-600"}
                            `} />
                            <span className={`
                              text-sm font-medium
                              ${isSelected ? "text-[#15B8A6]" : "text-gray-700"}
                            `}>
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex gap-3 mt-auto flex-shrink-0 border-t border-gray-200 pt-4">
              {statusPost !== PostStatus.POSTED && (
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || isSavingDraft || files.length === 0 ||  files.some((f) => f.status === "uploading") ||
                  files.some(
                    (f) =>
                      f.status === "completed" &&
                      f.imageInfo?.contentType?.startsWith("image/") &&
                      !f.moderationResult
                  ) ||
                  files.some(
                    (f) =>
                      f.status === "completed" &&
                      f.moderationResult &&
                      !f.moderationResult.allowed
                  )}
                isLoading={isSavingDraft}
                fullWidth
              >
                Save as Draft
              </Button>
              )}
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={
                  isSubmitting ||
                  isSavingDraft ||
                  files.length === 0 ||
                  files.some((f) => f.status === "uploading") ||
                  files.some(
                    (f) =>
                      f.status === "completed" &&
                      !f.moderationResult
                  ) ||
                  files.some(
                    (f) =>
                      f.status === "completed" &&
                      f.moderationResult &&
                      !f.moderationResult.allowed
                  )
                }
                isLoading={isSubmitting}
                fullWidth
              >
                {!editPostId ? "Publish Post" : statusPost === PostStatus.POSTED ? "Update Post" : "Publish Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        items={files}
        currentIndex={previewIndex}
        onIndexChange={setPreviewIndex}
      />

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowViolationModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
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
                  onClick={() => setShowViolationModal(false)}
                  className="px-6"
                >
                  I Understand
                </Button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowViolationModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Caption Violation Modal */}
      {showCaptionViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCaptionViolationModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
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
                  Your caption violates our content policy. Hate speech and offensive language are not allowed. Please revise your caption before posting.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Content Guidelines:
                </p>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Do not use hate speech</li>
                  <li>Do not use offensive language</li>
                  <li>Keep your content respectful and appropriate</li>
                  <li>Only content that passes moderation can be published</li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowCaptionViolationModal(false)}
                  className="px-6"
                >
                  I Understand
                </Button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowCaptionViolationModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
