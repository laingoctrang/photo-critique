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

  // Save scroll position before navigating to detail
  useEffect(() => {
    const scrollY = window.scrollY;
    sessionStorage.setItem('homeScrollPosition', scrollY.toString());
  }, []);

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
      <div
        className="relative w-full max-w-7xl mx-4 my-8 bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden lg:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loading variant="fullscreen" text="Loading post..." />
          </div>
        ) : post ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
            {/* Left: Post Display */}
            <div className="lg:flex-shrink-0 lg:col-span-3 lg:overflow-y-auto lg:border-r border-gray-200 hidden-scrollbar">
              <PostCard post={post} isViewDetail={true} showBackButton={true} onBackButtonClick={onClose} />
            </div>

            {/* Right: Comment Section */}
            <div className="lg:flex-shrink-0 lg:min-h-0 lg:col-span-2">
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

