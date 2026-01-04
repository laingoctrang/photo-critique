import { api } from "./api";
import type { ApiResponse } from "./types";

export interface OverviewStatistics {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newPostsThisMonth: number;
  averagePostsPerUser: number;
}

export interface TimeSeriesData {
  period: string;
  count: number;
  label: string;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface PrivacyCount {
  privacy: string;
  count: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface ActivityStatistics {
  postsToday: number;
  postsThisWeek: number;
  postsThisMonth: number;
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  commentsToday: number;
  reactionsToday: number;
}

export interface StatisticsResponse {
  overview: OverviewStatistics;
  userGrowth: TimeSeriesData[];
  postGrowth: TimeSeriesData[];
  postStatusCounts: StatusCount[];
  postPrivacyCounts: PrivacyCount[];
  userRoleCounts: RoleCount[];
  activity: ActivityStatistics;
}

export type StatisticsPeriod = "WEEK" | "MONTH" | "QUARTER" | "YEAR";

export const statisticsService = {
  getStatistics: async (period: StatisticsPeriod = "YEAR"): Promise<StatisticsResponse> => {
    const response = await api.get<ApiResponse<StatisticsResponse>>(
      "/admin/statistics",
      {
        params: { period }
      }
    );
    return response.data.data;
  },
};

