import React from "react";
import { FilterState } from "../types";
import { Search, X } from "lucide-react";

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: string[];
}

export function FilterBar({ filters, setFilters, categories }: Props) {
  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white border-b p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          className="p-2 border rounded-md text-sm bg-slate-50 min-w-[120px]"
          value={filters.type}
          onChange={(e) => handleChange("type", e.target.value as any)}
        >
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>

        {/* Category Filter */}
        <select
          className="p-2 border rounded-md text-sm bg-slate-50 min-w-[150px]"
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span className="font-medium">Date Range:</span>
        <input 
          type="date" 
          className="border rounded px-2 py-1"
          value={filters.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
        <span>to</span>
        <input 
          type="date" 
          className="border rounded px-2 py-1"
          value={filters.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
        {(filters.search || filters.category !== "All" || filters.type !== "All" || filters.startDate) && (
          <button 
            onClick={() => setFilters({ search: "", category: "All", type: "All", startDate: "", endDate: "" })}
            className="ml-auto text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
