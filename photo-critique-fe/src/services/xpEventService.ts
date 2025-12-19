import { api } from './api';
import type { ApiResponse } from './types';

export interface XPEventResponse {
  id: string;
  eventType: string;
  points: number;
  relatedPostId?: string;
  relatedCommentId?: string;
  createdAt: string;
}

export interface XPEventsPageResponse {
  content: XPEventResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const xpEventService = {
  /**
   * Get recent XP events for current user
   * @param limit - Number of recent events to retrieve (default: 10)
   */
  getRecent: async (limit: number = 10): Promise<XPEventResponse[]> => {
    const response = await api.get<ApiResponse<XPEventResponse[]>>(
      `/xp-events/recent?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Get all XP events for current user with pagination
   * @param page - Page number (0-indexed, default: 0)
   * @param size - Page size (default: 20)
   */
  getAll: async (
    page: number = 0,
    size: number = 20
  ): Promise<XPEventsPageResponse> => {
    const response = await api.get<ApiResponse<XPEventsPageResponse>>(
      `/xp-events?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  /**
   * Get recent XP events for a specific user
   * @param userId - User ID
   * @param limit - Number of recent events to retrieve (default: 10)
   */
  getUserRecent: async (
    userId: string,
    limit: number = 10
  ): Promise<XPEventResponse[]> => {
    const response = await api.get<ApiResponse<XPEventResponse[]>>(
      `/xp-events/user/${userId}?limit=${limit}`
    );
    return response.data.data;
  },
};

