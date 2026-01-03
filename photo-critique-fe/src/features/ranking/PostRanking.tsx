import React, { useEffect, useState, useRef, useCallback } from 'react';
import { rankingService, type PostRankingResponse, type RankingPeriod } from '../../services/rankingService';
import { PostDetailModal } from '../post/PostDetailModal';
import { Button, Loading } from '../../components';
import { formatDateShortMonthTime } from '../../utils';

interface PostRankingProps {
    type: 'reactions' | 'comments';
    period: RankingPeriod;
    limit?: number;
    onTypeChange?: (type: 'reactions' | 'comments') => void;
}

export const PostRanking: React.FC<PostRankingProps> = ({ type, period, limit = 12, onTypeChange }) => {
    const [posts, setPosts] = useState<PostRankingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef<boolean>(false);
    const PAGE_SIZE = limit;
    const [lastRankingPostUpdated, setLastRankingPostUpdated] = useState<string>("");

    const fetchPosts = useCallback(async (page: number, append: boolean = false) => {
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
            const response =
                type === 'reactions'
                    ? await rankingService.getPostReactionsRanking(period, PAGE_SIZE, page)
                    : await rankingService.getPostCommentsRanking(period, PAGE_SIZE, page);

            setLastRankingPostUpdated(formatDateShortMonthTime(response.snapshotDate));
            const fetchedPosts = response.postRankings || [];

            if (append) {
                // Append new posts
                setPosts(prev => [...prev, ...fetchedPosts]);
            } else {
                setPosts(fetchedPosts);
            }

            // Check if there are more posts to load
            setHasMore((page + 1) * PAGE_SIZE < response.totalCount);
        } catch (error) {
            console.error(`Failed to fetch ${type} rankings:`, error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [type, period, PAGE_SIZE]);

    useEffect(() => {
        const loadData = async () => {
            setCurrentPage(0);
            setPosts([]);
            setHasMore(true);
            await fetchPosts(0, false);
        };

        loadData();
    }, [type, period, fetchPosts]);

    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Featured Works</h3>
                    {onTypeChange && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onTypeChange('reactions')}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${type === 'reactions'
                                        ? 'bg-[#15B8A6] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Most Reactions
                            </button>
                            <button
                                onClick={() => onTypeChange('comments')}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${type === 'comments'
                                        ? 'bg-[#15B8A6] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Most Comments
                            </button>
                        </div>
                    )}
                </div>
                <Loading variant="inline" text="Loading rankings..." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800">Featured Works</h3>
                    <p className="text-gray-500 text-xs font-light">Last updated: {lastRankingPostUpdated}</p>
                </div>
                {onTypeChange && (
                    <div className="flex gap-2">
                        <Button variant={type === 'reactions' ? 'primary' : 'secondary'} size="small" onClick={() => onTypeChange('reactions')}>
                            Most Reactions
                        </Button>
                        <Button variant={type === 'comments' ? 'primary' : 'secondary'} size="small" onClick={() => onTypeChange('comments')}>
                            Most Comments
                        </Button>
                    </div>
                )}
            </div>

            <div
                ref={scrollContainerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh)] overflow-y-auto pb-2 pr-1"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    const { scrollTop, scrollHeight, clientHeight } = target;
                    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

                    // Load more when scrolled to 90% of the container
                    if (scrollPercentage > 0.9 && !loadingMore && hasMore && !loading && !isFetchingRef.current) {
                        const nextPage = currentPage + 1;
                        setCurrentPage(nextPage);
                        fetchPosts(nextPage, true);
                    }
                }}
            >
                {posts.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-gray-500">No posts available</div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.postId}
                            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                        >
                            <div className="aspect-square relative bg-gray-100">
                                <img
                                    className="w-full h-full object-cover"
                                    src={post.imageUrls[0] ?? ''}
                                    alt={post.caption || 'Post image'}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '';
                                    }}
                                    onClick={() => setSelectedPostId(post.postId)}
                                />
                                {post.rank <= 3 && (
                                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md">
                                        <span className="text-sm font-bold text-gray-700">#{post.rank}</span>
                                        {post.rank === 1 && <span className="text-lg">👑</span>}
                                        {post.rank === 2 && <span className="text-base">🥈</span>}
                                        {post.rank === 3 && <span className="text-base">🥉</span>}
                                    </div>
                                )}
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-xs text-gray-500 mb-1">
                                    by <span className="font-semibold text-[#15B8A6]">{post.username}</span>
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{formatCount(post.reactionsCount)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                        <span>{formatCount(post.commentsCount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {loadingMore && (
                    <div className="col-span-full flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    </div>
                )}
            </div>

            <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
        </div>
    );
};

