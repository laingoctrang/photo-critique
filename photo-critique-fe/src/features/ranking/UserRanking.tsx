import React, { useEffect, useState, useRef, useCallback } from 'react';
import { rankingService, type UserRankingResponse, type RankingPeriod } from '../../services/rankingService';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components';
import { formatDateShortMonthTime } from '../../utils';

interface UserRankingProps {
    period: RankingPeriod;
}

export const UserRanking: React.FC<UserRankingProps> = ({ period }) => {
    const [users, setUsers] = useState<UserRankingResponse[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<UserRankingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0); // Start from page 0
    const [hasMore, setHasMore] = useState(true);
    const [isCurrentUserVisible, setIsCurrentUserVisible] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const currentUserElementRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef<boolean>(false); // Prevent multiple simultaneous API calls
    const { user } = useAuth();
    const currentUserId = user?.id;
    const LIMIT = 20;

    const [lastRankingUserUpdated, setLastRankingUserUpdated] = useState<string>("");

    // Get current user's rank
    const fetchCurrentUserRank = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const userRank = await rankingService.getUserRankingByUserId(currentUserId, period);
            if (userRank) {
                setCurrentUserRank(userRank);
            }
        } catch (error) {
            console.error('Failed to fetch current user rank:', error);
        }
    }, [period, currentUserId]);

    // Get ranking list (excluding top 3 for podium)
    const fetchUsers = useCallback(async (page: number, append: boolean = false) => {
        // Prevent multiple simultaneous calls
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            // Fetch with page number and limit
            const response = await rankingService.getUserXPRanking(period, LIMIT, page);
            const fetchedUsers = response.userRankings || [];

            // Skip top 3 for ranking list (they're shown on podium)
            const filteredUsers = fetchedUsers.filter(u => u.rank > 3);

            if (append) {
                // Append new users
                setUsers(prev => [...prev, ...filteredUsers]);
            } else {
                setUsers(filteredUsers);
            }

            // Check if there are more users to load
            // Page * LIMIT is the offset of next page
            setHasMore((page + 1) * LIMIT < response.totalCount);
        } catch (error) {
            console.error('Failed to fetch user rankings:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [period]);

    // Check if current user is visible in scroll area
    const checkCurrentUserVisibility = useCallback(() => {
        if (!scrollContainerRef.current || !currentUserElementRef.current || !currentUserRank) {
            setIsCurrentUserVisible(false);
            return;
        }

        const container = scrollContainerRef.current;
        const currentUserElement = currentUserElementRef.current;

        const containerRect = container.getBoundingClientRect();
        const elementRect = currentUserElement.getBoundingClientRect();

        const isVisible =
            elementRect.top >= containerRect.top &&
            elementRect.bottom <= containerRect.bottom;

        setIsCurrentUserVisible(isVisible);
    }, [currentUserRank]);

    useEffect(() => {
        const loadData = async () => {
            setCurrentPage(0); // Reset to page 0
            setUsers([]);
            setCurrentUserRank(null);
            setTop3Users([]);
            setHasMore(true);

            // Fetch top 3 for podium (page 0, limit 3)
            try {
                const response = await rankingService.getUserXPRanking(period, 3, 0);
                setLastRankingUserUpdated(formatDateShortMonthTime(response.snapshotDate));
                setTop3Users(response.userRankings || []);
            } catch (error) {
                console.error('Failed to fetch top 3 users:', error);
            }

            // First: Get current user's rank
            await fetchCurrentUserRank();

            // Then: Get ranking list starting from page 0 (will filter out top 3)
            await fetchUsers(0, false);
        };

        loadData();
    }, [period, fetchCurrentUserRank, fetchUsers]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            // Check current user visibility
            checkCurrentUserVisibility();

            // Load more when scrolled to 90% of the container
            if (scrollPercentage > 0.9 && !loadingMore && hasMore && !loading) {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                fetchUsers(nextPage, true);
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        // Also check on initial render and after data loads
        setTimeout(checkCurrentUserVisibility, 100);

        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [currentPage, loadingMore, hasMore, loading, fetchUsers, checkCurrentUserVisibility]);

    // Re-check visibility when users list changes
    useEffect(() => {
        setTimeout(checkCurrentUserVisibility, 100);
    }, [users, checkCurrentUserVisibility]);

    const formatXP = (xp: number) => `${xp.toLocaleString()} XP`;
    const [top3Users, setTop3Users] = useState<UserRankingResponse[]>([]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Top Contributors</h3>
                
                <div className="flex items-center justify-center py-12">
                    <Loading variant="inline" text="Loading rankings..." />
                </div>
            </div>
        );
    }

    const user1 = top3Users.find(u => u.rank === 1);
    const user2 = top3Users.find(u => u.rank === 2);
    const user3 = top3Users.find(u => u.rank === 3);

    return (
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 flex flex-col h-full">
            <div className="flex flex-col">
                <h3 className="text-xl font-bold mb-1 text-gray-800">Top Contributors</h3>
                <p className="text-gray-600 text-xs">Last updated: {lastRankingUserUpdated}</p>
                </div>

            {/* Podium Layout for Top 3 */}
            {top3Users.length > 0 && (
                <div className="relative grid grid-cols-3 gap-4 items-end mb-4">
                    {/* 2nd Place (Left) */}
                    {user2 && (
                        <div className="flex flex-col">
                            <div className="flex flex-col items-center relative mb-2">
                                <div
                                    className="w-18 h-18 rounded-full border-4 border-blue-400 overflow-hidden bg-gray-100 shadow-lg"
                                    style={{ borderColor: '#60A5FA' }}
                                >
                                    <img
                                        className="w-full h-full object-cover border-2 rounded-full border-white"
                                        src={user2.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user2.username)}&background=60A5FA&color=fff&bold=true`}
                                        alt={user2.username}
                                    />
                                </div>
                                <div
                                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                                    style={{ backgroundColor: '#60A5FA' }}
                                >
                                    2
                                </div>
                            </div>
                            <div className="text-center mt-1">
                                <div className="font-semibold text-gray-800 text-sm truncate max-w-full">
                                    {user2.username}
                                </div>
                                <div className="text-xs text-gray-600">
                                    ⭐ {formatXP(user2.xpPoints)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 1st Place (Center - Largest) */}
                    {user1 && (
                        <div className="flex flex-col self-start">
                            <div className="relative flex flex-col items-center mb-2">
                                <div className="mb-1">
                                    <span className="text-2xl">👑</span>
                                </div>
                                <div
                                    className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-100 shadow-xl"
                                    style={{ borderColor: '#FBBF24' }}
                                >
                                    <img
                                        className="w-full h-full object-cover border-2 rounded-full border-white"
                                        src={user1.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user1.username)}&background=FBBF24&color=fff&bold=true`}
                                        alt={user1.username}
                                    />
                                </div>
                                <div
                                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                                    style={{ backgroundColor: '#FBBF24' }}
                                >
                                    1
                                </div>
                            </div>
                            <div className="text-center mt-1">
                                <div className="font-bold text-gray-800 text-sm truncate max-w-full">
                                    {user1.username}
                                </div>
                                <div className="text-xs text-gray-600">
                                    ⭐ {formatXP(user1.xpPoints)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place (Right) */}
                    {user3 && (
                        <div className="flex flex-col">
                            <div className="flex flex-col items-center relative mb-2">
                                <div
                                    className="w-18 h-18 rounded-full border-4 border-purple-400 overflow-hidden bg-gray-100 shadow-lg"
                                    style={{ borderColor: '#A78BFA' }}
                                >
                                    <img
                                        className="w-full h-full object-cover border-2 rounded-full border-white"
                                        src={user3.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user3.username)}&background=A78BFA&color=fff&bold=true`}
                                        alt={user3.username}
                                    />
                                </div>
                                <div
                                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: '#A78BFA' }}
                                >
                                    3
                                </div>
                            </div>
                            <div className="text-center mt-1">
                                <div className="font-semibold text-gray-800 text-sm truncate max-w-full">
                                    {user3.username}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    ⭐ {formatXP(user3.xpPoints)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable Ranking List (Rank 4+) */}
            <div className="flex-1 flex flex-col min-h-0">
                <div
                    ref={scrollContainerRef}
                    className="flex-1 space-y-2 overflow-y-auto px-4 hidden-scrollbar"
                >
                    {users.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">No more rankings available</div>
                    ) : (
                        <>
                            {users.map((user) => (
                                <div
                                    key={user.userId}
                                    ref={user.userId === currentUserId ? currentUserElementRef : null}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:bg-[#15B8A6]/10 hover:shadow-md hover:shadow-[#15B8A6]/20 hover:scale-105 transition-all"
                                >
                                    <span className="text-lg font-bold text-gray-600 min-w-[3rem] text-center">
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
                                            {user.userId === currentUserId && ' (You)'}
                                        </div>
                                        <div className="text-xs text-gray-600">{formatXP(user.xpPoints)}</div>
                                    </div>
                                    <span className="text-xl" style={{ color: '#818CF8' }}>⭐</span>
                                </div>
                            ))}
                            {loadingMore && (
                                <Loading variant="inline" text="Loading more rankings..." />
                            )}
                        </>
                    )}
                </div>

                {/* Sticky Current User Ranking at Bottom (only if not visible in scroll area and not in top 3) */}
                {currentUserRank && !isCurrentUserVisible && currentUserRank.rank > 3 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                        <div className="px-4 py-3 rounded-3xl bg-[#15B8A6]/10 border-2 border-[#15B8A6] flex items-center gap-3">
                            <span className="text-2xl font-bold text-[#15B8A6] min-w-[3rem] text-center">
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
                            <span className="text-xl" style={{ color: '#818CF8' }}>⭐</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
