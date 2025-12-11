import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  suggestions = [],
  placeholder = "Add a tag...",
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, tags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
      e.preventDefault();
      // Focus first suggestion (could be enhanced with keyboard navigation)
    }
  };

  const addTag = (tag: string) => {
    if (tags.length >= maxTags) {
      return;
    }
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Tags Container */}
      <div
        className={cn(
          "min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-2xl",
          "bg-white focus-within:border-[#15B8A6] focus-within:ring-2 focus-within:ring-[#15B8A6]/20",
          "flex flex-wrap gap-2 items-center cursor-text"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#F0FDFA] text-[#0F453E] rounded-full text-sm font-medium border border-[#CCFBF1]"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
          disabled={tags.length >= maxTags}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

