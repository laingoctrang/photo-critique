import { api } from './api';
import type { ApiResponse, ImageInfo } from './types';

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  imageInfo?: ImageInfo;
}

export const uploadService = {
  uploadFiles: async (
    files: File[],
    onProgress?: (file: File, progress: number) => void,
    purpose: 'post' | 'chat' = 'post'
  ): Promise<ImageInfo[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('purpose', purpose);

    const response = await api.post<ApiResponse<ImageInfo[]>>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // For simplicity, we'll use the first file for progress
            // In a real implementation, you'd track progress per file
            if (files.length > 0) {
              onProgress(files[0], progress);
            }
          }
        },
      }
    );

    return response.data.data;
  },

  uploadSingleFile: async (
    file: File,
    onProgress?: (progress: number) => void,
    purpose: 'post' | 'chat' = 'post'
  ): Promise<ImageInfo> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);

    const response = await api.post<ApiResponse<ImageInfo>>(
      '/files/upload/single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    return response.data.data;
  },

  deleteFile: async (publicId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>('/files/delete', {
      params: { publicId },
    });
  },
};

