import React, { useEffect, useState } from "react";
import { CommentSection } from "../comment";
import { postService, type PostResponse } from "../../services";
import { showToast } from "../../utils";
import { Loading, ToastType } from "../../components";
import { PostCard } from "..";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PostDetailModalProps {
  postId: string | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ postId, onClose }) => {
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      return;
    }

    const loadPost = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getPostById(postId);
        setPost(data);
        setCommentsCount(data.commentsCount);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load post";
        showToast(ToastType.ERROR, errorMessage);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId, onClose]);

  const handleCommentCountChange = (count: number) => {
    setCommentsCount(count);
    if (post) {
      setPost({ ...post, commentsCount: count });
    }
  };

  if (!postId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
          onClick={onClose}
          type="button"
          aria-label="Close post detail"
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 transition-colors p-2 hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <XMarkIcon className="w-6 h-6 text-white hover:text-gray-600" />
        </button>

      <div 
        className="relative w-full max-w-7xl mx-4 my-8 bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loading variant="fullscreen" text="Loading post..." />
          </div>
        ) : post ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 flex-1 min-h-0 overflow-hidden">
            {/* Left: Post Display */}
            <div className="flex-shrink-0 lg:col-span-3 overflow-y-auto hidden-scrollbar">
              <PostCard post={post} isViewDetail={true} />
            </div>

            {/* Right: Comment Section */}
            <div className="flex-shrink-0 min-h-0 lg:col-span-2">
              <CommentSection
                postId={post.id}
                commentsCount={commentsCount}
                imageUrls={post.imageUrls}
                postAuthorId={post.user.id}
                onCommentCountChange={handleCommentCountChange}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

