import React, { forwardRef, type InputHTMLAttributes } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: "small" | "medium" | "large";
  indeterminate?: boolean;
  fullWidth?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      size = "medium",
      indeterminate = false,
      fullWidth = false,
      className,
      disabled,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = (node: HTMLInputElement) => {
      checkboxRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const sizeClasses = {
      small: {
        checkbox: "w-4 h-4",
        icon: "w-3 h-3",
        label: "text-sm",
      },
      medium: {
        checkbox: "w-5 h-5",
        icon: "w-4 h-4",
        label: "text-base",
      },
      large: {
        checkbox: "w-6 h-6",
        icon: "w-5 h-5",
        label: "text-lg",
      },
    };

    const currentSize = sizeClasses[size];

    return (
      <div className={cn("flex flex-col space-y-1", { "w-full": fullWidth })}>
        <label
          className={cn(
            "inline-flex items-center gap-2.5 cursor-pointer group",
            {
              "cursor-not-allowed opacity-50": disabled,
              "cursor-pointer": !disabled,
            },
            className
          )}
        >
          {/* Hidden Native Checkbox */}
          <input
            ref={combinedRef}
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />

          {/* Custom Checkbox */}
          <div
            className={cn(
              "flex items-center justify-center rounded border-2 transition-all duration-200",
              "group-hover:border-[#15B8A6]",
              currentSize.checkbox,
              {
                "bg-[#15B8A6] border-[#15B8A6] text-white": checked && !indeterminate,
                "bg-white border-gray-300": !checked && !indeterminate,
                "bg-[#15B8A6] border-[#15B8A6]": indeterminate,
                "border-red-500": error,
                "border-gray-200 bg-gray-100": disabled,
                "focus-within:ring-2 focus-within:ring-[#15B8A6] focus-within:ring-offset-2":
                  !disabled,
              }
            )}
          >
            {checked && !indeterminate && (
              <CheckIcon className={cn(currentSize.icon, "text-white stroke-[3.5]")} />
            )}
            {indeterminate && (
              <div className={cn("bg-white", "h-0.5 w-2/3 rounded")} />
            )}
          </div>

          {/* Label Text */}
          {label && (
            <span
              className={cn(
                "text-gray-700 select-none",
                currentSize.label,
                {
                  "text-red-600": error,
                  "text-gray-400": disabled,
                }
              )}
            >
              {label}
              {props.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </span>
          )}
        </label>

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

Checkbox.displayName = "Checkbox";
