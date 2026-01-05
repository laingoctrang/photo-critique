import { api } from "./api";
import type { ApiResponse } from "./types";

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
  user: CommentUser | null;
  content: string;
  aiGeneratedImage?: string;
  originalImage?: string;
  parentCommentId?: string;
  isHelpful: boolean;
  isDelete: boolean;
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
  aiGeneratedImage?: string;
  originalImage?: string;
}

export interface CommentListResponse {
  content: CommentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type CommentSortOption = "newest" | "oldest" | "mostLiked" | "helpful";

export const commentService = {
  getComments: async (
    postId: string,
    page: number = 0,
    size: number = 10,
    sort: CommentSortOption = "newest",
    originalImage?: string
  ): Promise<CommentListResponse> => {
    const params: any = { page, size, sort };
    if (originalImage) {
      params.originalImage = originalImage;
    }
    const response = await api.get<ApiResponse<CommentListResponse>>(
      `/posts/${postId}/comments`,
      { params }
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
        originalImage: data.originalImage,
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
    const response = await api.delete<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}`
    );
    return response.data.message || "Comment deleted successfully";
  },

  likeComment: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.post<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/like`
    );
    return response.data.message || "Comment liked successfully";
  },

  unlikeComment: async (commentId: string, postId: string): Promise<string> => {
    const response = await api.delete<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/like`
    );
    return response.data.message || "Comment unliked successfully";
  },

  markAsHelpful: async (commentId: string, postId: string): Promise<string> => {
    // Backend now toggles the helpful status (mark/unmark)
    const response = await api.post<ApiResponse<void>>(
      `/posts/${postId}/comments/${commentId}/helpful`
    );
    return response.data.message || "Comment marked/unmarked as helpful";
  },

};
