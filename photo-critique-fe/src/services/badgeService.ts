import { api } from './api';
import type { ApiResponse } from './types';

export interface BadgeResponse {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  xpThreshold: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeRequest {
  name: string;
  description?: string;
  iconUrl?: string;
  xpThreshold: number;
  level: number;
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, string>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const badgeService = {
  getAll: async (): Promise<BadgeResponse[]> => {
    const response = await api.get<ApiResponse<BadgeResponse[]>>('/badges/all');
    return response.data.data;
  },

  getFiltered: async (params: FilterParams): Promise<PageResponse<BadgeResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<BadgeResponse>>>('/badges', {
      params: {
        search: params.search,
        filters: params.filters,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<BadgeResponse> => {
    const response = await api.get<ApiResponse<BadgeResponse>>(`/badges/${id}`);
    return response.data.data;
  },

  create: async (data: BadgeRequest): Promise<BadgeResponse> => {
    const response = await api.post<ApiResponse<BadgeResponse>>('/badges', data);
    return response.data.data;
  },

  update: async (id: string, data: BadgeRequest): Promise<BadgeResponse> => {
    const response = await api.put<ApiResponse<BadgeResponse>>(`/badges/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/badges/${id}`);
  },
};

