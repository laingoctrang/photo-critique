import React, { useEffect, useState } from "react";
import { ReactionTargetType, ReactionType } from "../../types/enums";
import { Reaction } from "../../components/Reaction/Reaction";
import { ContentExpandable, ImageCarousel, ToastType } from "../../components";
import { showToast } from "../../utils";
import { postService, type PostListItemResponse } from "../../services";
import {
  BookmarkIcon,
  ChatBubbleBottomCenterIcon,
  EllipsisVerticalIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";

interface PostCardProps {
  post: PostListItemResponse;
  isViewDetail?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isViewDetail = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentPost, setCurrentPost] = useState<PostListItemResponse>(post);

  const isPostAuthor = currentPost.user.id === user?.id;

  const [imgRatio, setImgRatio] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const loadSizes = async () => {
      try {
        const promises = post.imageUrls.map(
          (img) =>
            new Promise<{ w: number; h: number }>((resolve) => {
              const el = document.createElement("img");
              el.onload = () =>
                resolve({ w: el.naturalWidth || 1, h: el.naturalHeight || 1 });
              el.onerror = () => resolve({ w: 800, h: 800 }); // fallback square
              el.src = img.url;
            })
        );

        const sizes = await Promise.all(promises);
        if (!mounted) return;

        // landscape: w > h
        const landscape = sizes.filter((s) => s.w > s.h);

        if (landscape.length > 0) {
          const ratio = Math.max(...landscape.map((s) => s.w / s.h));
          setImgRatio(Number(ratio.toFixed(4)));
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
      } catch (err) {
        setImgRatio(Number((3 / 2).toFixed(4)));
      }
    };

    if (post.imageUrls.length > 0) loadSizes();
    else setImgRatio(null);

    return () => {
      mounted = false;
    };
  }, [post]);

  const formattedDate = new Date(post.createdAt).toLocaleString();

  const handleReaction = async (
    postId: string,
    reactionType: ReactionType | null
  ) => {
    try {
      if (reactionType !== null) {
        await postService.addReaction(postId, reactionType);
      } else {
        await postService.removeReaction(postId);
      }
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      setIsSaving(true);
      let result: boolean | string = true;
      if (currentPost.isSaved) {
        result = await postService.unsavePost(postId);
      } else {
        result = await postService.savePost(postId);
      }
      if (result)
        setCurrentPost((prev: any) => ({ ...prev, isSaved: !prev.isSaved }));
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden
                w-full max-w-full h-full
                mx-auto px-4 sm:px-0
                ${isViewDetail ? "" : "sm:max-w-md md:max-w-lg lg:max-w-3xl"}`}
      data-post-id={currentPost.id}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Header Left */}
        <div className="flex items-center justify-between">
          <img
            src={currentPost.user.profilePicture}
            alt={currentPost.user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">
              {currentPost.user.fullName}
            </p>
            <p className="text-xs text-gray-500">
              @{currentPost.user.username} · {formattedDate}
            </p>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center justify-between">
          <div className="ml-3">
            <EllipsisVerticalIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Image */}
      {currentPost.imageUrls.length > 0 && imgRatio && (
        <div className="block px-4">
          <div className="w-full" style={{ aspectRatio: imgRatio }}>
            <ImageCarousel
              images={currentPost.imageUrls.map((img) => img.url)}
              fitMode="contain"
            />
          </div>
        </div>
      )}

      {/* Caption */}
      {currentPost.caption && (
        <ContentExpandable
          text={currentPost.caption}
          scrollTargetSelector="[data-post-id]"
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        {/* Left foooter */}
        <div className="flex gap-6 items-center">
          <div className="flex gap-1 items-center">
            {/* Reaction Button */}
            <Reaction
              targetId={currentPost.id}
              targetType={ReactionTargetType.POST}
              initialUserReaction={currentPost.userReaction}
              onReaction={handleReaction}
              size="md"
              showCount={false}
            />
            <span className="text-gray-600">{currentPost.likesCount}</span>
          </div>
          <div
            className="flex gap-1 items-center hover:underline cursor-pointer"
            onClick={() => navigate(`/post/${currentPost.id}`)}
          >
            <ChatBubbleBottomCenterIcon className="w-6 h-6 text-gray-600" />
            <span className="text-gray-600">{currentPost.commentsCount}</span>
          </div>
          <div className="flex gap-1 items-center">
            <ShareIcon className="w-6 h-6 text-gray-600" />
            <span className="text-gray-600">{currentPost.sharesCount}</span>
          </div>
        </div>

        {/* Right foooter */}
        {!isPostAuthor && (
          <div
            className={`cursor-pointer ${
              isSaving ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => handleSavePost(currentPost.id)}
          >
            {currentPost.isSaved ? (
              <BookmarkIconSolid className="w-6 h-6 text-[#15B8A6]" />
            ) : (
              <BookmarkIcon className="w-6 h-6 text-gray-600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
