import { api } from './api';
import type { ApiResponse } from './types';

export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export const tagService = {
  /**
   * Get trending tags
   * @param limit Number of tags to return (default: 10)
   * @returns List of trending tags
   */
  getTrendingTags: async (limit: number = 10): Promise<TagResponse[]> => {
    const response = await api.get<ApiResponse<TagResponse[]>>(
      `/tags/trending?limit=${limit}`
    );
    return response.data.data;
  },
};

