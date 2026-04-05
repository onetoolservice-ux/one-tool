'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL EMPTY STATE
// Consistent zero-data card shown when a tool has no data yet.
//
// Full variant  — first-time onboarding: shows icon, description, numbered steps, CTA
// Compact variant (compact=true) — filter/period empty: smaller, no steps, just message
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmptyStateStep {
  label: string;
  detail?: string;
}

export interface ToolEmptyStateProps {
  icon: LucideIcon;
  iconColorClass?: string;   // e.g. "text-blue-600 dark:text-blue-400"
  iconBgClass?: string;      // e.g. "bg-blue-100 dark:bg-blue-900/40"
  title: string;
  description: string;
  steps?: EmptyStateStep[];
  cta?: {
    label: string;
    onClick: () => void;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  compact?: boolean;
}

export function ToolEmptyState({
  icon: Icon,
  iconColorClass = 'text-slate-500 dark:text-slate-400',
  iconBgClass = 'bg-slate-100 dark:bg-slate-800',
  title,
  description,
  steps,
  cta,
  secondaryCta,
  compact = false,
}: ToolEmptyStateProps) {
  if (compact) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-6 text-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${iconBgClass}`}>
          <Icon size={20} className={iconColorClass} />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{description}</p>
        {secondaryCta && (
          <Link
            href={secondaryCta.href}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {secondaryCta.label} →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${iconBgClass}`}>
        <Icon size={28} className={iconColorClass} />
      </div>

      {/* Title + description */}
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>

      {/* Steps */}
      {steps && steps.length > 0 && (
        <div className="text-left max-w-xs mx-auto space-y-3 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{step.label}</p>
                {step.detail && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col items-center gap-2">
        {cta && (
          <button
            onClick={cta.onClick}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            {cta.label}
          </button>
        )}
        {secondaryCta && (
          <Link
            href={secondaryCta.href}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {secondaryCta.label} →
          </Link>
        )}
      </div>
    </div>
  );
}
