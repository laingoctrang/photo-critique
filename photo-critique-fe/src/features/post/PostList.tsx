import React from 'react';
import type { PostListItemResponse } from '../../services/postService';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: PostListItemResponse[];
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (posts?.length === 0) {
    return <p className="text-center text-gray-500 mt-4">No posts available.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>  
  );
};
