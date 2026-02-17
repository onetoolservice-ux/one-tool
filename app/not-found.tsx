import Link from 'next/link';
import { Home, AlertTriangle, Search, ArrowRight } from 'lucide-react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { getTheme } from '@/app/lib/theme-config';

// Keep force-dynamic to avoid build errors
export const dynamic = 'force-dynamic';

export default function NotFound() {
  const popularTools = ALL_TOOLS.filter(t => t.popular).slice(0, 6);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] text-gray-900 dark:text-white p-4">
      <div className="w-full max-w-lg">
        {/* Error icon */}
        <div className="text-center mb-8">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This page doesn&apos;t exist, but we have {ALL_TOOLS.length}+ tools that do.
          </p>
        </div>

        {/* Search bar — navigates to homepage with search param */}
        <form action="/" method="get" className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Search for a tool..."
            className="w-full rounded-xl py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white"
          />
        </form>

        {/* Popular tools */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Popular Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popularTools.map(tool => {
              const theme = getTheme(tool.category);
              const Icon = getIconComponent(tool.icon as IconName);
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${theme.iconBg}`}>
                    {Icon && <Icon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{tool.name}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{tool.category}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Return home */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all"
        >
          <Home size={18} />
          Browse All Tools
        </Link>
      </div>
    </div>
  );
}
