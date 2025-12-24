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

};