'use client';

import { type ReactNode } from 'react';
import { BarChart3, Loader } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// SAP CHART GRID COMPONENT
// Responsive grid container for displaying multiple charts in SAP-style layout
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChartConfig {
  id: string;
  title: string;
  subtitle?: string;
  chart: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  height?: number;  // Height in pixels
}

export interface SAPChartGridProps {
  charts: ChartConfig[];
  columns?: 1 | 2 | 3 | 4;  // Number of columns on large screens
}

export function SAPChartGrid({ charts, columns = 2 }: SAPChartGridProps) {
  const gridColsClass = getGridColsClass(columns);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-4`}>
      {charts.map((config) => (
        <ChartCard key={config.id} config={config} />
      ))}
    </div>
  );
}

// ── Chart Card Component ──────────────────────────────────────────────────────

function ChartCard({ config }: { config: ChartConfig }) {
  const { title, subtitle, chart, isLoading, isEmpty, emptyMessage, height = 300 } = config;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {isLoading ? (
          <LoadingState height={height} />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage} height={height} />
        ) : (
          <div style={{ height: `${height}px` }}>
            {chart}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading State ─────────────────────────────────────────────────────────────

function LoadingState({ height }: { height: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <Loader size={32} className="text-blue-500 animate-spin mb-3" />
      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
        Loading chart data...
      </p>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ message, height }: { message?: string; height: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 mb-3">
        <BarChart3 size={32} className="text-slate-400 dark:text-slate-500" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {message || 'No data available'}
      </p>
    </div>
  );
}

// ── Helper Functions ──────────────────────────────────────────────────────────

function getGridColsClass(columns: number): string {
  switch (columns) {
    case 1:
      return 'lg:grid-cols-1';
    case 2:
      return 'lg:grid-cols-2';
    case 3:
      return 'lg:grid-cols-3';
    case 4:
      return 'lg:grid-cols-4';
    default:
      return 'lg:grid-cols-2';
  }
}

// ── Single Chart Card (for standalone use) ────────────────────────────────────

export interface SingleChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  actions?: ReactNode;
  height?: number;
}

export function SingleChartCard({
  title,
  subtitle,
  children,
  isLoading,
  isEmpty,
  emptyMessage,
  actions,
  height = 300,
}: SingleChartCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header with Actions */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {isLoading ? (
          <LoadingState height={height} />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage} height={height} />
        ) : (
          <div style={{ height: `${height}px` }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
