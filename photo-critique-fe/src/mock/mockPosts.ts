import type { PostListItemResponse } from "../services/postService";
import { PrivacyType, ReactionType } from "../types/enums";

export const mockPosts: PostListItemResponse[] = Array.from({ length: 20 }).map((_, i) => {
  const randomImageCount = Math.floor(Math.random() * 4) + 1; // 1–4 images
  const imageUrls = Array.from({ length: randomImageCount }).map((_, j) => ({
    url: `https://picsum.photos/seed/${i}-${j}/800/600`,
    name: `image_${i}_${j}.jpg`,
    size: Math.floor(Math.random() * 500000) + 100000, // 100kb–600kb
    contentType: "image/jpeg",
  }));

  const privacyValues = Object.values(PrivacyType);
  const reactionValues = Object.values(ReactionType);

  return {
    id: `post-${i}`,
    user: {
      id: `user-${i}`,
      username: `user${i}`,
      profilePicture: `https://i.pravatar.cc/150?img=${i + 1}`,
      fullName: `User Fullname ${i}`,
      isOnline: Math.random() > 0.5,
    },
    caption: `This is a mock caption for post number ${i}. Enjoy the mock data!`,
    imageUrls,
    privacy: privacyValues[Math.floor(Math.random() * privacyValues.length)],
    likesCount: Math.floor(Math.random() * 500),
    commentsCount: Math.floor(Math.random() * 100),
    sharesCount: Math.floor(Math.random() * 20),
    isLiked: Math.random() > 0.5,
    userReaction:
      Math.random() > 0.5
        ? reactionValues[Math.floor(Math.random() * reactionValues.length)]
        : undefined,
    isSaved: Math.random() > 0.7,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  };
});
