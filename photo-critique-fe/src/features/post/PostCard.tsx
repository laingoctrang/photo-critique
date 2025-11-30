import React from "react";
import { ReactionTargetType, ReactionType } from "../../types/enums";
import { Reaction } from "../../components/Reaction/Reaction";
import { ImageCarousel, ToastType } from "../../components";
import { showToast } from "../../utils";
import { postService, type PostListItemResponse } from "../../services";

interface PostCardProps {
  post: PostListItemResponse;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
    } catch (error) {
      showToast(ToastType.ERROR, "Failed to update reaction:" + error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-md mx-auto my-4">
      {/* Header */}
      <div className="flex items-center p-4">
        <img
          src={post.user.profilePicture}
          alt={post.user.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="text-sm font-semibold text-gray-900">
            {post.user.fullName}
          </p>
          <p className="text-xs text-gray-500">
            @{post.user.username} · {formattedDate}
          </p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrls.length > 0 && (
        <div className="hidden md:block md:flex-[0.6] h-full">
          <div className="h-full w-full">
        <ImageCarousel
          images={post.imageUrls.map((img) => img.url)}
          fitMode="contain"
        />
        </div>
</div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="p-4">
          <p className="text-gray-800">{post.caption}</p>
        </div>
      )}

      {/* Interaction buttons */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200">
        <div className="mt-4 flex items-center justify-between">
          {/* Reaction Button */}
          <Reaction
            targetId={post.id}
            targetType={ReactionTargetType.POST}
            initialUserReaction={post.userReaction}
            onReaction={handleReaction}
            size="md"
            showCount={false}
          />
        </div>
      </div>
    </div>
  );
};
