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
}

export function SAPHeader({ title, subtitle, modes, kpis, actions, compact = false }: SAPHeaderProps) {
  return (
    <div className={`bg-gradient-to-r from-[#0070F3] via-[#005DD1] to-[#0053B8] rounded-2xl shadow-lg overflow-hidden ${compact ? 'rounded-xl' : 'rounded-2xl'}`}>
      {/* Header Content */}
      <div className={compact ? 'px-4 py-3' : 'px-6 py-5'}>
        {/* Title Section */}
        <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
          <div>
            <h1 className={`font-black text-white ${compact ? 'text-lg mb-0.5' : 'text-2xl mb-1'}`}>{title}</h1>
            {subtitle && <p className={`text-white/80 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Mode Toggles */}
        {modes && modes.length > 0 && (
          <div className={`flex flex-wrap gap-4 ${compact ? 'mb-2' : 'mb-4'}`}>
            {modes.map((mode) => (
              <div key={mode.label} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  {mode.label}
                </span>
                <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
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
                              ? 'bg-white text-[#0070F3] shadow-md'
                              : 'text-white/90 hover:bg-white/20'
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
                  className={`bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/15 transition-colors ${compact ? 'p-2.5' : 'p-4 rounded-xl'}`}
                >
                  <div className={`flex items-start justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
                    <p className={`font-semibold text-white/70 uppercase tracking-wider ${compact ? 'text-[10px]' : 'text-xs'}`}>
                      {kpi.label}
                    </p>
                    {Icon && <Icon size={compact ? 13 : 16} className="text-white/60" />}
                  </div>
                  <p className={`font-black ${colorClass} ${compact ? 'text-lg mb-0' : 'text-2xl mb-0.5'}`}>
                    {kpi.value}
                  </p>
                  {kpi.subtitle && (
                    <p className={`text-white/60 font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>{kpi.subtitle}</p>
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
      return 'text-green-300';
    case 'warning':
      return 'text-amber-300';
    case 'error':
      return 'text-red-300';
    case 'primary':
      return 'text-blue-300';
    case 'neutral':
    default:
      return 'text-white';
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
      className="bg-gradient-to-r from-[#0070F3] to-[#0053B8] rounded-xl p-4 shadow-md"
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
