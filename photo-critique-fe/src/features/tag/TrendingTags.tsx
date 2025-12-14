import { useEffect, useState } from "react";
import { tagService, type TagResponse } from "../../services/tagService";

export const TrendingTags = () => {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrendingTags = async () => {
      try {
        setIsLoading(true);
        const data = await tagService.getTrendingTags(5);
        setTags(data);
      } catch (error) {
        console.error("Failed to load trending tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingTags();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Tags</h3>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Tags</h3>
      <div className="flex flex-col gap-2">
        {tags.map((tag, index) => (
          <div
            key={tag.id}
            className={`text-sm ${
              index === 0
                ? "text-[#15B8A6] font-medium"
                : "text-gray-500"
            }`}
          >
            #{tag.name}
          </div>
        ))}
      </div>
    </div>
  );
};

