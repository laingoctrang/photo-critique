import { api } from './api';
import type { ApiResponse } from './types';
import type { ReportStatus, ReportContentType } from '../types/enums';
import type { UserPostResponse } from './postService';

export interface CreateReportRequest {
    contentType: ReportContentType;
    reportedContentId: string;
    reason: string;
}

export interface ResolveReportRequest {
    resolution: string;
    action?: string;
}

export interface ReportResponse {
    id: string;
    reporter: UserPostResponse;
    contentType: ReportContentType;
    reportedContentId: string;
    reportedUser: UserPostResponse;
    reason: string;
    status: ReportStatus;
    resolvedAt?: string;
    resolvedByUser?: UserPostResponse;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
    reportedContentPreview: string;
}

export interface GetReportsParams {
    status?: ReportStatus;
    contentType?: ReportContentType;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface ReportsPageResponse {
    content: ReportResponse[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export const reportService = {
    createReport: async (request: CreateReportRequest): Promise<ReportResponse & { message: string }> => {
        const response = await api.post<ApiResponse<ReportResponse>>('/reports', request);
        const { data, message } = response.data;
        return {
            ...data,
            message,
        };
    },

    getReports: async (params: GetReportsParams = {}): Promise<ReportsPageResponse> => {
        const { page = 0, size = 20, status, contentType, sortBy, sortDirection } = params;
        const response = await api.get<ApiResponse<ReportsPageResponse>>('/reports', {
            params: {
                page,
                size,
                ...(status && { status }),
                ...(contentType && { contentType }),
                ...(sortBy && { sortBy }),
                ...(sortDirection && { sortDirection }),
            },
        });
        return response.data.data;
    },

    getReportById: async (reportId: string): Promise<ReportResponse> => {
        const response = await api.get<ApiResponse<ReportResponse>>(`/reports/${reportId}`);
        return response.data.data;
    },

    resolveReport: async (reportId: string, request: ResolveReportRequest): Promise<ReportResponse & { message: string }> => {
        const response = await api.post<ApiResponse<ReportResponse>>(`/reports/${reportId}/resolve`, request);
        const { data, message } = response.data;
        return {
            ...data,
            message,
        };
    },

    dismissReport: async (reportId: string): Promise<ReportResponse & { message: string }> => {
        const response = await api.post<ApiResponse<ReportResponse>>(`/reports/${reportId}/dismiss`);
        const { data, message } = response.data;
        return {
            ...data,
            message,
        };
    },
};






