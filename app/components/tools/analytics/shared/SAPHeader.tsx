'use client';

import type { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { SAP_COLORS, SAP_GRADIENTS } from './sap-theme';

export interface ModeToggle {
  key: string;
  label: string;
  icon?: LucideIcon;
}

export interface KPICard {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  subtitle?: string;
  onClick?: () => void;
  active?: boolean;
  /** Strip variant only: delta vs prior period, e.g. "+2.1%" or "-0.4%". Rendered as a colored pill, not on the value itself. */
  delta?: string;
  deltaTrend?: 'up' | 'down';
}

export interface SAPHeaderProps {
  // Note: SAPHeader is OneTool's own shared tool header — the "SAP" prefix is legacy naming
  title: string;
  subtitle?: string;
  modes?: {
    label: string;
    options: ModeToggle[];
    value: string;
    onChange: (value: string) => void;
  }[];
  kpis?: KPICard[];
  actions?: ReactNode;
  compact?: boolean;
  sticky?: boolean;
  fullWidth?: boolean;
  /** 'strip' = borderless SAP/IBCS-style KPI strip (finance/biz design system): equal-width tiles,
   * vertical dividers only, values always neutral, optional delta pill. Max 5 KPIs, never wraps.
   * Default 'boxed' keeps the existing card-grid look used elsewhere. */
  kpiVariant?: 'boxed' | 'strip';
}

export function SAPHeader({ title, subtitle, modes, kpis, actions, compact = false, sticky = false, fullWidth = false, kpiVariant = 'boxed' }: SAPHeaderProps) {
  return (
    <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${fullWidth ? 'rounded-none' : compact ? 'rounded-xl' : 'rounded-2xl'} ${sticky ? 'sticky top-0 z-10' : ''}`}>
      {/* Header Content */}
      <div className={compact ? 'px-4 py-3' : 'px-6 py-5'}>
        {/* Title Section */}
        <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
          <div>
            <h1 className={kpiVariant === 'strip'
              ? `text-slate-900 dark:text-white font-semibold ${compact ? 'text-lg mb-0.5' : 'text-[28px] mb-1'}`
              : `font-black text-slate-900 dark:text-white ${compact ? 'text-lg mb-0.5' : 'text-2xl mb-1'}`}>{title}</h1>
            {subtitle && <p className={`text-slate-500 dark:text-slate-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Mode Toggles */}
        {modes && modes.length > 0 && (
          <div className={`flex flex-wrap gap-4 ${compact ? 'mb-2' : 'mb-4'}`}>
            {modes.map((mode) => (
              <div key={mode.label} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {mode.label}
                </span>
                <div className="flex gap-1 bg-slate-100 dark:bg-white/10 rounded-lg p-1">
                  {mode.options.map((option) => {
                    const Icon = option.icon;
                    const isActive = mode.value === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => mode.onChange(option.key)}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                              : 'text-slate-600 dark:text-white/90 hover:bg-slate-200 dark:hover:bg-white/20'
                          }
                        `}
                      >
                        {Icon && <Icon size={14} />}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPI Strip — SAP/IBCS style: borderless, equal-width, vertical dividers, neutral values */}
        {kpis && kpis.length > 0 && kpiVariant === 'strip' && (
          <div className="flex items-stretch divide-x divide-slate-200 dark:divide-slate-700 -mx-1">
            {kpis.slice(0, 5).map((kpi, index) => (
              <div
                key={index}
                onClick={kpi.onClick}
                className={`flex-1 min-w-0 px-4 first:pl-1 last:pr-1 ${kpi.onClick ? 'cursor-pointer' : ''}`}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-500 dark:text-slate-400 truncate">
                  {kpi.label}
                </p>
                <p className="text-[30px] leading-tight font-semibold text-neutral-value truncate">
                  {kpi.value}
                </p>
                {kpi.delta && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${kpi.deltaTrend === 'down' ? 'text-negative' : 'text-positive'}`}>
                    {kpi.deltaTrend === 'down' ? '▼' : '▲'} {kpi.delta}
                  </span>
                )}
                {kpi.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{kpi.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        {kpis && kpis.length > 0 && kpiVariant === 'boxed' && (
          <div className={getKPIGridClass(kpis.length, compact)}>
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              const colorClass = getKPIColorClass(kpi.color);

              return (
                <div
                  key={index}
                  onClick={kpi.onClick}
                  className={`rounded-lg border transition-colors ${compact ? 'p-2.5' : 'p-4 rounded-xl'} ${kpi.onClick ? 'cursor-pointer' : ''} ${kpi.active ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/15'}`}
                >
                  <div className={`flex items-start justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
                    <p className={`font-semibold uppercase tracking-wider leading-tight ${compact ? 'text-[10px] min-h-[1.5em]' : 'text-xs min-h-[2em]'} ${kpi.active ? 'text-white/70 dark:text-slate-500' : 'text-slate-500 dark:text-white/70'}`}>
                      {kpi.label}
                    </p>
                    {Icon && <Icon size={compact ? 13 : 16} className={kpi.active ? 'text-white/60 dark:text-slate-400' : 'text-slate-400 dark:text-white/60'} />}
                  </div>
                  <p className={`font-black ${compact ? 'text-lg mb-0' : 'text-2xl mb-0.5'} ${kpi.active ? 'text-white dark:text-slate-900' : colorClass}`}>
                    {kpi.value}
                  </p>
                  {kpi.subtitle && (
                    <p className={`font-medium ${compact ? 'text-[10px]' : 'text-xs'} ${kpi.active ? 'text-white/60 dark:text-slate-500' : 'text-slate-400 dark:text-white/60'}`}>{kpi.subtitle}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Picks a grid column count that exactly fits the number of KPI cards, so the
// row never leaves empty trailing columns (which made it look narrower than
// the content below it).
function getKPIGridClass(count: number, compact: boolean): string {
  if (compact) return 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2';
  if (count <= 4) return 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3';
  if (count === 5) return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3';
  return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3';
}

// Helper function to get KPI color classes
function getKPIColorClass(color?: KPICard['color']): string {
  switch (color) {
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'primary':
      return 'text-blue-600 dark:text-blue-400';
    case 'neutral':
    default:
      return 'text-slate-900 dark:text-white';
  }
}

// ── Compact variant ───────────────────────────────────────────────────────────

export interface CompactSAPHeaderProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export function CompactSAPHeader({ title, value, subtitle, icon: Icon }: CompactSAPHeaderProps) {
  return (
    <div
      className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-4 shadow-md"
      style={{ background: SAP_GRADIENTS.primary }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-black text-white">{value}</p>
          {subtitle && <p className="text-sm text-white/80 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Icon size={32} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
