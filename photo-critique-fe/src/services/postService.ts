import type { PostStatus, PrivacyType, ReactionType } from '../types/enums';
import { api } from './api';
import type { ApiResponse, ImageInfo } from './types';

interface CreatePostRequest {
    imageUrls?: ImageInfo[];
    caption?: string;
    privacy: PrivacyType;
    tags?: string[];
    status?: PostStatus;
}

export interface PostListItemResponse {
    id: string;
    user: UserPostResponse;
    caption: string;
    imageUrls: ImageInfo[];
    privacy: PrivacyType;
    status: PostStatus;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    userReaction?: ReactionType;
    isSaved: boolean;
    createdAt: string;
}

export interface UserPostResponse {
    id: string;
    username: string;
    profilePicture: string;
    fullName: string;
    isOnline: boolean;
    xpPoints: number;
    level: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isFollowedBy: boolean;
    followStatus: string;
}

export interface PostResponse {
    id: string;
    user: UserPostResponse;
    caption: string;
    imageUrls: ImageInfo[];
    privacy: PrivacyType;
    status?: PostStatus;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    userReaction?: ReactionType;
    isSaved: boolean;
    isShared: boolean;
    originalPostId: string;
    originalPostAuthor: UserPostResponse;
    createdAt: string;
    updatedAt: string;
}

export const postService = {
    createPost: async (createPostData: CreatePostRequest): Promise<PostResponse & { message: string }> => {
        const response = await api.post<ApiResponse<PostResponse>>('/posts', createPostData);
        const { data, message } = response.data;

        return {
            ...data,
            message,
        };
    },

    updatePost: async (postId: string, updateData: Partial<CreatePostRequest>): Promise<PostResponse & { message: string }> => {
        const response = await api.put<ApiResponse<PostResponse>>(`/posts/${postId}`, updateData);
        const { data, message } = response.data;

        return {
            ...data,
            message,
        };
    },

    getPostById: async (postId: string): Promise<PostResponse> => {
        const response = await api.get<ApiResponse<PostResponse>>(`/posts/${postId}`);
        return response.data.data;
    },

    getFeed: async (page: number = 0, size: number = 20): Promise<PostListItemResponse[]> => {
        const response = await api.get<ApiResponse<PostListItemResponse[]>>('/posts/feed', {
            params: { page, size }
        });
        return response.data.data;
    },

    addReaction: async (postId: string, reactionType: ReactionType | null): Promise<string> => {
        const response = await api.post(`/posts/${postId}/reaction`, { reactionType });
        return response.data.message || 'Reaction added successfully';
    },

    removeReaction: async (postId: string): Promise<string> => {
        const response = await api.delete(`/posts/${postId}/reaction`);
        return response.data.message || 'Reaction removed successfully';
    },

    savePost: async (postId: string): Promise<boolean | string> => {
        const response = await api.post(`/posts/${postId}/save`);
        return response.data.success ? true : response.data.message;
    },

    unsavePost: async (postId: string): Promise<boolean | string> => {
        const response = await api.delete(`/posts/${postId}/save`);
        return response.data.success ? true : response.data.message;
    },

    searchPostsByUserKeyword: async (keyword: string): Promise<PostListItemResponse[]> => {
        // Search for users matching the keyword, then get their posts
        // This is a frontend implementation since there's no backend endpoint
        // In a real scenario, this should be a backend endpoint
        const { userService } = await import('./userService');
        const users = await userService.searchUsers(keyword);
        
        if (users.length === 0) {
            return [];
        }
        
        // Get posts from all matching users in parallel
        const postPromises = users.map(async (user) => {
            try {
                const postsResponse = await userService.getPostsByUserId(user.id, 0, 100);
                return postsResponse.content;
            } catch (error) {
                console.error(`Error fetching posts for user ${user.id}:`, error);
                return [];
            }
        });
        
        const postArrays = await Promise.all(postPromises);
        const allPosts = postArrays.flat();
        
        // Sort by created_at descending
        return allPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    },

};