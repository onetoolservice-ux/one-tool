'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Filter, X, ChevronDown, ChevronUp, Calendar, DollarSign,
  Tag, CheckSquare, Square, Search, RotateCcw, Sliders
} from 'lucide-react';
import type { Transaction } from '../analytics-store';

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED FILTERS - Excel-like filtering with multi-select, ranges, and columns
// ═══════════════════════════════════════════════════════════════════════════════

interface AdvancedFiltersProps {
  transactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
  type?: 'expenses' | 'credits';
}

interface ColumnVisibility {
  date: boolean;
  description: boolean;
  amount: boolean;
  category: boolean;
}

interface AmountRange {
  min: number;
  max: number;
}

interface DateRange {
  start: string;
  end: string;
}

export function AdvancedFilters({ transactions, onFilterChange, type = 'expenses' }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [amountRange, setAmountRange] = useState<AmountRange | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    date: true,
    description: true,
    amount: true,
    category: true,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Get amount range from data
  const amountBounds = useMemo(() => {
    if (transactions.length === 0) return { min: 0, max: 0 };
    const amounts = transactions.map(t => t.amount);
    return {
      min: Math.floor(Math.min(...amounts)),
      max: Math.ceil(Math.max(...amounts))
    };
  }, [transactions]);

  // Get date range from data
  const dateBounds = useMemo(() => {
    if (transactions.length === 0) return { start: '', end: '' };
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    return {
      start: dates[0] || '',
      end: dates[dates.length - 1] || ''
    };
  }, [transactions]);

  // Apply all filters
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }

    // Category filter
    if (selectedCategories.size > 0) {
      result = result.filter(t => selectedCategories.has(t.category));
    }

    // Amount range filter
    if (amountRange) {
      result = result.filter(t =>
        t.amount >= amountRange.min && t.amount <= amountRange.max
      );
    }

    // Date range filter
    if (dateRange && dateRange.start && dateRange.end) {
      result = result.filter(t =>
        t.date >= dateRange.start && t.date <= dateRange.end
      );
    }

    return result;
  }, [transactions, searchTerm, selectedCategories, amountRange, dateRange]);

  // Update parent when filters change (useEffect to avoid setState-during-render)
  useEffect(() => {
    onFilterChange(filteredTransactions);
  }, [filteredTransactions, onFilterChange]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  const selectAllCategories = () => {
    setSelectedCategories(new Set(allCategories));
  };

  const clearAllCategories = () => {
    setSelectedCategories(new Set());
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories(new Set());
    setAmountRange(null);
    setDateRange(null);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedCategories.size > 0) count++;
    if (amountRange) count++;
    if (dateRange) count++;
    return count;
  }, [searchTerm, selectedCategories, amountRange, dateRange]);

  const colorClass = type === 'credits' ? 'emerald' : 'blue';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 hover:bg-${colorClass}-50 dark:hover:bg-${colorClass}-900/20 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Sliders size={18} className={`text-${colorClass}-600 dark:text-${colorClass}-400`} />
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Advanced Filters
            </h3>
            <p className="text-xs text-slate-500">
              {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'No filters applied'}
              {' • '}
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetAllFilters();
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={14} className="text-slate-500" />
            </button>
          )}
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Search size={14} />
              Search Transactions
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, category, or amount..."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Tag size={14} />
              Categories
              {selectedCategories.size > 0 && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">
                  {selectedCategories.size} selected
                </span>
              )}
            </label>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">
                {selectedCategories.size === 0
                  ? 'All categories'
                  : selectedCategories.size === 1
                  ? Array.from(selectedCategories)[0]
                  : `${selectedCategories.size} categories selected`}
              </span>
              <ChevronDown size={16} />
            </button>

            {showCategoryDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex gap-2">
                  <button
                    onClick={selectAllCategories}
                    className="flex-1 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllCategories}
                    className="flex-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    Clear All
                  </button>
                </div>
                <div className="p-2 space-y-1">
                  {allCategories.map((category) => {
                    const isSelected = selectedCategories.has(category);
                    const count = transactions.filter(t => t.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-blue-600" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                        <span className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300">
                          {category}
                        </span>
                        <span className="text-xs text-slate-500">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Amount Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <DollarSign size={14} />
              Amount Range
              <button
                onClick={() => setShowAmountFilter(!showAmountFilter)}
                className="ml-auto text-blue-600 hover:underline text-xs"
              >
                {showAmountFilter ? 'Hide' : 'Configure'}
              </button>
            </label>

            {showAmountFilter && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Min Amount</label>
                    <input
                      type="number"
                      value={amountRange?.min ?? amountBounds.min}
                      onChange={(e) =>
                        setAmountRange({
                          min: Number(e.target.value),
                          max: amountRange?.max ?? amountBounds.max,
                        })
                      }
                      className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      min={amountBounds.min}
                      max={amountBounds.max}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Max Amount</label>
                    <input
                      type="number"
                      value={amountRange?.max ?? amountBounds.max}
                      onChange={(e) =>
                        setAmountRange({
                          min: amountRange?.min ?? amountBounds.min,
                          max: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      min={amountBounds.min}
                      max={amountBounds.max}
                    />
                  </div>
                </div>
                {amountRange && (
                  <button
                    onClick={() => setAmountRange(null)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear amount filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Calendar size={14} />
              Date Range
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="ml-auto text-blue-600 hover:underline text-xs"
              >
                {showDateFilter ? 'Hide' : 'Configure'}
              </button>
            </label>

            {showDateFilter && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={dateRange?.start ?? dateBounds.start}
                      onChange={(e) =>
                        setDateRange({
                          start: e.target.value,
                          end: dateRange?.end ?? dateBounds.end,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={dateRange?.end ?? dateBounds.end}
                      onChange={(e) =>
                        setDateRange({
                          start: dateRange?.start ?? dateBounds.start,
                          end: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                {dateRange && (
                  <button
                    onClick={() => setDateRange(null)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear date filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Filtered Results:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {filteredTransactions.length} / {transactions.length} transactions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
