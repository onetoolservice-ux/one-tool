'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getTheme } from '@/app/lib/theme-config';
import { getIconComponent, type IconName } from '@/app/lib/utils/IconMapper';
import { Pin, Info } from 'lucide-react';
import { isPinned, addPin, removePin } from '@/app/lib/home-store';
import { useToast } from '@/app/components/ui/ToastSystem';
import { TOOL_ICON_BG } from '@/app/lib/tool-icon-bg';

interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  href: string;
  icon_name?: string;
  color?: string;
  popular?: boolean;
  status?: string;
}

// ── Info tooltip — shows full description on hover/focus ─────────────────────
function InfoTooltip({ description }: { description: string }) {
  const [visible, setVisible] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // Close tooltip on outside click
  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        tipRef.current && !tipRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [visible]);

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="Tool description"
        className="
          p-1 rounded transition-colors duration-100
          text-slate-300 dark:text-slate-600
          hover:text-[var(--ot-accent,#6366f1)] dark:hover:text-[var(--ot-accent,#6366f1)]
        "
        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
      >
        <Info size={12} />
      </button>

      {visible && (
        <div
          ref={tipRef}
          role="tooltip"
          className="
            absolute bottom-full right-0 mb-1.5 z-50
            w-52 p-2.5 rounded-xl
            bg-white dark:bg-[#1e2132]
            border border-slate-200 dark:border-white/[0.1]
            shadow-xl shadow-black/10 dark:shadow-black/40
            text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed
            pointer-events-none
          "
        >
          {description}
          {/* Caret */}
          <span className="
            absolute -bottom-1.5 right-3
            w-3 h-3 rotate-45
            bg-white dark:bg-[#1e2132]
            border-r border-b border-slate-200 dark:border-white/[0.1]
          " />
        </div>
      )}
    </div>
  );
}

// ── Tool Card ─────────────────────────────────────────────────────────────────
export function ToolCard({ tool }: { tool: Tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category.toLowerCase()}/${tool.id}`;
  const IconComponent = tool.icon_name ? getIconComponent(tool.icon_name as IconName) : null;

  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setMounted(true); setPinned(isPinned(tool.id)); }, [tool.id]);

  const togglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinned) {
      removePin(tool.id);
      setPinned(false);
      toast(`Unpinned "${tool.name}" from My Home`, 'info');
    } else {
      addPin(tool.id);
      setPinned(true);
      toast(`Pinned "${tool.name}" to My Home`, 'success');
    }
  };

  return (
    <Link href={href} className="group relative block" aria-label={`Open ${tool.name} tool`}>
      <article className="
        relative rounded-lg bg-white dark:bg-[#151827]
        overflow-hidden
        border border-slate-200 dark:border-white/[0.07]
        hover:border-slate-300 dark:hover:border-white/[0.14]
        hover:shadow-sm hover:shadow-black/[0.05] dark:hover:shadow-black/30
        transition-all duration-150
        pt-3 pb-3 pl-5 pr-3 flex flex-col gap-2 min-h-[88px]
      ">
        {/* ③ Left color strip — category color identity */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${TOOL_ICON_BG[tool.id] ?? theme.iconBg}`} />

        {/* Pin button — top right, hover-only (always visible if pinned) */}
        <button
          onClick={togglePin}
          title={pinned ? 'Unpin from My Home' : 'Pin to My Home'}
          aria-label={mounted ? (pinned ? `Unpin ${tool.name}` : `Pin ${tool.name}`) : undefined}
          aria-pressed={mounted ? pinned : undefined}
          className={`absolute top-2 right-2 p-1 rounded transition-all duration-150 ${
            pinned
              ? 'text-[var(--ot-accent,#6366f1)]'
              : 'opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-[var(--ot-accent,#6366f1)]'
          }`}
        >
          <Pin size={11} fill={pinned ? 'currentColor' : 'none'} strokeWidth={pinned ? 0 : 2} />
        </button>

        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm ${TOOL_ICON_BG[tool.id] ?? theme.iconBg}`}>
          {IconComponent ? <IconComponent size={15} /> : null}
        </div>

        {/* Name row — name + info icon */}
        <div className="flex items-start justify-between gap-1 pr-4">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 tracking-tight">
            {tool.name}
          </h3>
          {tool.description && (
            <InfoTooltip description={tool.description} />
          )}
        </div>

      </article>
    </Link>
  );
}
