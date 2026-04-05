import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { ToolCard } from '@/app/components/home/ToolCard';
import { getSpaceConfig, type TierDef, type CategorySpaceConfig } from '@/app/lib/space-config';
import { SpaceTracker } from '@/app/components/shared/SpaceTracker';

export const dynamic = 'force-dynamic';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveTiers(config: CategorySpaceConfig): TierDef[] {
  if (config.tiers && config.tiers.length > 0) return config.tiers;
  // Auto-populate: single flat tier from all tools in this category
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]">
      {/* Sets "returning user" flag — triggers compact landing on next visit */}
      <SpaceTracker />
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-10">

        {/* ── Space header ────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-2xl leading-none">{config.emoji}</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {config.category}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 tabular-nums">
              {totalTools} {totalTools === 1 ? 'tool' : 'tools'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {config.desc}
          </p>
        </div>

        {/* ── Sections ────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {tiers.map((tier, idx) => {
            const tools = tier.tools.map(getTool).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[];
            if (tools.length === 0) return null;

            return (
              <section key={tier.id}>

                {/* Section header */}
                {hasSections && (
                  <div className="flex items-center gap-2 mb-3">
                    {/* Label + i — left side together */}
                    <div className="relative group/info flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        {tier.label}
                      </span>
                      <button className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 text-[9px] font-bold flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-none">
                        i
                      </button>
                      {/* Tooltip */}
                      <div className="absolute left-0 top-7 w-64 p-3 bg-white dark:bg-[#1e2132] rounded-xl shadow-xl border border-slate-200 dark:border-white/[0.08] opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50">
                        {tier.desc && <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{tier.desc}</p>}
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.07]" />
                    {/* Badge */}
                    {tier.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex-shrink-0">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Tool grid
                    hero → 1-2 cols (command center emphasis)
                    default → matches catalog grid exactly */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {tools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>

              </section>
            );
          })}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            All data stays in your browser — nothing is sent to any server.
          </p>
          <Link
            href={`/home?search=${encodeURIComponent(config.category)}`}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View in catalog →
          </Link>
        </div>

      </div>
    </div>
  );
}
