import type { User } from "../types";
import { api } from "./api";


export interface UpdateProfileData {
  name?: string;
  avatar?: string;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/search?q=${query}`);
    return response.data;
  },
};