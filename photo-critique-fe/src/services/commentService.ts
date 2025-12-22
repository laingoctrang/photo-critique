import { api } from './api';
import axios from 'axios';
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
  originalImage?: string;
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
  aiGeneratedImage?: string;
  originalImage?: string;
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
      { 
        content: data.content, 
        parentCommentId: data.parentCommentId, 
        aiGeneratedImage: data.aiGeneratedImage,
        originalImage: data.originalImage 
      }
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
    // _commentId: string,
    prompt: string,
    imageUrl: string,
    // _postId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ imageUrl: string }> => {
    // Call external edit-image API
    const response = await axios.post<{ task_id: string; image_url?: string | null }>(
      'https://biform-relatedly-lera.ngrok-free.dev/edit-image',
      // 'https://fastapi-qwen-test.onrender.com/edit-image',
      {
        image_url: imageUrl,
        prompt: prompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    const taskId = response.data.task_id;
    if (!taskId) {
      throw new Error('Failed to generate image: No task_id in response');
    }

    // If image_url is already available, return it
    if (response.data.image_url) {
      return { imageUrl: response.data.image_url };
    }

    // Poll for progress
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await axios.get<{
            task_id: string;
            progress: number;
            image_url?: string;
          }>(`https://biform-relatedly-lera.ngrok-free.dev/progress/${taskId}`, {
          // }>(`https://fastapi-qwen-test.onrender.com/progress/${taskId}`, {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          });

          const progress = progressResponse.data.progress || 0;
          onProgress?.(progress);

          // If image_url is available, generation is complete
          if (progressResponse.data.image_url) {
            clearInterval(pollInterval);
            resolve({ imageUrl: progressResponse.data.image_url });
          }
        } catch (error: any) {
          clearInterval(pollInterval);
          reject(new Error(error.message || 'Failed to check generation progress'));
        }
      }, 1000); // Poll every 1 second

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Image generation timeout'));
      }, 5 * 60 * 1000);
    });
  },
};
