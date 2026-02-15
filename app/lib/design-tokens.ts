/**
 * Design Tokens
 * 
 * Centralized design system tokens for consistent styling across the platform
 * Professional, clean, minimal design language
 */

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',  // 48px
} as const;

export const borderRadius = {
  sm: '0.375rem',  // rounded (6px)
  md: '0.5rem',    // rounded-lg (8px)
  lg: '0.75rem',   // rounded-xl (12px)
  xl: '1rem',      // rounded-2xl (16px)
  '2xl': '1.5rem', // rounded-3xl (24px)
  full: '9999px',  // rounded-full
} as const;

export const colors = {
  // Primary brand colors
  primary: {
    // Using SAP-like Fiori primary
    DEFAULT: '#0a6ed1',
    light: '#e9f2ff',
    dark: '#083b78',
    hover: '#085fc0',
    text: '#0a6ed1',
    bg: '#e9f2ff',
  },
  // Secondary/accent colors
  secondary: {
    DEFAULT: 'emerald-600',
    light: 'emerald-50',
    dark: 'emerald-900',
    hover: 'emerald-700',
    text: 'emerald-600',
    bg: 'emerald-50',
  },
  // Semantic colors
  success: {
    DEFAULT: 'emerald-600',
    light: 'emerald-50',
    dark: 'emerald-900',
    text: 'emerald-600',
    bg: 'emerald-50',
  },
  danger: {
    DEFAULT: 'red-600',
    light: 'red-50',
    dark: 'red-900',
    hover: 'red-700',
    text: 'red-600',
    bg: 'red-50',
  },
  warning: {
    DEFAULT: 'amber-600',
    light: 'amber-50',
    dark: 'amber-900',
    text: 'amber-600',
    bg: 'amber-50',
  },
  info: {
    DEFAULT: 'blue-600',
    light: 'blue-50',
    dark: 'blue-900',
    text: 'blue-600',
    bg: 'blue-50',
  },
  // Neutral colors
  neutral: {
    DEFAULT: 'slate-600',
    light: 'slate-100',
    dark: 'slate-800',
    text: 'slate-600',
    bg: 'slate-50',
  },
  // Background colors
  bg: {
    light: 'white',
    dark: 'slate-900',
    muted: 'slate-50',
    'muted-dark': 'slate-800',
  },
  // Border colors
  border: {
    light: 'slate-200',
    dark: 'slate-700',
    focus: 'indigo-500',
  },
} as const;

export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

export const transitions = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

/**
 * Get Tailwind class names for design tokens
 * These return the actual Tailwind classes that should be used in components
 */
export const tokens = {
  // Spacing utilities
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  // Border radius utilities
  borderRadius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    full: 'rounded-full',
  },
  // Focus ring utilities (for accessibility)
  focus: {
    // Use Fiori primary for focus rings (arbitrary value to match HEX)
    ring: 'focus:outline-none focus:ring-2 focus:ring-[#0a6ed1] focus:ring-offset-2',
    ringSubtle: 'focus:outline-none focus:ring-2 focus:ring-[#0a6ed1]/20',
    border: 'focus:border-[#0a6ed1]',
  },
} as const;

/**
 * Component size variants
 */
export const sizes = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    height: 'h-8',
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-sm',
    height: 'h-10',
  },
  lg: {
    padding: 'px-6 py-3',
    fontSize: 'text-base',
    height: 'h-12',
  },
} as const;
