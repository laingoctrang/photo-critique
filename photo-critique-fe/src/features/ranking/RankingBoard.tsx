import React, { useState } from 'react';
import { UserRanking } from './UserRanking';
import { PostRanking } from './PostRanking';
import type { RankingPeriod } from '../../services/rankingService';

type PostRankingType = 'reactions' | 'comments';

export const RankingBoard: React.FC = () => {
    const [period, setPeriod] = useState<RankingPeriod>('WEEK');
    const [postRankingType, setPostRankingType] = useState<PostRankingType>('reactions');

    const periods: { value: RankingPeriod; label: string }[] = [
        { value: 'WEEK', label: 'This Week' },
        { value: 'MONTH', label: 'This Month' },
        { value: 'YEAR', label: 'This Year' },
        { value: 'ALL', label: 'All Time' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Ranking Board</h1>
                    <p className="text-gray-600 text-lg">
                        Discover the most outstanding photographers and works in the community.
                    </p>
                </div>

                {/* Period Tabs */}
                <div className="mb-6 flex gap-2 border-b-2 border-gray-200">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-6 py-3 font-semibold text-base transition-all relative ${
                                period === p.value
                                    ? 'text-teal-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {p.label}
                            {period === p.value && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Post Ranking Type Tabs */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={() => setPostRankingType('reactions')}
                        className={`px-5 py-2 rounded-lg font-medium transition-all shadow-sm ${
                            postRankingType === 'reactions'
                                ? 'bg-teal-600 text-white shadow-teal-200'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        Most Reactions
                    </button>
                    <button
                        onClick={() => setPostRankingType('comments')}
                        className={`px-5 py-2 rounded-lg font-medium transition-all shadow-sm ${
                            postRankingType === 'comments'
                                ? 'bg-teal-600 text-white shadow-teal-200'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        Most Comments
                    </button>
                </div>

                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - User Rankings */}
                    <div className="lg:sticky lg:top-4 lg:self-start">
                        <UserRanking period={period} limit={100} />
                    </div>

                    {/* Right Column - Post Rankings */}
                    <div>
                        <PostRanking type={postRankingType} period={period} limit={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

