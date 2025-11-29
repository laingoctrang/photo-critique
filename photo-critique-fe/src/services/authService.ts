import { OtpRequestType, type User } from '../types';
import { api } from './api';
import type { ApiResponse } from './types';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    fullName: string;
    username: string;
    email: string;
    password: string;
}

interface VerifyRegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName: string;
    otp: string;
}

interface VerifyOtpRequest {
    email: string;
    otp: string;
}

interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}

interface ResendOtpRequest {
    email: string;
    otpRequestType: OtpRequestType;
}

interface AuthResponse {
    accessToken: string;
    user: User;
}

export const authService = {
    login: async (loginData: LoginRequest): Promise<AuthResponse & { message: string }> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', loginData);
        const { data, message } = response.data;

        return {
            ...data,
            message,
        };
    },

    register: async (registerData: RegisterRequest): Promise<string> => {
        const response = await api.post<ApiResponse<void>>('/auth/register', registerData);
        return response.data.message || 'Registration successful';
    },

    verifyRegistration: async (verifyData: VerifyRegisterRequest): Promise<AuthResponse & { message: string }> => {
        const response = await api.post<ApiResponse<AuthResponse>>("/auth/verify-registration", verifyData);
        const { data, message } = response.data;

        return {
            ...data,
            message,
        };
    },


    forgotPassword: async (email: string): Promise<string> => {
        const response = await api.post<ApiResponse<void>>('/auth/forgot-password', { email });
        return response.data.message || 'OTP sent successfully';
    },

    verifyResetOtp: async (verifyOtpData: VerifyOtpRequest): Promise<string> => {
        const response = await api.post<ApiResponse<string>>('/auth/verify-reset-otp', verifyOtpData);
        return response.data.data; // resetToken
    },

    resetPassword: async (resetPasswordData: ResetPasswordRequest): Promise<string> => {
        const response = await api.post<ApiResponse<void>>('/auth/reset-password', resetPasswordData);
        return response.data.message || 'Password reset successfully';
    },

    resendOtp: async (resendOtpData: ResendOtpRequest): Promise<string> => {
        const response = await api.post<ApiResponse<void>>('/auth/resend-otp', resendOtpData);
        return response.data.message || 'OTP sent successfully';
    },

    // Helper method để get current token
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    // Helper method để check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};