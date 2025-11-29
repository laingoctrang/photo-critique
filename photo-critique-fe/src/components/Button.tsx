import React, { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      "inline-flex items-center justify-center gap-2 border-none rounded cursor-pointer font-medium transition-all duration-200 outline-none relative";

    // Variants
    const variantClasses = {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };

    // Sizes
    const sizeClasses = {
      small: "px-3 py-2 text-sm",
      medium: "px-4 py-2.5 text-base",
      large: "px-5 py-3 text-lg",
    };

    // State
    const stateClasses =
      disabled || isLoading ? "opacity-60 cursor-not-allowed" : "";

    // Full width
    const widthClass = fullWidth ? "w-full" : "";

    // Combine all classes
    const buttonClass = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${stateClasses}
      ${widthClass}
      ${className}
    `
      .trim()
      .replace(/\s+/g, " ");

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="w-5 h-5 border-2 border-transparent border-t-current rounded-full animate-spin" />
        )}
        {leftIcon && !isLoading && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        <span className={isLoading ? "invisible" : "visible"}>{children}</span>
        {rightIcon && !isLoading && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
