export type ToolCategory = 'finance' | 'developer' | 'health' | 'documents' | 'converters' | 'ai' | 'design' | 'productivity' | 'writing' | 'default';

export const THEME_CONFIG: Record<ToolCategory, {
  primary: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  border: string;
  shadow: string;
}> = {
  finance: {
    primary: "text-[#4a6b61]",
    gradient: "from-emerald-600 to-teal-500",
    bgGradient: "from-emerald-50/50 via-white to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    border: "group-hover:border-[#638c80]/50 dark:group-hover:border-emerald-400/50",
    shadow: "group-hover:shadow-emerald-500/20 dark:group-hover:shadow-emerald-500/10"
  },
  developer: {
    primary: "text-violet-600",
    gradient: "from-violet-600 to-fuchsia-500",
    bgGradient: "from-violet-50/50 via-white to-fuchsia-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    border: "group-hover:border-violet-500/50 dark:group-hover:border-violet-400/50",
    shadow: "group-hover:shadow-violet-500/20 dark:group-hover:shadow-violet-500/10"
  },
  health: {
    primary: "text-teal-600",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-teal-400 to-cyan-500",
    border: "group-hover:border-teal-500/50 dark:group-hover:border-teal-400/50",
    shadow: "group-hover:shadow-teal-500/20 dark:group-hover:shadow-teal-500/10"
  },
  documents: {
    primary: "text-indigo-600",
    gradient: "from-indigo-600 to-blue-500",
    bgGradient: "from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
    shadow: "group-hover:shadow-indigo-500/20 dark:group-hover:shadow-indigo-500/10"
  },
  converters: {
    primary: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50/50 via-white to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    border: "group-hover:border-amber-500/50 dark:group-hover:border-amber-400/50",
    shadow: "group-hover:shadow-amber-500/20 dark:group-hover:shadow-amber-500/10"
  },
  ai: {
    primary: "text-fuchsia-600",
    gradient: "from-fuchsia-600 to-pink-500",
    bgGradient: "from-fuchsia-50/50 via-white to-pink-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
    border: "group-hover:border-fuchsia-500/50 dark:group-hover:border-fuchsia-400/50",
    shadow: "group-hover:shadow-fuchsia-500/20 dark:group-hover:shadow-fuchsia-500/10"
  },
  design: {
    primary: "text-pink-600",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    border: "group-hover:border-pink-500/50 dark:group-hover:border-pink-400/50",
    shadow: "group-hover:shadow-pink-500/20 dark:group-hover:shadow-pink-500/10"
  },
  productivity: {
    primary: "text-sky-600",
    gradient: "from-sky-500 to-blue-500",
    bgGradient: "from-sky-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-500",
    border: "group-hover:border-sky-500/50 dark:group-hover:border-sky-400/50",
    shadow: "group-hover:shadow-sky-500/20 dark:group-hover:shadow-sky-500/10"
  },
  writing: {
    primary: "text-gray-600",
    gradient: "from-gray-700 to-gray-900",
    bgGradient: "from-gray-50 via-white to-gray-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-gray-600 to-gray-800",
    border: "group-hover:border-gray-400/50 dark:group-hover:border-gray-500/50",
    shadow: "group-hover:shadow-gray-500/20 dark:group-hover:shadow-gray-500/10"
  },
  default: {
    primary: "text-slate-900",
    gradient: "from-slate-900 to-slate-700",
    bgGradient: "from-white to-slate-50 dark:from-slate-950 dark:to-slate-900",
    iconBg: "bg-slate-900",
    border: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
    shadow: "group-hover:shadow-slate-500/20 dark:group-hover:shadow-slate-500/10"
  },
};

export function getTheme(category: string) {
  const normalizedCategory = category?.toLowerCase() as ToolCategory;
  return THEME_CONFIG[normalizedCategory] || THEME_CONFIG.default;
}
