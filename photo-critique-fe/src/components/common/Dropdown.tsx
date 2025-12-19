import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  // Value props (single select only)
  value?: string | null;
  onChange?: (value: string | null) => void;
  
  // Options - can be array or lazy load function
  options?: DropdownOption[];
  loadOptions?: (search: string, page: number) => Promise<{
    options: DropdownOption[];
    hasMore: boolean;
  }>;
  
  // UI props
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  className?: string;
  
  // Feature flags
  searchable?: boolean;
  clearable?: boolean;
  lazyLoad?: boolean;
  
  // Lazy load config
  pageSize?: number;
  
  // Dropdown direction
  direction?: "up" | "down"; // "down" by default, "up" for dropdowns that should open upward
  
  // Render props
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (selected: DropdownOption | null) => React.ReactNode;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      value,
      onChange,
      options = [],
      loadOptions,
      label,
      placeholder = "Select an option",
      error,
      helperText,
      leftIcon: LeftIcon,
      size = "medium",
      fullWidth = false,
      disabled = false,
      loading = false,
      required = false,
      className,
      searchable = false,
      lazyLoad = false,
      pageSize = 10,
      direction = "down",
      renderOption,
      renderValue,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [lazyOptions, setLazyOptions] = useState<DropdownOption[]>([]);
    const [lazyLoading, setLazyLoading] = useState(false);
    const [lazyPage, setLazyPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get selected option (single select)
    const selectedOption = useMemo(() => {
      if (!value) return null;
      const allOptions = lazyLoad ? lazyOptions : options;
      return allOptions.find((opt) => opt.value === value) || null;
    }, [value, options, lazyOptions, lazyLoad]);

    // Get display value
    const displayValue = useMemo(() => {
      if (!selectedOption) return null;
      if (renderValue) {
        return renderValue(selectedOption);
      }
      return selectedOption.label;
    }, [selectedOption, renderValue]);

    // Filter options (for non-lazy load)
    const filteredOptions = useMemo(() => {
      if (lazyLoad) return lazyOptions;
      
      let result = options;
      
      if (searchable && debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        result = result.filter(
          (opt) =>
            opt.label.toLowerCase().includes(term) ||
            opt.value.toLowerCase().includes(term)
        );
      }
      
      return result;
    }, [options, debouncedSearch, searchable, lazyLoad, lazyOptions]);

    // Load options (lazy load)
    const loadLazyOptions = useCallback(
      async (search: string, page: number, append: boolean = false) => {
        if (!loadOptions) return;
        
        setLazyLoading(true);
        try {
          const result = await loadOptions(search, page);
          if (append) {
            setLazyOptions((prev) => [...prev, ...result.options]);
          } else {
            setLazyOptions(result.options);
          }
          setHasMore(result.hasMore);
        } catch (error) {
          console.error("Error loading options:", error);
        } finally {
          setLazyLoading(false);
        }
      },
      [loadOptions]
    );

    // Debounce search input
    useEffect(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, 300);
      
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [searchTerm]);

    // Load options when search changes (lazy load)
    useEffect(() => {
      if (lazyLoad && loadOptions && isOpen) {
        setLazyPage(1);
        loadLazyOptions(debouncedSearch, 1, false);
      }
    }, [lazyLoad, loadOptions, isOpen, debouncedSearch, loadLazyOptions]);

    // Load more on scroll (lazy load)
    useEffect(() => {
      if (!lazyLoad || !isOpen || !hasMore || lazyLoading) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const nextPage = lazyPage + 1;
            setLazyPage(nextPage);
            loadLazyOptions(debouncedSearch, nextPage, true);
          }
        },
        { threshold: 0.1 }
      );

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [lazyLoad, isOpen, hasMore, lazyLoading, lazyPage, debouncedSearch, loadLazyOptions]);

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (disabled || loading) return;
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    };

    const handleSelect = (option: DropdownOption) => {
      if (option.disabled) return;

      // Toggle selection: if already selected, deselect (set to null)
      const newValue = value === option.value ? null : option.value;
      onChange?.(newValue);
      setIsOpen(false);
      setSearchTerm("");
    };

    const isSelected = (option: DropdownOption) => {
      return value === option.value;
    };

    // Size classes
    const sizeClasses = {
      small: "h-10 text-sm",
      medium: "h-12 text-base",
      large: "h-14 text-lg",
    };

    const iconSizeClasses = {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    };

    // Base classes
    const baseClasses = cn(
      "flex items-center transition-all duration-200 bg-white font-medium",
      "placeholder-gray-400 focus:outline-none cursor-pointer",
      "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
      "border border-gray-300 rounded-4xl hover:bg-gray-50 focus:border-[#15B8A6] focus:ring-2 focus:ring-[#15B8A6]/50",
      "px-4 py-2",
      "w-full",
    );

    return (
      <div
        ref={containerRef}
        className={cn("relative flex flex-col space-y-1.5", {
          "w-full": fullWidth,
        })}
      >
        {/* Label */}
        {label && (
          <label
            className={cn("text-sm font-medium text-gray-700", {
              "text-red-600": error,
            })}
          >
            {label}
            {required && <span className="text-[#ffa17a] ml-1">*</span>}
          </label>
        )}

        {/* Dropdown Container */}
        <div className="relative">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled || loading}
            className={cn(baseClasses, sizeClasses[size], className)}
          >
            {/* Left Icon */}
            {LeftIcon && (
              <LeftIcon
                className={cn(
                  "flex items-center justify-center text-gray-400 transition-colors shrink-0",
                  iconSizeClasses[size]
                )}
                aria-hidden="true"
              />
            )}

            {/* Display Value */}
            <span
              className={cn("flex-1 text-left truncate", {
                "text-gray-400": !displayValue,
                "pl-2": LeftIcon,
              })}
            >
              {displayValue || placeholder}
            </span>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              {/* Loading */}
              {loading && (
                <ArrowPathIcon
                  className={cn(
                    iconSizeClasses[size],
                    "animate-spin text-gray-400"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Chevron */}
              {!loading && (
                <div
                  className={cn(
                    "flex items-center justify-center text-gray-400 transition-transform",
                    iconSizeClasses[size],
                    isOpen && "rotate-180"
                  )}
                >
                  <ChevronDownIcon className="w-full h-full" />
                </div>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className={cn(
              "absolute z-50 w-full border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col",
              direction === "up" ? "bottom-full mb-1 bg-white" : "top-full mt-1 bg-transparent"
            )}>
              {/* Search Input */}
              {searchable && (
                <div className={`p-2 border-b border-gray-200 ${direction === "down" ? "bg-white" : "bg-white"}`}>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#15B8A6] focus:border-[#15B8A6]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="overflow-y-auto flex-1">
                {lazyLoading && filteredOptions.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    {searchable && debouncedSearch
                      ? "No options found"
                      : "No options available"}
                  </div>
                ) : (
                  <>
                    {filteredOptions.map((option) => {
                      const selected = isSelected(option);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option)}
                          disabled={option.disabled}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer",
                            direction === "down" ? "bg-white hover:bg-gray-50" : "bg-white hover:bg-gray-50",
                            "hover:text-[#15B8A6]",
                            selected && "bg-[#15B8A6]/10 text-[#15B8A6] font-medium",
                            option.disabled &&
                              "opacity-50 cursor-not-allowed hover:bg-transparent"
                          )}
                        >
                          {renderOption ? (
                            renderOption(option, selected)
                          ) : (
                            <span>{option.label}</span>
                          )}
                        </button>
                      );
                    })}
                    
                    {/* Load More Trigger (for lazy load) */}
                    {lazyLoad && hasMore && (
                      <div ref={loadMoreRef} className="h-4" />
                    )}
                    
                    {/* Loading More Indicator */}
                    {lazyLoad && lazyLoading && filteredOptions.length > 0 && (
                      <div className="flex items-center justify-center py-2">
                        <ArrowPathIcon className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
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

Dropdown.displayName = "Dropdown";