'use client';

import { type ReactNode, type LucideIcon } from 'lucide-react';
import { Calendar, Filter, Search, FileDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// SAP FILTERS COMPONENT
// Consistent filter panel for analytics tools with search, dropdowns, and actions
// ═══════════════════════════════════════════════════════════════════════════════

export interface FilterSection {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
}

export interface SAPFiltersProps {
  sections: FilterSection[];
  actions?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success';
  }[];
}

export function SAPFilters({ sections, actions }: SAPFiltersProps) {
  return (
    <div className="w-full lg:w-[340px] lg:min-w-[340px] h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
      {/* Filter Sections */}
      {sections.map(section => {
        const Icon = section.icon || Filter;
        return (
          <div key={section.id}>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm mb-3">
              <Icon size={15} className="text-blue-500" />
              {section.label}
            </h3>
            {section.content}
          </div>
        );
      })}

      {/* Action Buttons */}
      {actions && actions.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {actions.map((action, idx) => {
            const Icon = action.icon || FileDown;
            const variantClass = getButtonVariantClass(action.variant);

            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${variantClass}`}
              >
                <Icon size={14} />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Filter Components (Pre-built common filters) ──────────────────────────────

export interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; badge?: string }[];
  placeholder?: string;
}

export function SelectFilter({ value, onChange, options, placeholder }: SelectFilterProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label} {opt.badge}
        </option>
      ))}
    </select>
  );
}

export interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchFilter({ value, onChange, placeholder = 'Search...' }: SearchFilterProps) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
      />
    </div>
  );
}

export interface MultiSelectFilterProps {
  label: string;
  options: { key: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const toggleOption = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {options.map(opt => (
          <label
            key={opt.key}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-all
              ${selected.includes(opt.key)
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.key)}
              onChange={() => toggleOption(opt.key)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export interface ToggleFilterProps {
  label: string;
  options: { key: string; label: string; icon?: LucideIcon }[];
  value: string;
  onChange: (value: string) => void;
}

export function ToggleFilter({ label, options, value, onChange }: ToggleFilterProps) {
  return (
    <div>
      <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = value === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`
                py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                ${isActive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              {Icon && <Icon size={13} />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Helper Functions ──────────────────────────────────────────────────────────

function getButtonVariantClass(variant?: 'primary' | 'secondary' | 'success'): string {
  switch (variant) {
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
    case 'success':
      return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm';
    case 'secondary':
    default:
      return 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300';
  }
}
