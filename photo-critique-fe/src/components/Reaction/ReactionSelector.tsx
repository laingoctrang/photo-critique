// components/Reaction/ReactionSelector.tsx
import React from 'react';
import { ReactionType } from '../../types/enums';

interface ReactionSelectorProps {
  onSelect: (reactionType: ReactionType) => void;
  currentReaction: ReactionType | null;
  size?: 'sm' | 'md' | 'lg';
}

export const ReactionSelector: React.FC<ReactionSelectorProps> = ({
  onSelect,
  currentReaction,
  size = 'md',
}) => {
  const reactions = [
    { type: ReactionType.LIKE, emoji: '👍', label: 'Like' },
    { type: ReactionType.LOVE, emoji: '❤️', label: 'Love' },
    { type: ReactionType.HAHA, emoji: '😂', label: 'Haha' },
    { type: ReactionType.WOW, emoji: '😮', label: 'Wow' },
    { type: ReactionType.SAD, emoji: '😢', label: 'Sad' },
    { type: ReactionType.ANGRY, emoji: '😡', label: 'Angry' },
  ];

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-base';
      case 'md':
        return 'w-10 h-10 text-lg';
      case 'lg':
        return 'w-12 h-12 text-xl';
      default:
        return 'w-10 h-10 text-lg';
    }
  };

  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-1 relative z-50">
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            type="button"
            onClick={() => onSelect(reaction.type)}
            className={`
              rounded-full transition-all duration-200 flex items-center justify-center
              hover:scale-125 active:scale-95
              ${getSizeClasses()}
              ${currentReaction === reaction.type 
                ? 'bg-blue-50 border border-blue-200 scale-110' 
                : 'bg-white hover:bg-gray-50'
              }
            `}
            title={reaction.label}
          >
            <span className="transition-transform duration-200">
              {reaction.emoji}
            </span>
          </button>
        ))}
      </div>
      
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white" />
    </div>
  );
};