'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  PinOff, LayoutGrid, Plus, Trash2, Pencil, Check, X, AlertTriangle,
} from 'lucide-react';
import {
  getHomeSnapshot, setActiveSpace,
  addSpace, deleteSpace, renameSpace,
  getPinsForSpace, removePin,
  type Space,
} from '@/app/lib/home-store';
import { SpaceToolPicker } from './SpaceToolPicker';
import { getTileLiveDataFull, type TileLiveData } from '@/app/lib/tile-live-data';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getIconComponent, type IconName } from '@/app/lib/utils/IconMapper';
import { getTheme } from '@/app/lib/theme-config';
import { TOOL_ICON_BG } from '@/app/lib/tool-icon-bg';

// ── KPI tone colours ───────────────────────────────────────────────────────────
const TONE: Record<string, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral:  'text-[var(--ot-accent,#6366f1)]',
};

// ── SAP Fiori Tile ────────────────────────────────────────────────────────────
interface HomeTileProps {
  tool: typeof ALL_TOOLS[0];
  spaceId: string;
  onUnpin: ((id: string, spaceId: string) => void) | null;
}

function HomeTile({ tool, spaceId, onUnpin }: HomeTileProps) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category.toLowerCase().replace(/ /g, '-')}/${tool.id}`;
  const IconComponent = typeof tool.icon === 'string'
    ? getIconComponent(tool.icon as IconName) : null;
  const iconBg = TOOL_ICON_BG[tool.id] ?? theme.iconBg;
  const [liveData, setLiveData] = useState<TileLiveData | null>(null);

  useEffect(() => { setLiveData(getTileLiveDataFull(tool.id)); }, [tool.id]);

  const desc = (tool as any).desc || (tool as any).description || '';

  return (
    <div className="group relative">
      <Link
        href={href}
        className="
          block rounded-xl bg-white dark:bg-[#151827]
          border border-slate-200 dark:border-white/[0.07]
          hover:border-slate-300 dark:hover:border-white/[0.14]
          hover:shadow-lg hover:shadow-black/[0.05] dark:hover:shadow-black/25
          transition-all duration-200
          p-4 flex flex-col gap-3 min-h-[156px]
        "
      >
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ${iconBg}`}>
          {IconComponent ? <IconComponent size={20} /> : null}
        </div>

        {/* KPI or description — fills available space */}
        <div className="flex-1">
          {liveData ? (
            <>
              <div className={`text-[22px] font-black tabular-nums leading-none ${TONE[liveData.tone ?? 'neutral']}`}>
                {liveData.value}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">
                {liveData.label}
              </div>
            </>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
              {desc}
            </p>
          )}
        </div>

        {/* Title + category badge */}
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-1.5">
            {tool.name}
          </h3>
          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
            {tool.category}
          </span>
        </div>
      </Link>

      {/* Unpin — top-right, shows on hover */}
      {onUnpin && (
        <button
          onClick={() => onUnpin(tool.id, spaceId)}
          title="Remove from space"
          className="
            absolute top-2.5 right-2.5 w-6 h-6 rounded-md
            flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity
            bg-white dark:bg-[#1e2132] border border-slate-200 dark:border-white/10
            text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/40
            shadow-sm
          "
        >
          <PinOff size={11} />
        </button>
      )}
    </div>
  );
}

// ── Empty space tile (Add Tool CTA) ───────────────────────────────────────────
function AddTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center justify-center min-h-[156px]
        rounded-xl border-2 border-dashed
        border-slate-200 dark:border-white/[0.08]
        text-slate-400 dark:text-slate-500
        hover:text-[var(--ot-accent,#6366f1)]
        hover:border-[var(--ot-accent,#6366f1)]/40
        hover:bg-[var(--ot-accent,#6366f1)]/[0.03]
        transition-all duration-200 gap-2
      "
    >
      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center">
        <Plus size={17} />
      </div>
      <span className="text-[11px] font-medium">Add Tool</span>
    </button>
  );
}

// ── Delete modal ──────────────────────────────────────────────────────────────
function DeleteSpaceModal({ space, onConfirm, onCancel }: { space: Space; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-[#151827] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Space</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{space.emoji} {space.name}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          This will remove the space and unpin all {space.pins.length > 0 ? `${space.pins.length} tool${space.pins.length !== 1 ? 's' : ''}` : 'tools'} from it. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
            Delete Space
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Space dialog ──────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['📁', '💼', '🏥', '💰', '🧑‍💻', '🎯', '📊', '🛒', '✈️', '🏠', '📚', '⚡'];

function NewSpaceDialog({ onConfirm, onCancel }: { onConfirm: (name: string, emoji: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onConfirm(trimmed, emoji);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-[#151827] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">New Space</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e} type="button" onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                emoji === e
                  ? 'bg-[var(--ot-accent,#6366f1)]/10 ring-2 ring-[var(--ot-accent,#6366f1)]/50'
                  : 'bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >{e}</button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef} type="text" value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Space name (e.g. Work, Health)"
            maxLength={24}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-transparent focus:border-[var(--ot-accent,#6366f1)]/60 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors mb-4"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="px-4 py-1.5 rounded-lg bg-[var(--ot-accent,#6366f1)] hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold transition-opacity">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Inline rename ─────────────────────────────────────────────────────────────
function RenameInline({ space, onDone }: { space: Space; onDone: () => void }) {
  const [value, setValue] = useState(space.name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== space.name) renameSpace(space.id, trimmed);
    onDone();
  };

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef} value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onDone(); }}
        onBlur={commit}
        maxLength={24}
        className="w-24 px-2 py-0.5 text-xs rounded border border-[var(--ot-accent,#6366f1)]/50 focus:outline-none bg-white dark:bg-[#1e2132] text-slate-900 dark:text-white"
      />
      <button onClick={commit} className="p-0.5 text-emerald-500 hover:text-emerald-600"><Check size={11} /></button>
      <button onClick={onDone} className="p-0.5 text-slate-400 hover:text-slate-600"><X size={11} /></button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
interface Props { searchIntent?: string | null }

export function MyHomePage({ searchIntent }: Props) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeId, setActiveId] = useState<string>('my-home');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    // Single localStorage parse — getHomeSnapshot reads once and returns all needed state
    const snap = getHomeSnapshot(8);
    setSpaces(snap.spaces);
    setActiveId(snap.activeSpaceId);
    setPinnedIds(snap.pins);
    setRecentIds(snap.recents);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('onetool-home-updated', refresh);
    return () => window.removeEventListener('onetool-home-updated', refresh);
  }, [refresh]);

  const switchSpace = (id: string) => {
    setActiveSpace(id);
    // Read pins for this space from the already-loaded spaces array (no extra localStorage parse)
    const space = spaces.find(s => s.id === id);
    setActiveId(id);
    setPinnedIds(space?.pins ?? []);
  };

  const handleUnpin = (toolId: string, spaceId: string) => { removePin(toolId, spaceId); };
  const handleCreateSpace = (name: string, emoji: string) => { addSpace(name, emoji); setShowNewDialog(false); };
  const handleDeleteSpace = (id: string) => { deleteSpace(id); setDeleteConfirmId(null); };

  const activeSpace = spaces.find(s => s.id === activeId) ?? spaces[0];
  const pinnedTools = pinnedIds.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as typeof ALL_TOOLS;
  const recentTools = recentIds.filter(id => !pinnedIds.includes(id)).map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as typeof ALL_TOOLS;

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0F111A] pb-16">

      {/* ── Spaces Tab Bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0F111A] border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center px-4 md:px-6 lg:px-8 overflow-x-auto scrollbar-none">

          {spaces.map(space => {
            const isActive = space.id === activeId;
            const isRenaming = renamingId === space.id;
            return (
              <div key={space.id} className="flex items-center flex-shrink-0">
                {isRenaming ? (
                  <div className="px-3 py-3">
                    <RenameInline space={space} onDone={() => setRenamingId(null)} />
                  </div>
                ) : (
                  <div
                    onClick={() => switchSpace(space.id)}
                    className={`
                      group/tab flex items-center gap-1.5 px-3 py-3.5 border-b-2 cursor-pointer
                      transition-all duration-150 select-none
                      ${isActive
                        ? 'border-[var(--ot-accent,#6366f1)] text-[var(--ot-accent,#6366f1)]'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/10'
                      }
                    `}
                  >
                    <span className="text-[13px] leading-none">{space.emoji}</span>
                    <span className="text-[12px] font-semibold whitespace-nowrap">{space.name}</span>

                    {/* Pin count badge */}
                    {space.pins.length > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[var(--ot-accent,#6366f1)]/10 text-[var(--ot-accent,#6366f1)]'
                          : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400'
                      }`}>
                        {space.pins.length}
                      </span>
                    )}

                    {/* Rename / delete — active custom spaces only */}
                    {isActive && !space.isDefault && (
                      <div className="flex items-center gap-0.5 ml-0.5 opacity-0 group-hover/tab:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setRenamingId(space.id); }}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Rename"
                        ><Pencil size={9} /></button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteConfirmId(space.id); }}
                          className="p-0.5 rounded text-slate-400 hover:text-rose-500"
                          title="Delete"
                        ><Trash2 size={9} /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* New Space button */}
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-1 px-3 py-3.5 flex-shrink-0 text-[11px] font-medium text-slate-400 hover:text-[var(--ot-accent,#6366f1)] transition-colors ml-1 whitespace-nowrap"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">New Space</span>
          </button>
        </div>
      </div>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-6 lg:px-8 pt-6">

        {/* Search intent banner */}
        {searchIntent && (
          <div className="mb-5 px-4 py-2.5 rounded-xl bg-[var(--ot-accent,#6366f1)]/5 border border-[var(--ot-accent,#6366f1)]/20 text-sm text-[var(--ot-accent,#6366f1)] flex items-center justify-between">
            <span>You searched for &ldquo;<strong>{searchIntent}</strong>&rdquo;</span>
            <Link
              href={`/home?search=${encodeURIComponent(searchIntent)}`}
              className="flex items-center gap-1 font-semibold hover:underline"
            >
              Find tools <LayoutGrid size={13} />
            </Link>
          </div>
        )}

        {/* ── Space header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900 dark:text-white flex items-center gap-2 leading-tight">
              <span className="text-[20px]">{activeSpace?.emoji}</span>
              <span>{activeSpace?.name}</span>
            </h1>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
              {pinnedTools.length > 0
                ? `${pinnedTools.length} tool${pinnedTools.length !== 1 ? 's' : ''} in this space`
                : 'No tools added yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ot-accent,#6366f1)] hover:opacity-90 text-white text-[12px] font-semibold transition-opacity shadow-sm"
            >
              <Plus size={13} /> Add Tools
            </button>
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-[12px] font-medium transition-colors"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Tool Catalog</span>
            </Link>
          </div>
        </div>

        {/* ── Pinned tools grid ─────────────────────────────────────────────── */}
        {pinnedTools.length > 0 ? (
          <section className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {pinnedTools.map(tool => (
                <HomeTile key={tool.id} tool={tool} spaceId={activeId} onUnpin={handleUnpin} />
              ))}
              <AddTile onClick={() => setShowPicker(true)} />
            </div>
          </section>
        ) : (
          /* Empty state */
          <section className="mb-8">
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#151827]/40">
              <div className="w-16 h-16 rounded-2xl bg-[var(--ot-accent,#6366f1)]/8 flex items-center justify-center mb-4 text-3xl">
                {activeSpace?.emoji ?? '📁'}
              </div>
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
                {activeSpace?.isDefault ? 'No tools pinned yet' : `${activeSpace?.name} is empty`}
              </h2>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 max-w-xs mb-6 leading-relaxed">
                {activeSpace?.isDefault
                  ? `Browse all ${ALL_TOOLS.length} tools and pin your favourites here for quick access.`
                  : 'Add tools to this space to create a focused workspace.'}
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity shadow-sm"
              >
                <Plus size={14} /> Add Tools
              </button>
            </div>
          </section>
        )}

        {/* ── Recently visited (My Home default space only) ──────────────── */}
        {activeSpace?.isDefault && recentTools.length > 0 && (
          <section>
            {/* SAP-style section header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                Recently Visited
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recentTools.map(tool => (
                <HomeTile key={tool.id} tool={tool} spaceId={activeId} onUnpin={null} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showNewDialog && (
        <NewSpaceDialog onConfirm={handleCreateSpace} onCancel={() => setShowNewDialog(false)} />
      )}

      {deleteConfirmId && (() => {
        const space = spaces.find(s => s.id === deleteConfirmId);
        return space ? (
          <DeleteSpaceModal
            space={space}
            onConfirm={() => handleDeleteSpace(deleteConfirmId)}
            onCancel={() => setDeleteConfirmId(null)}
          />
        ) : null;
      })()}

      {showPicker && activeSpace && (
        <SpaceToolPicker spaceId={activeSpace.id} spaceName={activeSpace.name} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
