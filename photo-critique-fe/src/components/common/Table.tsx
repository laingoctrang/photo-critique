import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Input } from "./Input";
import { Dropdown, type DropdownOption } from "./Dropdown";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Loading } from "../Loading";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export interface TableProps<T> {
  data?: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  sortable?: boolean;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  filters?: FilterOption[];
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  
  // API-based props
  fetchData?: (params: {
    search?: string;
    filters?: Record<string, string>;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page: number;
    size: number;
  }) => Promise<{
    content: T[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>;
  
  // Create button
  onCreateClick?: () => void;
  createButtonLabel?: string;
}

export function Table<T>({
  data: propData,
  columns,
  keyExtractor,
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = true,
  onSelectionChange,
  sortable = true,
  defaultSort,
  filters = [],
  actions,
  emptyMessage = "No data available",
  viewMode = "list",
  onViewModeChange,
  fetchData,
  onCreateClick,
  createButtonLabel = "Create",
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(defaultSort || null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  // API-based state
  const [data, setData] = useState<T[]>(propData || []);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Fetch data from API
  const loadData = useCallback(async () => {
    if (!fetchData) {
      setData(propData || []);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchData({
        search: searchTerm || undefined,
        filters: activeFilters,
        sortBy: sortConfig?.key,
        sortDirection: sortConfig?.direction,
        page,
        size: pageSize,
      });

      setData(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setHasNext(result.hasNext);
      setHasPrevious(result.hasPrevious);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData, searchTerm, activeFilters, sortConfig, page, pageSize, propData]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeFilters, sortConfig, page, pageSize, fetchData]);

  // Reset to page 0 when filters/search/sort change
  useEffect(() => {
    if (fetchData) {
      setPage(0);
    }
  }, [searchTerm, activeFilters, sortConfig, fetchData]);

  // Prevent search input events from propagating to parent (e.g., when modal is open)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  // Handle sort - 3 states: asc -> desc -> null (unsort)
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === key) {
        // Same column: cycle through asc -> desc -> null
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else {
          // desc -> null (unsort)
          return null;
        }
      }
      // Different column: start with asc
      return { key, direction: "asc" };
    });
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(keyExtractor));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const isAllSelected = data.length > 0 && data.every((item) => selectedIds.has(keyExtractor(item)));

  const getSortIcon = (key: string) => {
    const isActive = sortConfig?.key === key;
    const direction = isActive ? sortConfig.direction : null;

    if (direction === "asc") {
      return (
        <ChevronUpIcon className={`w-4 h-4 ${isActive ? "font-bold" : ""}`} style={{ fontWeight: isActive ? 700 : 400 }} />
      );
    } else if (direction === "desc") {
      return (
        <ChevronDownIcon className={`w-4 h-4 ${isActive ? "font-bold" : ""}`} style={{ fontWeight: isActive ? 700 : 400 }} />
      );
    } else {
      // Not sorted - show both icons with opacity
      return (
        <div className="w-4 h-4 flex flex-col opacity-30">
          <ChevronUpIcon className="w-3 h-3 -mb-1" />
          <ChevronDownIcon className="w-3 h-3" />
        </div>
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  // Generate showing options
  const showingOptions: DropdownOption[] = [
    { value: "10", label: "Show 10" },
    { value: "20", label: "Show 20" },
    { value: "50", label: "Show 50" },
    { value: "100", label: "Show 100" },
  ];

  return (
    <div className="flex flex-col gap-4 overflow-hidden pt-1">
      {/* Sticky Header with search and filters */}
      <div className=" top-0 z-10 pb-0 bg-[#F5F6F8]">
        <div className="flex items-center justify-between gap-4 flex-wrap h-full">
          {/* Left: Create, Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {onCreateClick && (
              <Button
                variant="primary"
                size="small"
                onClick={onCreateClick}
                leftIcon={PlusIcon}
              >
                {createButtonLabel}
              </Button>
            )}

            {/* {filters.length > 0 && (
              <Button
                variant="secondary"
                size="small"
                leftIcon={FunnelIcon}
              >
                Filters
              </Button>
            )} */}

            {filters.map((filter) => {
              const dropdownOptions: DropdownOption[] = [
                ...filter.options.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                })),
              ];

              return (
                <div key={filter.key} className="w-48">
                  <Dropdown
                    value={activeFilters[filter.key] || null}
                    onChange={(val) => {
                      const stringValue = Array.isArray(val) ? val[0] || "" : val || "";
                      setActiveFilters((prev) => ({
                        ...prev,
                        [filter.key]: stringValue,
                      }));
                    }}
                    options={dropdownOptions}
                    placeholder={filter.label}
                    size="small"
                    clearable
                    className="text-sm"
                    direction="down"
                  />
                </div>
              );
            })}
          </div>

          {/* Right: Search and View Mode */}
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="w-64">
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchTerm(e.target.value);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={handleSearchFocus}
                  leftIcon={MagnifyingGlassIcon}
                  size="small"
                  variant="outline"
                />
              </div>
            )}

            {onViewModeChange && (
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-[#15B8A6] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onViewModeChange("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-[#15B8A6] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-4xl border border-gray-200 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading variant="text" text="Loading..." />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {selectable && (
                    <th className="pl-4 text-left bg-gray-100 text-gray-700 rounded-l-4xl">
                      <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        size="small"
                      />
                    </th>
                  )}
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      className={`px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100 text-gray-700 
                  ${column.sortable !== false && sortable
                        ? "cursor-pointer hover:bg-gray-100"
                        : ""
                      }
                  ${!selectable && index === 0 ? "rounded-l-4xl" : ""}`}
                      style={{ width: column.width }}
                      onClick={() =>
                        column.sortable !== false && sortable && handleSort(column.key)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {column.sortable !== false && sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                  {actions && (
                    <th className="text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100 text-gray-700 rounded-r-4xl">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                      }
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => {
                    const id = keyExtractor(item);
                    return (
                      <tr
                        key={id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {selectable && (
                          <td className="pl-4">
                            <Checkbox
                              checked={selectedIds.has(id)}
                              onChange={(e) => handleSelectItem(id, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="px-4 py-3 text-sm text-gray-900"
                          >
                            {column.render
                              ? column.render(item)
                              : String((item as Record<string, unknown>)[column.key] ?? "")}
                          </td>
                        ))}
                        {actions && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-center gap-2">
                              {actions(item)}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {fetchData && totalPages > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {data.length === 0 ? 0 : page * pageSize + 1} to{" "}
                    {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} entries
                  </span>
                  <div className="w-32">
                    <Dropdown
                      value={pageSize.toString()}
                      onChange={(val) => {
                        const size = Array.isArray(val) ? parseInt(val[0] || "20") : parseInt(val || "20");
                        handlePageSizeChange(size);
                      }}
                      options={showingOptions}
                      placeholder="Show"
                      size="small"
                      className="text-sm"
                      direction="up"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrevious}
                    className={`p-2 rounded ${
                      hasPrevious
                        ? "bg-white border border-gray-300 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (page < 2) {
                        pageNum = i;
                      } else if (page > totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded text-sm ${
                            page === pageNum
                              ? "bg-[#15B8A6] text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNext}
                    className={`p-2 rounded ${
                      hasNext
                        ? "bg-white border border-gray-300 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
