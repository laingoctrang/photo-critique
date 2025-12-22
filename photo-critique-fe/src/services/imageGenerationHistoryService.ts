import { api } from "./api";
import type { ApiResponse } from "./types";
import type { PageResponse } from "./userService";

export interface CreateImageGenerationHistoryRequest {
  prompt: string;
  inputImageUrl: string;
  outImageUrl: string;
}

export interface ImageGenerationHistoryResponse {
  id: string;
  userId: string;
  prompt: string;
  inputImageUrl: string;
  outImageUrl: string;
  createdAt: string;
}

export const imageGenerationHistoryService = {
  create: async (request: CreateImageGenerationHistoryRequest): Promise<ImageGenerationHistoryResponse> => {
    const response = await api.post<ApiResponse<ImageGenerationHistoryResponse>>(
      "/image-generation-history",
      request
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ImageGenerationHistoryResponse> => {
    const response = await api.get<ApiResponse<ImageGenerationHistoryResponse>>(
      `/image-generation-history/${id}`
    );
    return response.data.data;
  },

  getMyHistory: async (page: number = 0, size: number = 10): Promise<PageResponse<ImageGenerationHistoryResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<ImageGenerationHistoryResponse>>>(
      "/image-generation-history/me",
      {
        params: { page, size }
      }
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/image-generation-history/${id}`);
  },
};

