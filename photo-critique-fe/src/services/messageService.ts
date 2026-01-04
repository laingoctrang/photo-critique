import { api } from "./api";
import type { ApiResponse } from "./types";
import type { PageResponse } from "./userService";

export interface ConversationResponse {
  id: string;
  otherUser: {
    id: string;
    username: string;
    fullName: string;
    profilePicture: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    sentAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  imageUrls: string[] | null;
  messageType: "TEXT" | "IMAGE" | "AI_IMAGE";
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  receiverId: string;
  content?: string;
  imageUrls?: string[];
}

export const messageService = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    const response = await api.get<ApiResponse<ConversationResponse[]>>("/messages/conversations");
    return response.data.data;
  },

  getOrCreateConversation: async (otherUserId: string): Promise<ConversationResponse> => {
    const response = await api.get<ApiResponse<ConversationResponse>>(`/messages/conversations/${otherUserId}`);
    return response.data.data;
  },

  getMessages: async (conversationId: string, page: number = 0, size: number = 50): Promise<PageResponse<MessageResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<MessageResponse>>>(`/messages/conversations/${conversationId}/messages`, {
      params: { page, size }
    });
    return response.data.data;
  },

  sendMessage: async (request: SendMessageRequest): Promise<MessageResponse> => {
    const response = await api.post<ApiResponse<MessageResponse>>("/messages/send", request);
    return response.data.data;
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await api.put(`/messages/conversations/${conversationId}/read`);
  },

  searchUsersForChat: async (query: string, page: number = 0, size: number = 20): Promise<PageResponse<any>> => {
    const response = await api.get<ApiResponse<PageResponse<any>>>("/messages/users/search", {
      params: { query, page, size }
    });
    return response.data.data;
  },
};

