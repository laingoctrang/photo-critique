import { api } from './api';
import type { ApiResponse } from './types';

export const oAuthService = {

  getAuthorizationUrl: async (provider: 'google' | 'facebook'): Promise<string> => {
    const response = await api.get<ApiResponse<{authorizationUrl: string}>>(
      `/oauth/authorize/${provider}`
    );
    return response.data.data.authorizationUrl;
  },

  redirectToProvider: async (provider: 'google' | 'facebook'): Promise<void> => {
    const authorizationUrl = await oAuthService.getAuthorizationUrl(provider);
    window.location.href = authorizationUrl; // redirect to provider
  },
};

