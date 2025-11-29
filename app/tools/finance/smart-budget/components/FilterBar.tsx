import React, { useEffect, useRef } from "react";
import { FilterState } from "../types";
import { Search, X, Filter, Calendar, Download } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: string[];
  onExport: () => void;
  mode: 'Personal' | 'Enterprise';
}

export function FilterBar({ filters, setFilters, categories, onExport, mode }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const themeColor = mode === 'Personal' ? 'emerald' : 'violet';
  const themeBorder = mode === 'Personal' ? 'border-emerald-200' : 'border-violet-200';
  const themeFocus = mode === 'Personal' ? 'focus:ring-emerald-500' : 'focus:ring-violet-500';
  const themeBg = mode === 'Personal' ? 'bg-emerald-50' : 'bg-violet-50';
  const themeText = mode === 'Personal' ? 'text-emerald-700' : 'text-violet-700';

  // Keyboard Shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
        showToast("Search Focused");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasFilters = filters.search || filters.category !== "All" || filters.type !== "All" || filters.status !== "All" || filters.startDate;

  return (
    <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-b z-20 sticky top-[73px]"> {/* Sticky below KPI Ribbon */}
      
      {/* Search Header - px-6 */}
      <div className="px-6 py-3 border-b flex items-center gap-4">
         <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-muted/70" />
            <input
              ref={searchRef}
              className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none transition ${themeFocus} focus:ring-2`}
              placeholder="Search (Press '/' to focus)..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
            />
         </div>
         <button 
           onClick={onExport}
           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted dark:text-muted/70 dark:text-muted/70 border rounded hover:bg-background dark:bg-surface dark:bg-slate-950 transition active:scale-95"
         >
           <Download size={14} /> Export CSV
         </button>
      </div>

      {/* Filters Area - px-6 */}
      <div className={`px-6 py-2 ${themeBg} flex flex-wrap items-center gap-3 border-b`}>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide tracking-wide mr-2 ${themeText}`}>
            <Filter size={12} /> Filters:
        </div>
        
        <select
          className={`p-1.5 border ${themeBorder} rounded text-xs bg-surface dark:bg-slate-800 dark:bg-surface focus:outline-none`}
          value={filters.type}
          onChange={(e) => handleChange("type", e.target.value as any)}
        >
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>

        <select
          className={`p-1.5 border ${themeBorder} rounded text-xs bg-surface dark:bg-slate-800 dark:bg-surface focus:outline-none min-w-[140px]`}
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {mode === 'Enterprise' && (
          <select
            className={`p-1.5 border ${themeBorder} rounded text-xs bg-surface dark:bg-slate-800 dark:bg-surface focus:outline-none`}
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value as any)}
          >
            <option value="All">All Status</option>
            <option value="Posted">Posted</option>
            <option value="Parked">Parked</option>
            <option value="Draft">Draft</option>
          </select>
        )}

        <div className="h-5 w-[1px] bg-slate-300 mx-1"></div>

        <div className={`flex items-center gap-2 bg-surface dark:bg-slate-800 dark:bg-surface border ${themeBorder} rounded px-2 py-1`}>
            <Calendar size={12} className={themeText} />
            <input 
                type="date" 
                className="text-xs outline-none bg-transparent dark:text-white"
                value={filters.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
            />
            <span className="text-slate-300">-</span>
             <input 
                type="date" 
                className="text-xs outline-none bg-transparent dark:text-white"
                value={filters.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
            />
        </div>

        {hasFilters && (
          <button 
            onClick={() => setFilters({ search: "", category: "All", type: "All", status: "All", startDate: "", endDate: "" })}
            className="ml-auto px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded flex items-center gap-1 font-medium"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
