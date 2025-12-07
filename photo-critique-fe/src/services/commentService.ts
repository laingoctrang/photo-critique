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
    const response = await api.post<ApiResponse<{ imageUrl: string }>>(
      `/posts/${postId}/comments/${commentId}/generate-image`,
      { prompt, imageUrl }
    );
    return response.data.data;
  },
};
