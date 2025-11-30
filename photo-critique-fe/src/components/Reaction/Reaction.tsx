// components/Reaction/Reaction.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ReactionType, type ReactionTargetType } from '../../types/enums';
import { ReactionDisplay } from './ReactionDisplay';
import { ReactionSelector } from './ReactionSelector';

export interface ReactionStats {
  [ReactionType.LIKE]: number;
  [ReactionType.LOVE]: number;
  [ReactionType.HAHA]: number;
  [ReactionType.WOW]: number;
  [ReactionType.SAD]: number;
  [ReactionType.ANGRY]: number;
  total: number;
}

interface ReactionProps {
  targetId: string; // ID của post/comment/message
  targetType: ReactionTargetType;
  initialStats?: Partial<ReactionStats>;
  initialUserReaction?: ReactionType | null;
  onReaction: (targetId: string, reactionType: ReactionType | null) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCount?: boolean;
  disabled?: boolean;
}

export const Reaction: React.FC<ReactionProps> = ({
  targetId,
  targetType,
  initialStats = {},
  initialUserReaction = null,
  onReaction,
  size = 'md',
  className = '',
  showCount = true,
  disabled = false,
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [stats, setStats] = useState<ReactionStats>({
    [ReactionType.LIKE]: 0,
    [ReactionType.LOVE]: 0,
    [ReactionType.HAHA]: 0,
    [ReactionType.WOW]: 0,
    [ReactionType.SAD]: 0,
    [ReactionType.ANGRY]: 0,
    total: 0,
    ...initialStats,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Close selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionSelect = async (reactionType: ReactionType) => {
    if (disabled) return;

    const previousReaction = userReaction;
    
    // Optimistic update
    const newStats = { ...stats };
    
    // Remove previous reaction
    if (previousReaction) {
      newStats[previousReaction] = Math.max(0, newStats[previousReaction] - 1);
      newStats.total = Math.max(0, newStats.total - 1);
    }
    
    // Add new reaction (toggle if same reaction)
    const isTogglingOff = previousReaction === reactionType;
    if (!isTogglingOff) {
      newStats[reactionType] = (newStats[reactionType] || 0) + 1;
      newStats.total += 1;
    }

    setStats(newStats);
    setUserReaction(reactionType);

    setIsSelectorOpen(false);

    // Call API
    try {
      await onReaction(targetId, isTogglingOff ? null : reactionType);
    } catch (error) {
      // Revert optimistic update on error
      setStats(stats);
      setUserReaction(userReaction);
      console.error('Failed to update reaction:', error);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSelectorOpen(false);
    }, 300);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center gap-2 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          disabled={disabled}
          className={`
            flex items-center justify-center rounded-full transition-all duration-200
            hover:scale-110 active:scale-95
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'}
            ${userReaction 
              ? 'bg-blue-50 border border-blue-200' 
              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }
          `}
        >
          <ReactionDisplay
            type={userReaction} 
            size={size}
          />
        </button>

        {/* Reaction Selector */}
        {isSelectorOpen && !disabled && (
          <ReactionSelector
            onSelect={handleReactionSelect}
            currentReaction={userReaction}
            size={size}
          />
        )}
      </div>

      {/* Reaction Count */}
      {showCount && stats.total > 0 && (
        <div className={`
          text-sm font-medium text-gray-600
          ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
        `}>
          {stats.total}
        </div>
      )}
    </div>
  );
};