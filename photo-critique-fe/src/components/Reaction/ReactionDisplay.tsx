// components/Reaction/ReactionDisplay.tsx
import React from "react";
import { ReactionType } from "../../types/enums";
import { HandThumbUpIcon, HeartIcon } from "@heroicons/react/24/outline";

interface ReactionDisplayProps {
  type: ReactionType | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ReactionDisplay: React.FC<ReactionDisplayProps> = ({
  type,
  size = "md",
  className = "",
}) => {
  const getReactionEmoji = (reactionType: ReactionType | null) => {
    switch (reactionType) {
      case ReactionType.LIKE:
        return "👍";
      case ReactionType.LOVE:
        return "❤️";
      case ReactionType.HAHA:
        return "😂";
      case ReactionType.WOW:
        return "😮";
      case ReactionType.SAD:
        return "😢";
      case ReactionType.ANGRY:
        return "😡";
      default:
        return "❤️"; // Default emoji
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-base";
      case "md":
        return "text-lg";
      case "lg":
        return "text-xl";
      default:
        return "text-lg";
    }
  };

  return (
    <span
      className={`
      transition-transform duration-200
      ${type ? "scale-110" : "scale-100"}
      ${getSizeClasses()}
      ${className}
    `}
    >
      {type ? (
        getReactionEmoji(type)
      ) : (
        <HeartIcon className="w-6 h-6 text-gray-600" />
      )}
    </span>
  );
};
