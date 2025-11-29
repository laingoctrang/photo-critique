import type { ReactionType } from "../types/enums";

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  success: boolean;
  data: T;
  path?: string;
  errorCode?: string;
  fieldErrors?: Record<string, string>;
  globalErrors?: string[];
}

export interface ImageInfo {
  url: string;
  name: string;
  size: number;
  contentType: string;
}

export interface ReactionInfo {
  userId: string;
  name: string;
  size: number;
  reactionType: ReactionType;
  createdAt: string
}