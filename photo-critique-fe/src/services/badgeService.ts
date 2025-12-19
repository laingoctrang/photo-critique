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

export const badgeService = {
  getAll: async (): Promise<BadgeResponse[]> => {
    const response = await api.get<ApiResponse<BadgeResponse[]>>('/badges');
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

