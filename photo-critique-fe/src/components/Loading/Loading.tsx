import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export type LoadingVariant = "fullscreen" | "inline" | "spinner" | "text";
/**
 * - fullscreen: Full screen loading overlay
 * - inline: Inline loading with spinner and text
 * - spinner: Just the spinner
 * - text: Spinner with text below
 */

export interface LoadingProps {
  variant?: LoadingVariant;
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const Loading: React.FC<LoadingProps> = ({
  variant = "inline",
  text,
  size = "md",
  className = "",
}) => {
  const spinner = (
    <ArrowPathIcon
      className={`${sizeClasses[size]} animate-spin text-gray-500`}
      aria-hidden="true"
    />
  );

  const spinnerWithText = text ? (
    <div className="flex flex-col items-center justify-center gap-2">
      {spinner}
      <p className={`${textSizeClasses[size]} text-gray-500`}>{text}</p>
    </div>
  ) : (
    spinner
  );

  switch (variant) {
    case "fullscreen":
      return (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 ${className}`}
        >
          {spinnerWithText}
        </div>
      );

    case "inline":
      return (
        <div
          className={`flex items-center justify-center gap-2 ${className}`}
        >
          {spinner}
          {text && (
            <p className={`${textSizeClasses[size]} text-gray-500`}>{text}</p>
          )}
        </div>
      );

    case "spinner":
      return <div className={className}>{spinner}</div>;

    case "text":
      return (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
          {spinner}
          {text && (
            <p className={`${textSizeClasses[size]} text-gray-500`}>{text}</p>
          )}
        </div>
      );

    default:
      return <div className={className}>{spinner}</div>;
  }
};

