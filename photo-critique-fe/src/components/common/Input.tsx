import React, { forwardRef, useState, type InputHTMLAttributes } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  variant?: "outline" | "filled" | "flushed" | "unstyled";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      variant = "outline",
      size = "medium",
      fullWidth = false,
      loading = false,
      success = false,
      disabled = false,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Xác định type cho input password
    const inputType = type === "password" && showPassword ? "text" : type;

    // Base classes
    const baseClasses = cn(
      "flex items-center transition-all duration-200 bg-white font-medium",
      "placeholder-gray-400 focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      {
        "w-full": fullWidth,
        // Sizes
        "h-10 text-sm p-3": size === "small",
        "h-12 text-base p-4": size === "medium",
        "h-14 text-lg p-4": size === "large",
        // Variants
        "border rounded-4xl focus:ring-2": variant === "outline",
        "border-gray-300 focus:border-[#15B8A6] focus:ring-[#15B8A6]/20":
          variant === "outline" && !error && !success,
        "bg-gray-50 border border-transparent rounded-4xl focus:bg-white focus:border-[#15B8A6] focus:ring-2 focus:ring-[#15B8A6]/20":
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
      "pl-0": !LeftIcon,
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
            {props.required && <span className="text-[#ffa17a] ml-1">*</span>}
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
          {LeftIcon && (
            <LeftIcon className={cn(iconClasses)} aria-hidden="true" />
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled || loading}
            {...props}
            style={{
              paddingLeft: LeftIcon ? "0.5rem" : undefined,
            }}
          />

          {/* Right Content */}
          <div className="flex items-center gap-1">
            {/* Loading Spinner */}
            {loading && (
              <ArrowPathIcon
                className={cn(iconClasses, "animate-spin")}
                aria-hidden="true"
              />
            )}

            {/* Success Icon */}
            {success && !loading && !error && (
              <CheckCircleIcon
                className={cn(iconClasses, "text-green-500")}
                aria-hidden="true"
              />
            )}

            {/* Password Toggle */}
            {type === "password" && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  iconClasses,
                  "hover:text-gray-600 focus:outline-none focus:text-gray-600 cursor-pointer"
                )}
                disabled={disabled}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-full h-full" />
                ) : (
                  <EyeIcon className="w-full h-full" />
                )}
              </button>
            )}

            {/* Right Icon */}
            {RightIcon && !loading && type !== "password" && (
              <RightIcon className={iconClasses} aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
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

Input.displayName = "Input";
