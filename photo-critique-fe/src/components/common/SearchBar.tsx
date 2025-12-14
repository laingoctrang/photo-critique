import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "./Input";

interface SearchBarProps<T> {
  placeholder?: string;
  className?: string;
  onSearch: (query: string) => Promise<T[]>;
  renderResult: (item: T) => React.ReactNode;
  minLength?: number;
  debounceMs?: number;
}

export function SearchBar<T>({
  placeholder = "Search",
  className = "",
  onSearch,
  renderResult,
  minLength = 1,
  debounceMs = 300,
}: SearchBarProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchText.length < minLength) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await onSearch(searchText);
        setResults(res);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchText, onSearch, debounceMs, minLength]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Input */}
      <div className="relative">
        <Input
          type="text"
          variant="outline"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={placeholder}
          leftIcon={MagnifyingGlassIcon}
          className="h-10 text-sm"
        />
      </div>

      {/* Suggestions */}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 shadow-md max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {renderResult(item)}
            </li>
          ))}
        </ul>
      )}

      {/* Loading indicator */}
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Loading...</div>}
    </div>
  );
}
