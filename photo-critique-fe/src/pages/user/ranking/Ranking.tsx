import React, { useState } from 'react';
import type { RankingPeriod } from '../../../services';
import { PostRanking, UserRanking } from '../../../features';

type PostRankingType = 'reactions' | 'comments';

export const Ranking: React.FC = () => {
    const [period, setPeriod] = useState<RankingPeriod>('WEEK');
    const [postRankingType, setPostRankingType] = useState<PostRankingType>('reactions');

    const periods: { value: RankingPeriod; label: string }[] = [
        { value: 'WEEK', label: 'This Week' },
        { value: 'MONTH', label: 'This Month' },
        { value: 'YEAR', label: 'This Year' },
        { value: 'ALL', label: 'All Time' },
    ];

    return (
        <div className="min-h-screen">
            <div className="w-full flex flex-row gap-6 items-end justify-between mb-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking Board</h1>
                    <p className="text-gray-600 text-sm">
                        Discover the most outstanding photographers and works in the community.
                    </p>
                </div>

                {/* Period Tabs */}
                <div className="p-2 bg-white rounded-full border border-gray-200 inline-flex gap-2">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-4 py-2 font-medium text-sm rounded-full transition-all ${
                                period === p.value
                                    ? 'bg-[#15B8A6] text-white'
                                    : 'bg-transparent text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full">
                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column - User Rankings */}
                    <div className="lg:sticky lg:top-4 lg:self-start lg:col-span-2 h-[calc(95vh)]">
                        <UserRanking period={period} />
                    </div>

                    {/* Right Column - Post Rankings */}
                    <div className="lg:col-span-3">
                        <PostRanking
                            type={postRankingType}
                            period={period}
                            limit={12}
                            onTypeChange={setPostRankingType}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


