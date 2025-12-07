import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommentSection } from "../../../components/Comment";
import { postService, type PostResponse } from "../../../services";
import { showToast } from "../../../utils";
import { ToastType } from "../../../components";
import { PostCard } from "../../../features";

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
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await postService.getPostById(postId!);
      setPost(data);
      setCommentsCount(data.commentsCount);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to load post");
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
