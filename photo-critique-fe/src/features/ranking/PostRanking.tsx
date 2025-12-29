import React, { useEffect, useState } from 'react';
import { rankingService, type PostRankingResponse, type RankingPeriod } from '../../services/rankingService';
import { PostDetailModal } from '../post/PostDetailModal';

interface PostRankingProps {
    type: 'reactions' | 'comments';
    period: RankingPeriod;
    limit?: number;
    onTypeChange?: (type: 'reactions' | 'comments') => void;
}

export const PostRanking: React.FC<PostRankingProps> = ({ type, period, limit = 20, onTypeChange }) => {
    const [posts, setPosts] = useState<PostRankingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response =
                    type === 'reactions'
                        ? await rankingService.getPostReactionsRanking(period, limit)
                        : await rankingService.getPostCommentsRanking(period, limit);
                setPosts(response.postRankings || []);
            } catch (error) {
                console.error(`Failed to fetch ${type} rankings:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [type, period, limit]);

    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Featured Works</h3>
                    {onTypeChange && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onTypeChange('reactions')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    type === 'reactions'
                                        ? 'bg-[#15B8A6] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Most Reactions
                            </button>
                            <button
                                onClick={() => onTypeChange('comments')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    type === 'comments'
                                        ? 'bg-[#15B8A6] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Most Comments
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Featured Works</h3>
                {onTypeChange && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onTypeChange('reactions')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                type === 'reactions'
                                    ? 'bg-[#15B8A6] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Most Reactions
                        </button>
                        <button
                            onClick={() => onTypeChange('comments')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                type === 'comments'
                                    ? 'bg-[#15B8A6] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Most Comments   
                        </button>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {posts.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-gray-500">No posts available</div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.postId}
                            className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100"
                            onClick={() => setSelectedPostId(post.postId)}
                        >
                            <div className="aspect-square relative bg-gray-100">
                                <img
                                    className="w-full h-full object-cover"
                                    src={post.imageUrls[0] ?? ''}
                                    alt={post.caption || 'Post image'}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '';
                                    }}
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
                            <div className="p-3">
                                <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                                    {post.caption ?? ''}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                    by {post.username}
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
            </div>

            <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
        </div>
    );
};

