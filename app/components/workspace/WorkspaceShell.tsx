'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getSpaceConfig } from '@/app/lib/space-config';
import { getCategoryMeta } from '@/app/lib/category-config';
import { getIcon } from '@/app/lib/utils/IconMapper';

export function WorkspaceShell({ slug, children }: { slug: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const config = getSpaceConfig(slug);
  if (!config) return <>{children}</>;

  const meta = getCategoryMeta(config.category);
  const allTiers = config.tiers ?? [];
  // Advanced tiers (back-office/less-frequent tools) stay collapsed until the
  // user opts in — keeps first-open sidebar to the handful of daily-use tools.
  const advancedTiers = allTiers.filter(t => t.advanced);
  const activeInAdvanced = advancedTiers.some(t =>
    t.tools.some(toolId => pathname === `/${slug}/${toolId}`),
  );
  const tiers = allTiers.filter(t => !t.advanced || showAdvanced || activeInAdvanced);

  return (
    <div
      className="flex bg-[#f5f6f8] dark:bg-[#0F111A] transition-colors duration-300"
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/* Fixed to the viewport so it never scrolls with the page; its own tool
          list scrolls internally if it's taller than the screen. Content gets
          a matching left margin below since this is out of normal flow. */}
      <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 fixed left-0 top-14 bottom-0 bg-white dark:bg-[#0d0f1a] border-r border-slate-200 dark:border-white/[0.05] overflow-y-auto custom-scrollbar">
        <div className="px-4 py-4 border-b border-slate-100 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.sectionIconBg}`}>
              <meta.Icon size={16} className={meta.sectionIconText} />
            </div>
            <span className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              {config.category}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-4">
          {tiers.map(tier => (
            <div key={tier.id}>
              <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {tier.label}
              </div>
              <div className="space-y-0.5">
                {tier.tools.map(toolId => {
                  const tool = ALL_TOOLS.find(t => t.id === toolId);
                  if (!tool) return null;
                  const href = `/${slug}/${tool.id}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={tool.id}
                      href={href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        active
                          ? meta.activeItem
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="flex-shrink-0">{getIcon(tool.icon, 14)}</span>
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {advancedTiers.length > 0 && !showAdvanced && !activeInAdvanced && (
            <button
              onClick={() => setShowAdvanced(true)}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <ChevronDown size={13} /> Show more tools
            </button>
          )}
        </nav>
      </aside>

      {/* ── Mobile top strip: workspace switcher only (full nav is desktop-only for now) ── */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-10 bg-white dark:bg-[#0d0f1a] border-b border-slate-200 dark:border-white/[0.05] px-3 py-2 flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${meta.sectionIconBg}`}>
          <meta.Icon size={13} className={meta.sectionIconText} />
        </div>
        <span className="text-[13px] font-bold text-slate-900 dark:text-white">{config.category}</span>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pt-10 md:pt-0 md:ml-[240px]">
        {children}
      </main>
    </div>
  );
}
