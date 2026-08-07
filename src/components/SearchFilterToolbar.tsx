import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  placeholder?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const SearchFilterToolbar: React.FC<SearchFilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter by",
  placeholder = "Search records...",
  className = "",
  actions
}) => {
  const hasActiveFilters = searchTerm !== "" || (filterValue && filterValue !== "ALL");

  const handleClear = () => {
    onSearchChange("");
    if (onFilterChange) {
      onFilterChange("ALL");
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full bg-white border border-slate-200/90 p-2.5 sm:p-3 rounded-2xl shadow-2xs transition-all hover:border-slate-300 mb-5 ${className}`}>
      {/* Search Input Container */}
      <div className="relative grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-blue-600" size={15} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 rounded-xl py-2 pl-10 pr-9 font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-all"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter Selector & Clear Button */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {onFilterChange && filterOptions && filterOptions.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200/80 rounded-xl px-2.5 py-0.5">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              aria-label={filterLabel}
              className="bg-transparent border-none py-1.5 pr-3 pl-1 font-bold text-slate-800 text-[10px] uppercase tracking-wider focus:outline-none focus:ring-0 cursor-pointer"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="normal-case font-medium text-xs">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100/80 text-red-600 rounded-xl transition-all flex items-center gap-1 border border-red-100 cursor-pointer"
          >
            <X size={11} />
            Reset
          </button>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default SearchFilterToolbar;
