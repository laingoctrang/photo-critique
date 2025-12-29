import { api } from './api';
import type { ApiResponse } from './types';

export type RankingPeriod = 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';
export type RankingType = 'USER_XP' | 'POST_REACTIONS' | 'POST_COMMENTS';

export interface UserRankingResponse {
    userId: string;
    username: string;
    profilePicture?: string;
    xpPoints: number;
    level: number;
    rank: number;
}

export interface PostRankingResponse {
    postId: string;
    userId: string;
    username: string;
    caption?: string;
    imageUrls: string[];
    reactionsCount: number;
    commentsCount: number;
    rank: number;
}

export interface RankingResponse {
    type: RankingType;
    period: RankingPeriod;
    snapshotDate: string;
    userRankings?: UserRankingResponse[];
    postRankings?: PostRankingResponse[];
    totalCount: number;
}

export const rankingService = {
    getUserXPRanking: async (period: RankingPeriod = 'WEEK', limit?: number): Promise<RankingResponse> => {
        const response = await api.get<ApiResponse<RankingResponse>>('/rankings/users/xp', {
            params: { period, limit }
        });
        return response.data.data;
    },

    getPostReactionsRanking: async (period: RankingPeriod = 'WEEK', limit?: number): Promise<RankingResponse> => {
        const response = await api.get<ApiResponse<RankingResponse>>('/rankings/posts/reactions', {
            params: { period, limit }
        });
        return response.data.data;
    },

    getPostCommentsRanking: async (period: RankingPeriod = 'WEEK', limit?: number): Promise<RankingResponse> => {
        const response = await api.get<ApiResponse<RankingResponse>>('/rankings/posts/comments', {
            params: { period, limit }
        });
        return response.data.data;
    },

    refreshRanking: async (type: RankingType, period: RankingPeriod): Promise<void> => {
        await api.post('/rankings/refresh', null, {
            params: { type, period }
        });
    },
};

