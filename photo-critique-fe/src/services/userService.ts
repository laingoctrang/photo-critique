import type { User } from "../types";
import { api } from "./api";
import type { ApiResponse } from "./types";
import type { PostListItemResponse } from "./postService";

export interface UpdateProfileData {
  bio?: string;
  fullName?: string;
  profilePicture?: string;
  privacySetting?: string;
  badgeId?: string;
}

export interface BadgeEarnedResponse {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  profilePicture: string;
  bio?: string;
  fullName: string;
  isOnline?: boolean;
  lastSeen?: string;
  privacySetting: string;
  xpPoints?: number;
  level?: number;
  badges?: BadgeEarnedResponse[];
  xpToNextLevel?: number;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  followStatus?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last?: boolean;
}

export interface UserListItemResponse {
  id: string;
  username: string;
  profilePicture: string;
  fullName: string;
  isOnline?: boolean;
  xpPoints?: number;
  level?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  followStatus?: string;
}

export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profilePicture: string;
  roles: string[];
  enabled: boolean;
  xpPoints: number;
  level: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<ApiResponse<UserProfileResponse>>('/users/me');
    return response.data.data;
  },

  getUserProfileByUsername: async (username: string): Promise<UserProfileResponse> => {
    const response = await api.get<ApiResponse<UserProfileResponse>>(`/users/username/${username}`);
    return response.data.data;
  },

  getUserProfileById: async (userId: string): Promise<UserProfileResponse> => {
    const response = await api.get<ApiResponse<UserProfileResponse>>(`/users/${userId}`);
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfileResponse> => {
    const response = await api.put<ApiResponse<UserProfileResponse>>('/users/me', data);
    return response.data.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/search?q=${query}`);
    return response.data;
  },

  followUser: async (userId: string): Promise<void> => {
    await api.post(`/users/follow/${userId}`);
  },

  unfollowUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/follow/${userId}`);
  },

  getPostsByUserId: async (userId: string, page: number = 0, size: number = 20): Promise<PageResponse<PostListItemResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<PostListItemResponse>>>(`/posts/user/${userId}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  getSavedPosts: async (page: number = 0, size: number = 20): Promise<PageResponse<PostListItemResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<PostListItemResponse>>>(`/posts/saved`, {
      params: { page, size }
    });
    return response.data.data;
  },

  getDraftPosts: async (page: number = 0, size: number = 20): Promise<PageResponse<PostListItemResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<PostListItemResponse>>>(`/posts/me/drafts`, {
      params: { page, size }
    });
    return response.data.data;
  },

  getFollowers: async (userId: string, page: number = 0, size: number = 20): Promise<PageResponse<UserListItemResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<UserListItemResponse>>>(`/users/${userId}/followers`, {
      params: { page, size }
    });
    return response.data.data;
  },

  getFollowing: async (userId: string, page: number = 0, size: number = 20): Promise<PageResponse<UserListItemResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<UserListItemResponse>>>(`/users/${userId}/following`, {
      params: { page, size }
    });
    return response.data.data;
  },

  // Admin functions
  getAllUsers: async (params: {
    search?: string;
    filters?: Record<string, string>;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    size?: number;
  }): Promise<{
    content: AdminUserResponse[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> => {
    const response = await api.get<ApiResponse<PageResponse<AdminUserResponse>>>('/admin/users', {
      params: {
        search: params.search,
        filters: params.filters,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    const data = response.data.data;
    return {
      content: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.number,
      size: data.size,
      hasNext: !data.last,
      hasPrevious: data.number > 0,
    };
  },

  getAdminUserById: async (userId: string): Promise<AdminUserResponse> => {
    const response = await api.get<ApiResponse<AdminUserResponse>>(`/admin/users/${userId}`);
    return response.data.data;
  },

  enableUser: async (userId: string): Promise<void> => {
    await api.put<ApiResponse<void>>(`/admin/users/${userId}/enable`);
  },

  disableUser: async (userId: string): Promise<void> => {
    await api.put<ApiResponse<void>>(`/admin/users/${userId}/disable`);
  },

  changeUserRole: async (userId: string, role: string): Promise<void> => {
    await api.put<ApiResponse<void>>(`/admin/users/${userId}/role`, { role });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/admin/users/${userId}`);
  },

  searchUsersForChat: async (query: string): Promise<UserListItemResponse[]> => {
    const response = await api.get<ApiResponse<UserListItemResponse[]>>(`/users/search`, {
      params: { q: query }
    });
    return response.data.data;
  },
};