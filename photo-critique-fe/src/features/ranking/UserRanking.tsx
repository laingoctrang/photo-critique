import React, { useEffect, useState, useRef, useCallback } from 'react';
import { rankingService, type UserRankingResponse, type RankingPeriod } from '../../services/rankingService';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components';

interface UserRankingProps {
    period: RankingPeriod;
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

export const UserRanking: React.FC<UserRankingProps> = ({ period }) => {
    const [users, setUsers] = useState<UserRankingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentLimit, setCurrentLimit] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const currentUserId = user?.id;

    const fetchUsers = useCallback(async (limit: number, append: boolean = false) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        
        try {
            const response = await rankingService.getUserXPRanking(period, limit);
            const fetchedUsers = response.userRankings || [];
            
            if (append) {
                // Append only new users (skip already loaded ones)
                setUsers(prev => {
                    const existingUserIds = new Set(prev.map(u => u.userId));
                    const newUsers = fetchedUsers.filter(u => !existingUserIds.has(u.userId));
                    
                    // Check if we've loaded all available users
                    if (newUsers.length === 0 || fetchedUsers.length < limit) {
                        setHasMore(false);
                    }
                    
                    return [...prev, ...newUsers];
                });
            } else {
                setUsers(fetchedUsers);
                setHasMore(fetchedUsers.length === limit);
            }
        } catch (error) {
            console.error('Failed to fetch user rankings:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [period]);

    useEffect(() => {
        setCurrentLimit(20);
        setUsers([]);
        setHasMore(true);
        fetchUsers(20, false);
    }, [period, fetchUsers]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            // Load more when scrolled to 90% of the container
            if (scrollPercentage > 0.9 && !loadingMore && hasMore && !loading) {
                const newLimit = currentLimit + 20;
                setCurrentLimit(newLimit);
                fetchUsers(newLimit, true);
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [currentLimit, loadingMore, hasMore, loading, fetchUsers]);

    const formatXP = (xp: number) => `${xp.toLocaleString()} XP`;

    const currentUserRank = users.find(u => u.userId === currentUserId);
    const otherUsers = users.filter(u => u.userId !== currentUserId);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Outstanding Photographers</h3>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15B8A6]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Outstanding Photographers</h3>
            
            {currentUserRank && (
                <div className="mb-4 p-4 rounded-xl bg-[#15B8A6]/10 border-2 border-[#15B8A6] flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#15B8A6] min-w-[3rem] text-center">
                        {currentUserRank.rank}
                    </span>
                    <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        src={currentUserRank.profilePicture ?? ''}
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

            <div 
                ref={scrollContainerRef}
                className="space-y-2 max-h-[600px] hidden-scrollbar overflow-y-auto pr-2"
            >
                {otherUsers.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">No rankings available</div>
                ) : (
                    <>
                        {otherUsers.map((user) => (
                            <div
                                key={user.userId}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-md ${
                                    user.rank === 1 
                                        ? 'bg-[#15B8A6]/10 border-2 border-[#15B8A6] shadow-sm' 
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
                        ))}
                        {loadingMore && (
                            <Loading variant="inline" text="Loading more rankings..." />
                        )}
                        {!hasMore && otherUsers.length > 0 && (
                            <div className="py-4 text-center text-sm text-gray-500">
                                No more rankings to load
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

