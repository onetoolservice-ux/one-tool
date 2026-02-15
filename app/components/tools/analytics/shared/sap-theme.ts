// ═══════════════════════════════════════════════════════════════════════════════
// SAP THEME CONSTANTS
// Professional color palette, spacing, and chart configurations for SAP-style
// analytics dashboards. Includes light and dark mode variants.
// ═══════════════════════════════════════════════════════════════════════════════

// ── SAP Color Palette ─────────────────────────────────────────────────────────

export const SAP_COLORS = {
  // Primary blues (SAP signature color)
  primary: '#0070F3',
  primaryDark: '#0053B8',
  primaryLight: '#84B2FF',
  primaryHover: '#005DD1',

  // Semantic colors
  success: '#107E3E',      // SAP Green
  successLight: '#30A46C',
  warning: '#E76500',      // SAP Orange
  warningLight: '#FF8E3C',
  error: '#BB0000',        // SAP Red
  errorLight: '#E5484D',
  info: '#427CAC',         // SAP Info Blue
  infoLight: '#52A9FF',

  // Neutrals for light mode
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

  // Dark mode specific
  darkBg: '#0F1419',
  darkPanel: '#1A1F2C',
  darkBorder: '#2D3748',
  darkText: '#E5E7EB',

  // Chart color palette (professional and accessible)
  chart: [
    '#0070F3', // SAP Blue
    '#107E3E', // SAP Green
    '#E76500', // SAP Orange
    '#6A1B9A', // Purple
    '#00838F', // Teal
    '#C62828', // Deep Red
    '#F9A825', // Amber
    '#5E35B1', // Deep Purple
    '#00695C', // Dark Teal
    '#F57C00', // Dark Orange
  ],

  // Category-specific colors (for financial data)
  category: {
    income: '#107E3E',
    expense: '#E76500',
    savings: '#0070F3',
    investment: '#6A1B9A',
    debt: '#BB0000',
    transfer: '#427CAC',
  },
};

// ── Spacing & Layout ──────────────────────────────────────────────────────────

export const SAP_SPACING = {
  // Card padding
  cardPadding: '1.25rem',      // 20px
  cardPaddingSm: '1rem',       // 16px
  cardPaddingLg: '1.5rem',     // 24px

  // Grid gaps
  gridGap: '1rem',             // 16px
  gridGapSm: '0.75rem',        // 12px
  gridGapLg: '1.5rem',         // 24px

  // Section spacing
  sectionGap: '1.5rem',        // 24px
  sectionGapLg: '2rem',        // 32px

  // Component spacing
  componentGap: '0.5rem',      // 8px
  componentGapSm: '0.25rem',   // 4px
};

// ── Typography ────────────────────────────────────────────────────────────────

export const SAP_TYPOGRAPHY = {
  // Font families
  fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontMono: '"Fira Code", "Cascadia Code", Consolas, Monaco, "Courier New", monospace',

  // Font sizes
  textXs: '0.625rem',   // 10px
  textSm: '0.75rem',    // 12px
  textBase: '0.875rem', // 14px
  textLg: '1rem',       // 16px
  textXl: '1.125rem',   // 18px
  text2Xl: '1.25rem',   // 20px
  text3Xl: '1.5rem',    // 24px

  // Font weights
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
  weightExtrabold: '800',
  weightBlack: '900',

  // Line heights
  leadingTight: '1.25',
  leadingNormal: '1.5',
  leadingRelaxed: '1.75',
};

// ── Border Radius ─────────────────────────────────────────────────────────────

export const SAP_RADIUS = {
  none: '0',
  sm: '0.25rem',      // 4px
  base: '0.5rem',     // 8px
  md: '0.75rem',      // 12px
  lg: '1rem',         // 16px
  xl: '1.25rem',      // 20px
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
  primary: 'linear-gradient(135deg, #0070F3 0%, #0053B8 100%)',
  success: 'linear-gradient(135deg, #107E3E 0%, #0C5E2E 100%)',
  warning: 'linear-gradient(135deg, #E76500 0%, #C75400 100%)',
  error: 'linear-gradient(135deg, #BB0000 0%, #8B0000 100%)',

  // Chart area gradients
  chartArea: 'linear-gradient(180deg, rgba(0, 112, 243, 0.2) 0%, rgba(0, 112, 243, 0.02) 100%)',
  chartAreaSuccess: 'linear-gradient(180deg, rgba(16, 126, 62, 0.2) 0%, rgba(16, 126, 62, 0.02) 100%)',
  chartAreaWarning: 'linear-gradient(180deg, rgba(231, 101, 0, 0.2) 0%, rgba(231, 101, 0, 0.02) 100%)',
};

// ── Recharts Configuration ────────────────────────────────────────────────────

export const SAP_CHART_CONFIG = {
  // Common chart props
  margin: { top: 10, right: 10, left: 0, bottom: 0 },

  // Grid
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

  // Axes
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

  // Tooltip
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: {
      color: '#1F2937',
      fontWeight: 600,
    },
  },

  tooltipDark: {
    contentStyle: {
      backgroundColor: '#1F2937',
      border: '1px solid #4B5563',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    },
    labelStyle: {
      color: '#E5E7EB',
      fontWeight: 600,
    },
  },

  // Legend
  legend: {
    iconSize: 12,
    wrapperStyle: {
      fontSize: '12px',
      paddingTop: '10px',
    },
  },

  // Bar chart
  bar: {
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },

  // Line chart
  line: {
    strokeWidth: 2.5,
    dot: { r: 4 },
    activeDot: { r: 6 },
  },

  // Area chart
  area: {
    strokeWidth: 2,
  },

  // Pie chart
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

// ── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Get chart color by index with wrapping
 */
export function getChartColor(index: number): string {
  return SAP_COLORS.chart[index % SAP_COLORS.chart.length];
}

/**
 * Get chart color with opacity
 */
export function getChartColorWithOpacity(index: number, opacity: number): string {
  const color = getChartColor(index);
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get category color
 */
export function getCategoryColor(category: keyof typeof SAP_COLORS.category): string {
  return SAP_COLORS.category[category] || SAP_COLORS.primary;
}

/**
 * Format currency value
 */
export function formatChartCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number with abbreviation (K, M, B)
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

/**
 * Format percentage
 */
export function formatChartPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
