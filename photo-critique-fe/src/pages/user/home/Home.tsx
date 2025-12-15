import { useEffect, useState, useRef, useCallback } from "react";
import { postService, type PostListItemResponse } from "../../../services";
import { Banner } from "./Banner";
import { showToast } from "../../../utils";
import { Loading, ToastType } from "../../../components";
import { PostDetailModal, PostList } from "../../../features";

const PAGE_SIZE = 20;

export const Home = () => {
  const [posts, setPosts] = useState<PostListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial feed
  useEffect(() => {
    let mounted = true;

    const getFeed = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getFeed(0, PAGE_SIZE);
        if (!mounted) return;
        setPosts(data ?? []);
        setHasMore((data ?? []).length === PAGE_SIZE);
        setPage(1);
      } catch (error: unknown) {
        if (!mounted) return;
        const errorMessage = error instanceof Error ? error.message : "Failed to get feed";
        showToast(ToastType.ERROR, errorMessage);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    getFeed();

    return () => {
      mounted = false;
    };
  }, []);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const data = await postService.getFeed(page, PAGE_SIZE);
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage((prev) => prev + 1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load more posts";
      showToast(ToastType.ERROR, errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading variant="fullscreen" text="Loading posts..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <section className="w-full">
          <Banner />
        </section>

        <section className="w-full">
          <PostList posts={posts} onPostClick={setSelectedPostId} />
          
          {/* Observer target for infinite scroll */}
          <div ref={observerTarget} className="h-10 flex items-center justify-center">
            {isLoadingMore && (
              <div className="text-gray-500 text-sm">Loading more posts...</div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="text-gray-500 text-sm">No more posts to load</div>
            )}
          </div>
        </section>
      </div>

      <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
    </>
  );
};
