import { api } from './api';
import type { ApiResponse } from './types';

export interface XPConfigResponse {
  id: string;
  eventType: string;
  name: string;
  points: number;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface XPConfigRequest {
  eventType: string;
  name: string;
  points: number;
  description?: string;
  category?: string;
}

export const xpConfigService = {
  getAll: async (): Promise<XPConfigResponse[]> => {
    const response = await api.get<ApiResponse<XPConfigResponse[]>>('/xp-configs');
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

