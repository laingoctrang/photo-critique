import { api } from './api';
import type { ApiResponse } from './types';

export interface XPConfigResponse {
  id: string;
  eventType: string;
  name: string;
  points: number;
  description?: string;
  category?: string;
  status?: XPConfigStatus;
  isActive?: boolean; // Deprecated, use status instead
  createdAt: string;
  updatedAt: string;
}

export interface XPConfigRequest {
  eventType?: string;
  name: string;
  points: number;
  description?: string;
  category?: string;
  status?: "PENDING_DEVELOPMENT" | "IN_DEVELOPMENT" | "PENDING_APPROVAL" | "ACTIVE";
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

export const xpConfigService = {
  getAll: async (): Promise<XPConfigResponse[]> => {
    const response = await api.get<ApiResponse<XPConfigResponse[]>>('/xp-configs/all');
    return response.data.data;
  },

  getFiltered: async (params: FilterParams): Promise<PageResponse<XPConfigResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<XPConfigResponse>>>('/xp-configs', {
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

  getByEventType: async (eventType: string): Promise<XPConfigResponse> => {
    const response = await api.get<ApiResponse<XPConfigResponse>>(`/xp-configs/${eventType}`);
    return response.data.data;
  },

  createOrUpdate: async (data: XPConfigRequest): Promise<XPConfigResponse> => {
    const response = await api.post<ApiResponse<XPConfigResponse>>('/xp-configs', data);
    return response.data.data;
  },

  updatePoints: async (eventType: string, points: number): Promise<XPConfigResponse> => {
    const response = await api.put<ApiResponse<XPConfigResponse>>(`/xp-configs/${eventType}/points`, points);
    return response.data.data;
  },

  delete: async (eventType: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/xp-configs/${eventType}`);
  },
};

