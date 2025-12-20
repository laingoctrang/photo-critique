import React, { useEffect, useState } from 'react';
import { rankingService, type UserRankingResponse, type RankingPeriod } from '../../services/rankingService';
import { useAuth } from '../../hooks/useAuth';

interface UserRankingProps {
    period: RankingPeriod;
    limit?: number;
}

const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) {
        return (
            <span className="text-3xl" style={{ color: '#FFD700' }}>
                👑
            </span>
        );
    }
    if (rank === 2) {
        return (
            <span className="text-2xl" style={{ color: '#C0C0C0' }}>
                🥈
            </span>
        );
    }
    if (rank === 3) {
        return (
            <span className="text-2xl" style={{ color: '#CD7F32' }}>
                🥉
            </span>
        );
    }
    return (
        <span className="text-xl" style={{ color: '#818CF8' }}>
            ⭐
        </span>
    );
};

export const UserRanking: React.FC<UserRankingProps> = ({ period, limit = 100 }) => {
    const [users, setUsers] = useState<UserRankingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const currentUserId = user?.id;

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await rankingService.getUserXPRanking(period, limit);
                setUsers(response.userRankings || []);
            } catch (error) {
                console.error('Failed to fetch user rankings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [period, limit]);

    const formatXP = (xp: number) => `${xp.toLocaleString()} XP`;

    const currentUserRank = users.find(u => u.userId === currentUserId);
    const otherUsers = users.filter(u => u.userId !== currentUserId);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Outstanding Photographers</h3>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Outstanding Photographers</h3>
            
            {currentUserRank && (
                <div className="mb-4 p-4 rounded-xl bg-teal-50 border-2 border-teal-200 flex items-center gap-3">
                    <span className="text-2xl font-bold text-teal-600 min-w-[3rem] text-center">
                        {currentUserRank.rank}
                    </span>
                    <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        src={currentUserRank.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserRank.username)}&background=14B8A6&color=fff&bold=true`}
                        alt={currentUserRank.username}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-800 truncate">
                            {currentUserRank.username} (You)
                        </div>
                        <div className="text-sm text-gray-600">{formatXP(currentUserRank.xpPoints)}</div>
                    </div>
                    <RankIcon rank={currentUserRank.rank} />
                </div>
            )}

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {otherUsers.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">No rankings available</div>
                ) : (
                    otherUsers.map((user) => (
                        <div
                            key={user.userId}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-md ${
                                user.rank === 1 
                                    ? 'bg-teal-50 border-2 border-teal-300 shadow-sm' 
                                    : 'bg-white border border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            <span
                                className={`text-lg font-bold min-w-[3rem] text-center ${
                                    user.rank <= 3
                                        ? user.rank === 1
                                            ? 'text-yellow-500'
                                            : user.rank === 2
                                            ? 'text-gray-500'
                                            : 'text-orange-500'
                                        : 'text-gray-600'
                                }`}
                            >
                                {user.rank}
                            </span>
                            <img
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=14B8A6&color=fff&bold=true`}
                                alt={user.username}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 truncate">
                                    {user.username}
                                </div>
                                <div className="text-xs text-gray-600">{formatXP(user.xpPoints)}</div>
                            </div>
                            <RankIcon rank={user.rank} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

