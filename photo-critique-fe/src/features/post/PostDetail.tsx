import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommentSection } from "../comment";
import { postService, type PostResponse } from "../../services";
import { showToast } from "../../utils";
import { Loading, ToastType } from "../../components";
import { PostCard } from "..";

export const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);

  // Save scroll position before navigating to detail
  useEffect(() => {
    const scrollY = window.scrollY;
    sessionStorage.setItem('homeScrollPosition', scrollY.toString());
  }, []);

  useEffect(() => {
    if (!postId) {
      navigate("/");
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
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId, navigate]);

  const handleCommentCountChange = (count: number) => {
    setCommentsCount(count);
    if (post) {
      setPost({ ...post, commentsCount: count });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading variant="fullscreen" text="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  function handleBackButtonClick() {
    // Restore scroll position when going back
    const savedScroll = sessionStorage.getItem('homeScrollPosition');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 100);
    }
    navigate(-1);
  }

  return (
    <div className="container mx-auto w-full px-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 ">
        {/* Left: Post Display */}
        <div className="flex-shrink-0 lg:col-span-3">
          <PostCard post={post} isViewDetail={true} showBackButton={true} onBackButtonClick={handleBackButtonClick} />
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
