import { api } from "./api";
import type { ApiResponse } from "./types";

export interface OverviewStatisticsResponse {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalAiToolUsage: number;
  thisMonthPosts: number;
  thisMonthComments: number;
  thisMonthAiToolUsage: number;
  lastMonthPosts: number;
  lastMonthComments: number;
  lastMonthAiToolUsage: number;
  fetchedAt: string;
}

export interface ChartDataPoint {
  label: string;
  count: number;
}

export interface ActivityChartResponse {
  posts: ChartDataPoint[];
  comments: ChartDataPoint[];
  aiToolUsage: ChartDataPoint[];
}

export interface UserEngagementResponse {
  activeUsers: number;
  inactiveUsers: number;
  activePercentage: number;
}

export type ChartPeriod = "WEEK" | "MONTH" | "YEAR";

export const adminStatisticsService = {
  getOverview: async (): Promise<OverviewStatisticsResponse> => {
    const response = await api.get<ApiResponse<OverviewStatisticsResponse>>(
      "/admin/statistics/overview"
    );
    return response.data.data;
  },

  getActivityChart: async (period: ChartPeriod = "MONTH"): Promise<ActivityChartResponse> => {
    const response = await api.get<ApiResponse<ActivityChartResponse>>(
      "/admin/statistics/activity-chart",
      { params: { period } }
    );
    return response.data.data;
  },

  getUserEngagement: async (): Promise<UserEngagementResponse> => {
    const response = await api.get<ApiResponse<UserEngagementResponse>>(
      "/admin/statistics/user-engagement"
    );
    return response.data.data;
  },
};

