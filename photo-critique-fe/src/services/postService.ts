import type { PrivacyType, ReactionType } from '../types/enums';
import { api } from './api';
import type { ApiResponse, ImageInfo } from './types';

interface CreatePostRequest {
    imageUrls: ImageInfo[];
    caption: string;
    privacy: PrivacyType;
    tags?: string[];
}

export interface PostListItemResponse {
    id: string;
    user: UserPostResponse;
    caption: string;
    imageUrls: ImageInfo[];
    privacy: PrivacyType;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    userReaction?: ReactionType;
    isSaved: boolean;
    createdAt: string;
}

interface UserPostResponse {
    id: string;
    username: string;
    profilePicture: string;
    fullName: string;
    isOnline?: boolean;
}

interface PostResponse {
    id: string;
    user: UserPostResponse;
    caption: string;
    imageUrls: ImageInfo[];
    privacy: PrivacyType;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    userReaction?: ReactionType;
    isSaved: boolean;
    isShared: boolean;
    originalPostId: string;
    originalPostAuthor: UserPostResponse;

}

export const postService = {
    createPost: async (createPostData: CreatePostRequest): Promise<PostResponse & { message: string }> => {
        const response = await api.post<ApiResponse<PostResponse>>('/posts', createPostData);
        const { data, message } = response.data;

        return {
            ...data,
            message,
        };
    },

    getFeed: async (): Promise<PostListItemResponse[]> => {
        const response = await api.get<ApiResponse<PostListItemResponse[]>>('/posts/getFeed');
        return response.data.data;
    },

    addReaction: async (postId: string, reactionType: ReactionType | null): Promise<string> => {
        const response = await api.post(`/posts/${postId}/reaction`, { reactionType });
        return response.data.message || 'Reaction added successfully';
    },

    removeReaction: async (postId: string): Promise<string> => {
        const response = await api.delete(`/posts/${postId}/reaction`);
        return response.data.message || 'Reaction removed successfully';
    },

    // verifyRegistration: async (verifyData: VerifyRegisterData): Promise<AuthResponse & { message: string }> => {
    //     const response = await api.post<ApiResponse<AuthResponse>>("/auth/verify-registration", verifyData);
    //     const { data, message } = response.data;

    //     return {
    //         ...data,
    //         message,
    //     };
    // },


    // forgotPassword: async (email: string): Promise<string> => {
    //     const response = await api.post<ApiResponse<void>>('/auth/forgot-password', { email });
    //     return response.data.message || 'OTP sent successfully';
    // },

    // verifyResetOtp: async (verifyOtpData: VerifyOtpData): Promise<string> => {
    //     const response = await api.post<ApiResponse<string>>('/auth/verify-reset-otp', verifyOtpData);
    //     return response.data.data; // resetToken
    // },

    // resetPassword: async (resetPasswordData: ResetPasswordData): Promise<string> => {
    //     const response = await api.post<ApiResponse<void>>('/auth/reset-password', resetPasswordData);
    //     return response.data.message || 'Password reset successfully';
    // },

    // resendOtp: async (resendOtpData: ResendOtpData): Promise<string> => {
    //     const response = await api.post<ApiResponse<void>>('/auth/resend-otp', resendOtpData);
    //     return response.data.message || 'OTP sent successfully';
    // },

    // // Helper method để get current token
    // getToken: (): string | null => {
    //     return localStorage.getItem('token');
    // },

    // // Helper method để check if user is authenticated
    // isAuthenticated: (): boolean => {
    //     return !!localStorage.getItem('token');
    // }
};