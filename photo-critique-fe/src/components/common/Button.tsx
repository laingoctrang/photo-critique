import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const iconSizeClasses = {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    };

    const isDisabled = disabled || isLoading;

    const baseClasses = cn(
      "inline-flex items-center justify-center gap-2",
      "font-medium transition-all duration-200",
      "outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:pointer-events-none",
      {
        "w-full": fullWidth,
        // Sizes
        "px-4 py-2 text-sm": size === "small",
        "px-4 py-2.5 text-base": size === "medium",
        "px-6 py-3 text-lg": size === "large",
        // Variants
        "bg-[#15B8A6] text-white shadow-sm hover:bg-[#13A595] active:bg-[#119284] focus:ring-[#15B8A6] disabled:bg-gray-200 disabled:text-gray-400":
          variant === "primary",
        "bg-white text-[#13A595] border border-[#13A595] shadow-sm hover:bg-[#F0FDFA] hover:border-[#119284] focus:bg-[#15B8A6]/10 focus:ring-[#15B8A6]/20 focus:ring-offset-0 disabled:bg-white disabled:text-gray-400 disabled:border-gray-300":
          variant === "secondary",
        "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus:ring-red-500 disabled:bg-gray-200 disabled:text-gray-400":
          variant === "danger",
        "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500 disabled:text-gray-400":
          variant === "ghost",
        "bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200":
          variant === "outline",
      },
      "rounded-3xl cursor-pointer"
    );

    return (
      <button
        ref={ref}
        className={cn(baseClasses, className)}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <ArrowPathIcon
            className={cn(iconSizeClasses[size], "animate-spin")}
            aria-hidden="true"
          />
        ) : LeftIcon ? (
          <LeftIcon
            className={cn(iconSizeClasses[size], "shrink-0")}
            aria-hidden="true"
          />
        ) : null}
        {children && (
          <span>{children}</span>
        )}
        {!isLoading && RightIcon && (
          <RightIcon
            className={cn(iconSizeClasses[size], "shrink-0")}
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
