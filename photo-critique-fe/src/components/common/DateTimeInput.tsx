import React, { forwardRef, useState, type InputHTMLAttributes } from "react";
import {
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DateTimeInputType = "date" | "time" | "datetime-local" | "month" | "week";

export interface DateTimeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  variant?: "outline" | "filled" | "flushed" | "unstyled";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  dateTimeType?: DateTimeInputType;
  showIcon?: boolean;
}

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      variant = "outline",
      size = "medium",
      fullWidth = false,
      loading = false,
      success = false,
      disabled = false,
      className,
      dateTimeType = "datetime-local",
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const getIcon = () => {
      if (LeftIcon) return LeftIcon;
      if (dateTimeType === "time") return ClockIcon;
      return CalendarIcon;
    };

    const Icon = getIcon();

    const baseClasses = cn(
      "flex items-center transition-all duration-200 bg-white font-medium",
      "placeholder-gray-400 focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      {
        "w-full": fullWidth,
        // Sizes
        "h-8 text-sm px-3": size === "small",
        "h-10 text-base px-4": size === "medium",
        "h-12 text-lg px-4": size === "large",
        // Variants
        "border rounded-lg focus:ring-2": variant === "outline",
        "border-gray-300 focus:border-[#15B8A6] focus:ring-[#15B8A6]/20":
          variant === "outline" && !error && !success,
        "bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#15B8A6] focus:ring-2 focus:ring-[#15B8A6]/20":
          variant === "filled",
        "border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-[#15B8A6]":
          variant === "flushed",
        "bg-transparent border-none focus:ring-0": variant === "unstyled",
        // States
        "border-red-500 focus:border-red-500 focus:ring-red-500/20": error,
        "border-green-500 focus:border-green-500 focus:ring-green-500/20":
          success && !error,
        "bg-gray-100": disabled,
      }
    );

    const inputClasses = cn("flex-1 bg-transparent outline-none w-full", {
      "pl-0": !showIcon,
      "pr-2": true,
    });

    const iconClasses = cn(
      "flex items-center justify-center text-gray-400 transition-colors shrink-0",
      {
        "w-4 h-4": size === "small",
        "w-5 h-5": size === "medium",
        "w-6 h-6": size === "large",
      }
    );

    // Format value for display based on dateTimeType
    // const formatInputValue = (value: string | number | readonly string[] | undefined) => {
    //   if (!value) return "";
    //   return value;
    // };

    return (
      <div className={cn("flex flex-col space-y-1.5", { "w-full": fullWidth })}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={cn("text-sm font-medium text-gray-700", {
              "text-red-600": error,
            })}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div
          className={cn(baseClasses, className, {
            "ring-2 ring-[#15B8A6]/50":
              isFocused && variant !== "unstyled" && !error,
          })}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {/* Left Icon */}
          {showIcon && Icon && (
            <Icon className={cn(iconClasses, "ml-3")} aria-hidden="true" />
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={dateTimeType}
            className={inputClasses}
            disabled={disabled || loading}
            {...props}
            style={{
              paddingLeft: showIcon ? "0.5rem" : undefined,
            }}
          />

          {/* Right Content */}
          {loading && (
            <div className="flex items-center mr-3">
              <div className={iconClasses}>
                <div className="w-4 h-4 border-2 border-[#15B8A6] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* Success Icon */}
          {success && !loading && !error && (
            <div className={cn(iconClasses, "text-green-500 mr-3")}>
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

DateTimeInput.displayName = "DateTimeInput";
