export type ToolCategory = 'finance' | 'developer' | 'health' | 'documents' | 'converters' | 'ai' | 'design' | 'productivity' | 'writing' | 'default';

export const THEME_CONFIG: Record<ToolCategory, {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  border: string;
}> = {
  finance: {
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-emerald-600 dark:text-emerald-400",
    accent: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "from-blue-600 to-emerald-500",
    bgGradient: "from-blue-50/50 via-white to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-blue-500 to-emerald-500",
    border: "group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50",
  },
  developer: {
    primary: "text-violet-600 dark:text-violet-400",
    secondary: "text-fuchsia-600 dark:text-fuchsia-400",
    accent: "bg-violet-100 dark:bg-violet-900/30",
    gradient: "from-violet-600 to-fuchsia-500",
    bgGradient: "from-violet-50/50 via-white to-fuchsia-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    border: "group-hover:border-violet-500/50 dark:group-hover:border-violet-400/50",
  },
  health: {
    primary: "text-teal-600 dark:text-teal-400",
    secondary: "text-orange-500 dark:text-orange-400",
    accent: "bg-teal-100 dark:bg-teal-900/30",
    gradient: "from-teal-500 to-orange-400",
    bgGradient: "from-teal-50/50 via-white to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-teal-400 to-orange-400",
    border: "group-hover:border-teal-500/50 dark:group-hover:border-teal-400/50",
  },
  documents: {
    primary: "text-slate-700 dark:text-slate-300",
    secondary: "text-indigo-600 dark:text-indigo-400",
    accent: "bg-slate-100 dark:bg-slate-800",
    gradient: "from-slate-700 to-indigo-600",
    bgGradient: "from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-slate-600 to-indigo-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
  },
  converters: {
    primary: "text-amber-600 dark:text-amber-400",
    secondary: "text-rose-600 dark:text-rose-400",
    accent: "bg-amber-100 dark:bg-amber-900/30",
    gradient: "from-amber-500 to-rose-500",
    bgGradient: "from-amber-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-amber-500 to-rose-500",
    border: "group-hover:border-amber-500/50 dark:group-hover:border-amber-400/50",
  },
  ai: {
    primary: "text-indigo-600 dark:text-indigo-400",
    secondary: "text-purple-600 dark:text-purple-400",
    accent: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    bgGradient: "from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
  },
  design: {
    primary: "text-pink-600 dark:text-pink-400",
    secondary: "text-rose-600 dark:text-rose-400",
    accent: "bg-pink-100 dark:bg-pink-900/30",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    border: "group-hover:border-pink-500/50 dark:group-hover:border-pink-400/50",
  },
  productivity: {
    primary: "text-sky-600 dark:text-sky-400",
    secondary: "text-cyan-600 dark:text-cyan-400",
    accent: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-500 to-cyan-500",
    bgGradient: "from-sky-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-sky-500 to-cyan-500",
    border: "group-hover:border-sky-500/50 dark:group-hover:border-sky-400/50",
  },
  writing: {
    primary: "text-gray-700 dark:text-gray-300",
    secondary: "text-gray-900 dark:text-white",
    accent: "bg-gray-100 dark:bg-gray-800",
    gradient: "from-gray-700 to-gray-900",
    bgGradient: "from-gray-50 via-white to-gray-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-gray-600 to-gray-800",
    border: "group-hover:border-gray-400/50 dark:group-hover:border-gray-500/50",
  },
  default: {
    primary: "text-slate-900 dark:text-white",
    secondary: "text-slate-600 dark:text-slate-400",
    accent: "bg-slate-100 dark:bg-slate-800",
    gradient: "from-slate-900 to-slate-700",
    bgGradient: "from-white to-slate-50 dark:from-slate-950 dark:to-slate-900",
    iconBg: "bg-slate-900",
    border: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
  },
};

export function getTheme(category: string) {
  const normalizedCategory = category?.toLowerCase() as ToolCategory;
  return THEME_CONFIG[normalizedCategory] || THEME_CONFIG.default;
}
