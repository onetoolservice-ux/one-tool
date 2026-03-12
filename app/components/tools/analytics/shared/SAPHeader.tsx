'use client';

import { type ReactNode, type LucideIcon } from 'lucide-react';
import { SAP_COLORS, SAP_GRADIENTS } from './sap-theme';

// ═══════════════════════════════════════════════════════════════════════════════
// SAP HEADER COMPONENT
// Professional enterprise header with SAP blue gradient, mode toggles, and KPI cards
// ═══════════════════════════════════════════════════════════════════════════════

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
}

export interface SAPHeaderProps {
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
}

export function SAPHeader({ title, subtitle, modes, kpis, actions, compact = false, sticky = false, fullWidth = false }: SAPHeaderProps) {
  return (
    <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${fullWidth ? 'rounded-none' : compact ? 'rounded-xl' : 'rounded-2xl'} ${sticky ? 'sticky top-0 z-10' : ''}`}>
      {/* Header Content */}
      <div className={compact ? 'px-4 py-3' : 'px-6 py-5'}>
        {/* Title Section */}
        <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
          <div>
            <h1 className={`font-black text-slate-900 dark:text-white ${compact ? 'text-lg mb-0.5' : 'text-2xl mb-1'}`}>{title}</h1>
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

        {/* KPI Cards */}
        {kpis && kpis.length > 0 && (
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${compact ? 'lg:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-6 gap-3'}`}>
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
                    <p className={`font-semibold uppercase tracking-wider ${compact ? 'text-[10px]' : 'text-xs'} ${kpi.active ? 'text-white/70 dark:text-slate-500' : 'text-slate-500 dark:text-white/70'}`}>
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

// ── Compact Header Variant ────────────────────────────────────────────────────

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
