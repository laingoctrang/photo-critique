import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommentSection } from "../../../components/Comment";
import { postService, type PostResponse } from "../../../services";
import { showToast } from "../../../utils";
import { ToastType } from "../../../components";
import { PostCard } from "../../../features";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (!postId) {
      navigate("/");
      return;
    }

    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await postService.getPostById(postId!);
      setPost(data);
      setCommentsCount(data.commentsCount);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load post";
      showToast(ToastType.ERROR, errorMessage);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentCountChange = (count: number) => {
    setCommentsCount(count);
    if (post) {
      setPost({ ...post, commentsCount: count });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="container mx-auto w-full px-6">
      {/* Close Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(-1)}
          type="button"
          aria-label="Close post detail"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 ">
        {/* Left: Post Display */}
        <div className="flex-shrink-0 lg:col-span-3">
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
    </div>
  );
};
