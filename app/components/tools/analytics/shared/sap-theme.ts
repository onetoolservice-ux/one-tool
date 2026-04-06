// ─────────────────────────────────────────────────────────────────────────────
// chart-theme — color palette, spacing, and chart config for OneTool dashboards
// ─────────────────────────────────────────────────────────────────────────────

// ── Color palette ─────────────────────────────────────────────────────────────

export const SAP_COLORS = {
  primary: '#6366f1',
  primaryDark: '#4338ca',
  primaryLight: '#a5b4fc',
  primaryHover: '#5254cc',

  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',

  gray50: '#F7F8FA',
  gray100: '#EAECF0',
  gray200: '#D1D5DB',
  gray300: '#9CA3AF',
  gray400: '#6B7280',
  gray500: '#4B5563',
  gray600: '#374151',
  gray700: '#1F2937',
  gray800: '#111827',
  gray900: '#0A0A0A',

  darkBg: '#0F1119',
  darkPanel: '#151827',
  darkBorder: '#1e2132',
  darkText: '#E5E7EB',

  chart: [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#3b82f6',
    '#06b6d4',
    '#ef4444',
    '#f97316',
    '#8b5cf6',
    '#14b8a6',
    '#ec4899',
  ],

  category: {
    income: '#10b981',
    expense: '#f59e0b',
    savings: '#6366f1',
    investment: '#8b5cf6',
    debt: '#ef4444',
    transfer: '#3b82f6',
  },
};

// ── Spacing ───────────────────────────────────────────────────────────────────

export const SAP_SPACING = {
  cardPadding: '1.25rem',
  cardPaddingSm: '1rem',
  cardPaddingLg: '1.5rem',
  gridGap: '1rem',
  gridGapSm: '0.75rem',
  gridGapLg: '1.5rem',
  sectionGap: '1.5rem',
  sectionGapLg: '2rem',
  componentGap: '0.5rem',
  componentGapSm: '0.25rem',
};

// ── Typography ────────────────────────────────────────────────────────────────

export const SAP_TYPOGRAPHY = {
  fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontMono: '"Fira Code", "Cascadia Code", Consolas, Monaco, "Courier New", monospace',
  textXs: '0.625rem',
  textSm: '0.75rem',
  textBase: '0.875rem',
  textLg: '1rem',
  textXl: '1.125rem',
  text2Xl: '1.25rem',
  text3Xl: '1.5rem',
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
  weightExtrabold: '800',
  weightBlack: '900',
  leadingTight: '1.25',
  leadingNormal: '1.5',
  leadingRelaxed: '1.75',
};

// ── Border radius ─────────────────────────────────────────────────────────────

export const SAP_RADIUS = {
  none: '0',
  sm: '0.25rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  full: '9999px',
};

// ── Shadows ───────────────────────────────────────────────────────────────────

export const SAP_SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// ── Gradients ─────────────────────────────────────────────────────────────────

export const SAP_GRADIENTS = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
  chartArea: 'linear-gradient(180deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.02) 100%)',
  chartAreaSuccess: 'linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.02) 100%)',
  chartAreaWarning: 'linear-gradient(180deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.02) 100%)',
};

// ── Recharts config ───────────────────────────────────────────────────────────

export const SAP_CHART_CONFIG = {
  margin: { top: 10, right: 10, left: 0, bottom: 0 },
  cartesianGrid: {
    strokeDasharray: '3 3',
    stroke: '#E5E7EB',
    strokeOpacity: 0.5,
  },
  cartesianGridDark: {
    strokeDasharray: '3 3',
    stroke: '#374151',
    strokeOpacity: 0.5,
  },
  xAxis: {
    tick: { fontSize: 11, fill: '#6B7280' },
    stroke: '#D1D5DB',
  },
  xAxisDark: {
    tick: { fontSize: 11, fill: '#9CA3AF' },
    stroke: '#4B5563',
  },
  yAxis: {
    tick: { fontSize: 11, fill: '#6B7280' },
    stroke: '#D1D5DB',
  },
  yAxisDark: {
    tick: { fontSize: 11, fill: '#9CA3AF' },
    stroke: '#4B5563',
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: { color: '#1F2937', fontWeight: 600 },
  },
  tooltipDark: {
    contentStyle: {
      backgroundColor: '#1F2937',
      border: '1px solid #4B5563',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    },
    labelStyle: { color: '#E5E7EB', fontWeight: 600 },
  },
  legend: {
    iconSize: 12,
    wrapperStyle: { fontSize: '12px', paddingTop: '10px' },
  },
  bar: {
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },
  line: {
    strokeWidth: 2.5,
    dot: { r: 4 },
    activeDot: { r: 6 },
  },
  area: {
    strokeWidth: 2,
  },
  pie: {
    outerRadius: 110,
    labelLine: true,
  },
};

// ── Breakpoints ───────────────────────────────────────────────────────────────

export const SAP_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getChartColor(index: number): string {
  return SAP_COLORS.chart[index % SAP_COLORS.chart.length];
}

export function getChartColorWithOpacity(index: number, opacity: number): string {
  const color = getChartColor(index);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getCategoryColor(category: keyof typeof SAP_COLORS.category): string {
  return SAP_COLORS.category[category] || SAP_COLORS.primary;
}

/** Format as Indian Rupees (₹) */
export function formatChartCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatChartNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatChartPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
