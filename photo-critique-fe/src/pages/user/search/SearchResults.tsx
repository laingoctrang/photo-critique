import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { postService, type PostListItemResponse } from "../../../services";
import { Loading, ToastType } from "../../../components";
import { showToast } from "../../../utils";
import { PostDetailModal, PostList } from "../../../features";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [posts, setPosts] = useState<PostListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    const searchPosts = async () => {
      if (!query.trim()) {
        setIsLoading(false);
        setPosts([]);
        return;
      }

      try {
        setIsLoading(true);
        const results = await postService.searchPostsByUserKeyword(query);
        setPosts(results);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to search posts";
        showToast(ToastType.ERROR, errorMessage);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchPosts();
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading variant="fullscreen" text="Searching posts..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600 mt-2">
              Posts from users matching "{query}"
            </p>
          )}
        </div>

        <section className="w-full">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg">
                {query ? `No posts found for "${query}"` : "Enter a search query"}
              </p>
            </div>
          ) : (
            <PostList posts={posts} onPostClick={setSelectedPostId} />
          )}
        </section>
      </div>

      <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
    </>
  );
};

