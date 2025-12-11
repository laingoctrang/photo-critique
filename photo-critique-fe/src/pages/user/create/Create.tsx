import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GlobeAltIcon,
  LinkIcon,
  LockClosedIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Button, FileUpload, TagInput, PreviewModal, type FileUploadItemData } from "../../../components";
import { postService } from "../../../services/postService";
import { PrivacyType } from "../../../types/enums";
import { showToast } from "../../../utils";
import { ToastType } from "../../../components";
import type { ImageInfo } from "../../../services/types";

// Mock tag suggestions
const TAG_SUGGESTIONS = [
  "landscape",
  "sunset",
  "nature",
  "photography",
  "travel",
  "portrait",
  "urban",
  "architecture",
  "street",
  "wildlife",
  "macro",
  "blackandwhite",
  "colorful",
  "abstract",
  "minimalist",
];

export const Create = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyType>(PrivacyType.PUBLIC);
  const [files, setFiles] = useState<FileUploadItemData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleFilesChange = (newFiles: FileUploadItemData[]) => {
    setFiles(newFiles);
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
    if (completedFiles.length === 0 && !isDraft) {
      showToast(ToastType.ERROR, "Please upload at least one image");
      return;
    }

    // Check if any files are still uploading
    const uploadingFiles = files.filter((f) => f.status === "uploading");
    if (uploadingFiles.length > 0 && !isDraft) {
      showToast(ToastType.ERROR, "Please wait for all files to finish uploading");
      return;
    }

    try {
      if (isDraft) {
        setIsSavingDraft(true);
        // TODO: Implement save as draft functionality
        showToast(ToastType.SUCCESS, "Draft saved successfully");
        setIsSavingDraft(false);
        return;
      }

      setIsSubmitting(true);

      // Prepare image info with titles
      const imageInfos: ImageInfo[] = completedFiles.map((file) => ({
        url: file.imageInfo!.url,
        name: file.title || file.imageInfo!.name,
        size: file.imageInfo!.size,
        contentType: file.imageInfo!.contentType,
      }));

      // Create post
      const response = await postService.createPost({
        imageUrls: imageInfos,
        caption: caption.trim(),
        privacy,
        tags: tags.length > 0 ? tags : undefined,
      });

      showToast(ToastType.SUCCESS, response.message || "Post created successfully!");
      navigate(`/post/${response.id}`);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const privacyOptions = [
    {
      value: PrivacyType.PUBLIC,
      label: "Public",
      icon: GlobeAltIcon,
      description: "Anyone can see this post",
    },
    {
      value: PrivacyType.FOLLOWER_ONLY,
      label: "Follower Only",
      icon: LinkIcon,
      description: "Only your followers can see this post",
    },
    {
      value: PrivacyType.PRIVATE,
      label: "Private",
      icon: LockClosedIcon,
      description: "Only you can see this post",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - File Upload */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Files
              </h2>
              <FileUpload
                files={files}
                onFilesChange={handleFilesChange}
                onPreview={handlePreview}
                maxFiles={10}
                acceptedTypes="image/*,video/*"
                maxSize={50 * 1024 * 1024} // 50MB
              />
            </div>
          </div>

          {/* Right Column - Post Details */}
          <div className="space-y-6">
            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell us more about your photo..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#15B8A6] focus:border-transparent resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                suggestions={TAG_SUGGESTIONS}
                placeholder="Add a tag..."
                maxTags={10}
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy
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
                        flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${
                          isSelected
                            ? "border-[#15B8A6] bg-[#F0FDFA] text-[#15B8A6]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || isSavingDraft}
                isLoading={isSavingDraft}
                fullWidth
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || isSavingDraft}
                isLoading={isSubmitting}
                fullWidth
                leftIcon={EyeIcon}
              >
                Publish
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
    </div>
  );
};
