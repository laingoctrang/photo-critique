import { CameraIcon, ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { Loading } from "../../components";
import type { PostListItemResponse } from "../../services";
import { HeartIcon } from "@heroicons/react/24/solid";

interface PostsGridProps {
  posts: PostListItemResponse[];
  isLoading: boolean;
  onPostClick: (postId: string) => void;
  emptyMessage?: string;
}

export const PostsGrid: React.FC<PostsGridProps> = ({
  posts,
  isLoading,
  onPostClick,
  emptyMessage = "No posts yet",
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading text="Loading posts..." />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CameraIcon className="w-16 h-16 mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => onPostClick(post.id)}
          className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
        >
          <img
            src={post.imageUrls[0]?.url || "/placeholder.jpg"}
            alt={post.caption || "Post"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <HeartIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{post.likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <ChatBubbleBottomCenterIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{post.commentsCount}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

