import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { ToolCard } from '@/app/components/home/ToolCard';
import { getSpaceConfig, type TierDef, type CategorySpaceConfig } from '@/app/lib/space-config';
import { SpaceTracker } from '@/app/components/shared/SpaceTracker';
import { getCategoryMeta } from '@/app/lib/category-config';

// Static generation — these pages depend only on compile-time constants
export const dynamic = 'force-static';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveTiers(config: CategorySpaceConfig): TierDef[] {
  if (config.tiers && config.tiers.length > 0) return config.tiers;
  const ids = ALL_TOOLS
    .filter(t => t.category === config.category)
    .map(t => t.id);
  return [{ id: 'all', label: 'All Tools', tools: ids }];
}

function getTool(id: string) {
  const t = ALL_TOOLS.find(x => x.id === id);
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    description: (t as any).desc ?? (t as any).description,
    category: t.category,
    href: (t as any).href ?? `/tools/${t.category.toLowerCase().replace(/ /g, '-')}/${t.id}`,
    icon_name: typeof t.icon === 'string' ? t.icon : undefined,
    color: (t as any).color,
    popular: (t as any).popular ?? false,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SpacePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const config = getSpaceConfig(category);
  if (!config) notFound();

  const tiers = resolveTiers(config);
  const hasSections = tiers.length > 1;
  const totalTools = ALL_TOOLS.filter(t => t.category === config.category).length;
  const meta = getCategoryMeta(config.category);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]">
      {/* Sets "returning user" flag — triggers compact landing on next visit */}
      <SpaceTracker />

      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-10">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-5">
          <Link href="/home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            All Tools
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">{config.category}</span>
        </nav>

        {/* ── Space header ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.sectionIconBg}`}>
              <meta.Icon size={20} className={meta.sectionIconText} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {config.category}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 tabular-nums align-middle">
                  {totalTools} {totalTools === 1 ? 'tool' : 'tools'}
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                {config.desc}
              </p>
            </div>
          </div>
        </div>

        {/* ── Sections ────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {tiers.map(tier => {
            const tools = tier.tools.map(getTool).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[];
            if (tools.length === 0) return null;

            return (
              <section key={tier.id}>

                {/* Section header */}
                {hasSections && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        {tier.label}
                      </span>
                      {tier.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.07]" />
                    {tier.desc && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:block max-w-xs text-right">
                        {tier.desc}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {tools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>

              </section>
            );
          })}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            All data stays in your browser — nothing is sent to any server.
          </p>
          <Link
            href={`/home?category=${encodeURIComponent(config.category.toLowerCase().replace(/ /g, '-'))}`}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View in catalog →
          </Link>
        </div>

      </div>
    </div>
  );
}
