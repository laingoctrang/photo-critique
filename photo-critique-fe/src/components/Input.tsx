import React, { forwardRef, useState, type InputHTMLAttributes } from "react";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
    6,
    10
  )}`;
};

const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return new Intl.NumberFormat("en-US").format(Number(numbers) / 100);
};

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
      leftIcon,
      rightIcon,
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
        "h-8 text-sm px-3": size === "small",
        "h-10 text-base px-4": size === "medium",
        "h-12 text-lg px-4": size === "large",
        // Variants
        "border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200":
          variant === "outline",
        "bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200":
          variant === "filled",
        "border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-blue-500":
          variant === "flushed",
        "bg-transparent border-none focus:ring-0": variant === "unstyled",
        // States
        "border-red-500 focus:border-red-500 focus:ring-red-200": error,
        "border-green-500 focus:border-green-500 focus:ring-green-200":
          success && !error,
        "opacity-60": disabled,
      }
    );

    const inputClasses = cn("flex-1 bg-transparent outline-none w-full", {
      "pl-3": !leftIcon,
      "pr-3": !rightIcon && type !== "password",
    });

    const iconClasses = cn(
      "flex items-center justify-center text-gray-400 transition-colors",
      {
        "w-4 h-4": size === "small",
        "w-5 h-5": size === "medium",
        "w-6 h-6": size === "large",
      }
    );

    return (
      <div className={cn("flex flex-col space-y-1", { "w-full": fullWidth })}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={cn("text-sm font-medium text-gray-700 mb-1", {
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
            "ring-2 ring-blue-500 ring-opacity-50":
              isFocused && variant !== "unstyled",
            "bg-gray-100": disabled,
          })}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {/* Left Icon */}
          {leftIcon && (
            <span className={cn(iconClasses, "ml-3")}>{leftIcon}</span>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled || loading}
            {...props}
            style={{
              paddingLeft: leftIcon ? "0.5rem" : undefined,
              paddingRight:
                rightIcon || type === "password" ? "0.5rem" : undefined,
            }}
          />

          {/* Right Content */}
          <div className="flex items-center space-x-1 mr-3">
            {/* Loading Spinner */}
            {loading && (
              <div className={iconClasses}>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Success Icon */}
            {success && !loading && !error && (
              <div className={cn(iconClasses, "text-green-500")}>✓</div>
            )}

            {/* Password Toggle */}
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  iconClasses,
                  "hover:text-gray-600 focus:outline-none focus:text-gray-600"
                )}
                disabled={disabled}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            )}

            {/* Right Icon */}
            {rightIcon && !loading && type !== "password" && (
              <span className={iconClasses}>{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
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

Input.displayName = "Input";
