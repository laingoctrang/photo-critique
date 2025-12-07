import { useEffect, useState } from "react";
import { PostList } from "../../../features/post/PostList";
import { postService, type PostListItemResponse } from "../../../services";
import { Banner } from "./Banner";
import { showToast } from "../../../utils";
import { ToastType } from "../../../components";

export const Home = () => {
  const [posts, setPosts] = useState<PostListItemResponse[]>([]); // empty array safe
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getFeed = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getFeed();
        if (!mounted) return;
        setPosts(data ?? []);
      } catch (error: any) {
        if (!mounted) return;
        showToast(ToastType.ERROR, error?.message || "Failed to get feed");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    getFeed();

    return () => {
      mounted = false; // tránh setState sau khi unmount
    };
  }, []); // <- chạy 1 lần khi mount

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="w-full">
        <Banner />
      </section>

      <section className="w-full">
        <PostList posts={posts} />
      </section>
    </div>
  );
};
