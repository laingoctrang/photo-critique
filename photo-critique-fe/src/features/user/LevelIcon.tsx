import React from "react";

interface LevelIconProps {
  level: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

// Import all level icons using Vite's glob
const levelIconModules = import.meta.glob("../../assets/images/level/Level_*.svg", {
  eager: true,
  query: "?url",
});

const badgeIconModules = import.meta.glob("../../assets/images/level/Badge_*.svg", {
  eager: true,
  query: "?url",
});

// Create a map of level number to icon URL
const getLevelIconUrl = (level: number): string | null => {
  // First try Level_{level}.svg format (e.g., Level_1.svg, Level_10.svg)
  const levelPattern = `../../assets/images/level/Level_${level}.svg`;
  for (const [path, module] of Object.entries(levelIconModules)) {
    if (path === levelPattern || path.includes(`Level_${level}.svg`)) {
      return (module as { default: string }).default;
    }
  }
  
  // Fallback to Badge_{formattedLevel}.svg format (e.g., Badge_01.svg, Badge_10.svg)
  const formattedLevel = level.toString().padStart(2, "0");
  const badgePattern = `../../assets/images/level/Badge_${formattedLevel}.svg`;
  for (const [path, module] of Object.entries(badgeIconModules)) {
    if (path === badgePattern || path.includes(`Badge_${formattedLevel}.svg`)) {
      return (module as { default: string }).default;
    }
  }
  
  return null;
};

export const LevelIcon: React.FC<LevelIconProps> = ({ 
  level, 
  size = "md",
  className = "" 
}) => {
  const iconSrc = getLevelIconUrl(level);
  
  if (!iconSrc) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-200 rounded`}>
        <span className="text-xs font-bold text-gray-500">L{level}</span>
      </div>
    );
  }

  return (
    <img
      src={iconSrc}
      alt={`Level ${level}`}
      className={`${sizeClasses[size]} ${className} object-contain`}
      aria-label={`Level ${level}`}
    />
  );
};

