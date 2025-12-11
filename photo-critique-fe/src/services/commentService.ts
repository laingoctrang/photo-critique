import { api } from './api';
import type { ApiResponse } from './types';

export interface CommentUser {
  id: string;
  username: string;
  profilePicture: string;
  fullName: string;
  isOnline?: boolean;
}

export interface CommentResponse {
  id: string;
  postId: string;
  user: CommentUser;
  content: string;
  aiGeneratedImage?: string;
  parentCommentId?: string;
  isHelpful: boolean;
  likesCount: number;
  isLiked: boolean;
  replies?: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string;
  selectedImageUrl?: string; // URL of selected image for AI generation
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentListResponse {
  content: CommentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type CommentSortOption = 'newest' | 'oldest' | 'mostLiked' | 'helpful';

export const commentService = {
  getComments: async (
    postId: string,
    page: number = 0,
    size: number = 10,
    sort: CommentSortOption = 'newest'
  ): Promise<CommentListResponse> => {
    const response = await api.get<ApiResponse<CommentListResponse>>(
      `/posts/${postId}/comments`,
      {
        params: { page, size, sort },
      }
    );
    return response.data.data;
  },

  createComment: async (
    data: CreateCommentRequest
  ): Promise<CommentResponse> => {
    const response = await api.post<ApiResponse<CommentResponse>>(
      `/posts/${data.postId}/comments`,
      { content: data.content, parentCommentId: data.parentCommentId, selectedImageUrl: data.selectedImageUrl }
    );
    return response.data.data;
  },

  updateComment: async (
    commentId: string,
    data: UpdateCommentRequest,
    postId: string
  ): Promise<CommentResponse> => {
    const response = await api.put<ApiResponse<CommentResponse>>(
      `/posts/${postId}/comments/${commentId}`,
      data
    );
    return response.data.data;
  },

  deleteComment: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.delete<ApiResponse<void>>(`/posts/${postId}/comments/${commentId}`);
    return response.data.message || 'Comment deleted successfully';
  },

  likeComment: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.post<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/like`
    );
    return response.data.message || 'Comment liked successfully';
  },

  unlikeComment: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.delete<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/like`
    );
    return response.data.message || 'Comment unliked successfully';
  },

  markAsHelpful: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.post<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/helpful`
    );
    return response.data.message || 'Comment marked as helpful';
  },

  unmarkAsHelpful: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.delete<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/helpful`
    );
    return response.data.message || 'Comment unmarked as helpful';
  },

  generateImage: async (
    commentId: string,
    prompt: string,
    imageUrl: string,
    postId: string
  ): Promise<{ imageUrl: string }> => {
    // Fake API implementation - simulate image generation with delay
    // Replace this with real API call when backend is ready
    const USE_FAKE_API = import.meta.env.VITE_USE_FAKE_GENERATE_API === 'true' || 
                         !import.meta.env.VITE_APP_BASE_URL;
    
    if (USE_FAKE_API) {
      // Simulate API delay (2-4 seconds)
      const delay = 2000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Generate a fake image URL using a placeholder service
      // Using picsum.photos for demo purposes
      const width = 800;
      const height = 600;
      const seed = Date.now() + Math.random();
      const fakeImageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      
      return { imageUrl: fakeImageUrl };
    }
    
    // Real API call
    const response = await api.post<ApiResponse<{ imageUrl: string }>>(
      `/posts/${postId}/comments/${commentId}/generate-image`,
      { prompt, imageUrl }
    );
    return response.data.data;
  },
};
