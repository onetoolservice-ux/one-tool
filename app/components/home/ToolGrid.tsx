'use client';

import React, { useMemo, memo, useState } from 'react';
import { ALL_TOOLS, CATEGORY_ORDER } from '@/app/lib/tools-data';
import { getCategoryMeta } from '@/app/lib/category-config';
import { SPACE_CONFIGS, type TierDef } from '@/app/lib/space-config';
import { fuzzySearch } from '@/app/lib/search-utils';
import { Search, ChevronDown } from 'lucide-react';
import { ToolCard } from './ToolCard';

interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  href: string;
  icon_name?: string;
  color?: string;
  popular?: boolean;
}

const transformTool = (tool: any): Tool => ({
  id: tool.id,
  name: tool.name,
  description: tool.desc || tool.description,
  category: tool.category,
  href: tool.href,
  icon_name: typeof tool.icon === 'string' ? tool.icon : undefined,
  color: tool.color,
  popular: tool.popular || false,
});

const ALL_TRANSFORMED = ALL_TOOLS.map(transformTool);

// ── Tool grid row ─────────────────────────────────────────────────────────────
function ToolRow({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
      {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
    </div>
  );
}

// ── Subsection (Tier) ─────────────────────────────────────────────────────────
interface SubsectionProps {
  tier: TierDef;
  tools: Tool[];
  defaultOpen?: boolean;
}

function Subsection({ tier, tools, defaultOpen = true }: SubsectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (tools.length === 0) return null;

  return (
    // ② Left accent line — visual nesting indicator
    <div className="mb-1 border-l-2 border-slate-100 dark:border-white/[0.06] ml-2 pl-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="
          w-full flex items-center gap-2 px-3 py-1.5 rounded-lg
          hover:bg-slate-50 dark:hover:bg-white/[0.03]
          transition-colors group text-left
        "
      >
        {/* Chevron */}
        <span className="text-slate-300 dark:text-slate-600 flex-shrink-0 transition-transform duration-150" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown size={11} />
        </span>

        {/* Label */}
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
          {tier.label}
        </span>

        {/* Badge */}
        {tier.badge && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--ot-accent,#6366f1)]/10 text-[var(--ot-accent,#6366f1)]">
            {tier.badge}
          </span>
        )}

        {/* Tool count */}
        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 tabular-nums">
          {tools.length}
        </span>

        {/* Description — hint when collapsed */}
        {!open && tier.desc && (
          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate ml-1 hidden md:block italic">
            {tier.desc}
          </span>
        )}
      </button>

      {/* Tools */}
      {open && (
        <div className="pl-7 pr-1 pb-3 pt-1">
          <ToolRow tools={tools} />
        </div>
      )}
    </div>
  );
}

// ── Section (Category) ────────────────────────────────────────────────────────
interface SectionProps {
  category: string;
  tools: Tool[];
  defaultOpen?: boolean;
}

function Section({ category, tools, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = getCategoryMeta(category);
  const Icon = meta.Icon;

  const spaceConfig = SPACE_CONFIGS.find(c => c.category === category);
  const tiers = spaceConfig?.tiers;

  const subsections: { tier: TierDef; tools: Tool[] }[] = useMemo(() => {
    if (!tiers) return [];
    return tiers.map(tier => ({
      tier,
      tools: tier.tools
        .map(id => tools.find(t => t.id === id))
        .filter(Boolean) as Tool[],
    })).filter(s => s.tools.length > 0);
  }, [tiers, tools]);

  const tieredIds = useMemo(() => new Set(tiers?.flatMap(t => t.tools) ?? []), [tiers]);
  const untieredTools = tools.filter(t => !tieredIds.has(t.id));

  const totalCount = tools.length;

  return (
    // ⑤ No overflow-hidden on section — allows sticky header inside
    <section
      id={`section-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      className="bg-white dark:bg-[#151827] rounded-xl border border-slate-200 dark:border-white/[0.06]"
    >
      {/* ── Section header — ⑤ sticky ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="
          w-full flex items-center gap-3 px-4 py-3
          bg-slate-50 dark:bg-[#1a1d2e]
          border-b border-slate-200 dark:border-white/[0.07]
          hover:bg-slate-100 dark:hover:bg-white/[0.05]
          transition-colors text-left
          rounded-t-xl
        "
      >
        {/* Collapse chevron */}
        <span className="text-slate-400 flex-shrink-0 transition-transform duration-150" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown size={14} />
        </span>

        {/* ① Emoji from space-config */}
        {spaceConfig?.emoji && (
          <span className="text-[16px] leading-none flex-shrink-0 select-none">
            {spaceConfig.emoji}
          </span>
        )}

        {/* Category name */}
        <h2 className="text-[15px] font-bold flex-1 text-slate-900 dark:text-white tracking-tight">
          {category}
        </h2>

        {/* Tool count */}
        <span className="text-[11px] font-normal text-slate-900 dark:text-white opacity-40 tabular-nums">
          {totalCount} tools
        </span>
      </button>

      {/* ── Section body ──────────────────────────────────────────────────── */}
      {open && (
        <div className="p-3 rounded-b-xl overflow-hidden">
          {subsections.length > 0 ? (
            <div className="space-y-1">
              {subsections.map((s, i) => (
                <Subsection
                  key={s.tier.id}
                  tier={s.tier}
                  tools={s.tools}
                  defaultOpen={true}
                />
              ))}
              {untieredTools.length > 0 && (
                <div className="pt-2">
                  <ToolRow tools={untieredTools} />
                </div>
              )}
            </div>
          ) : (
            <ToolRow tools={tools} />
          )}
        </div>
      )}
    </section>
  );
}

// ── Main ToolGrid ─────────────────────────────────────────────────────────────
export const ToolGrid = memo(({
  searchQuery,
  categoryFilter,
}: {
  searchQuery?: string;
  categoryFilter?: string;
}) => {

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return null;
    const searchable = ALL_TRANSFORMED.map(t => ({ ...t, title: t.name }));
    const results = fuzzySearch(searchable, searchQuery, ['title', 'category']);
    return results.map(r => ALL_TRANSFORMED.find(t => t.id === r.id)!).filter(Boolean);
  }, [searchQuery]);

  const sections = useMemo(() => {
    return CATEGORY_ORDER.map(cat => ({
      category: cat,
      tools: ALL_TRANSFORMED.filter(t => t.category === cat),
    }))
      .filter(s => s.tools.length > 0)
      .filter(s => {
        if (!categoryFilter) return true;
        const slug = s.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filterSlug = categoryFilter.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (slug === filterSlug) return true;
        if (s.category.toLowerCase() === categoryFilter.replace(/-/g, ' ')) return true;
        return false;
      });
  }, [categoryFilter]);

  if (searchResults !== null) {
    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <Search className="text-slate-400" size={20} />
          </div>
          <h3 className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">No tools found</h3>
          <p className="text-[12px] text-slate-400 mt-1">No results for &ldquo;{searchQuery}&rdquo;</p>
        </div>
      );
    }
    return (
      <div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
          <strong className="text-slate-600 dark:text-slate-300">{searchResults.length}</strong>{' '}
          result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
        </p>
        <ToolRow tools={searchResults} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map(({ category, tools }, i) => (
        <Section
          key={category}
          category={category}
          tools={tools}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
});

ToolGrid.displayName = 'ToolGrid';
