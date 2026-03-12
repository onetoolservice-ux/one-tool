'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Pin, PinOff, LayoutGrid, ArrowRight, Search,
  Plus, Trash2, Pencil, Check, X, ChevronDown,
} from 'lucide-react';
import {
  getSpaces, getActiveSpaceId, setActiveSpace,
  addSpace, deleteSpace, renameSpace,
  getPinsForSpace, removePin, getRecentlyUsed,
  type Space,
} from '@/app/lib/home-store';
import { SpaceToolPicker } from './SpaceToolPicker';
import { getTileLiveDataFull, type TileLiveData } from '@/app/lib/tile-live-data';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { getTheme } from '@/app/lib/theme-config';

// Per-tool icon backgrounds
const TOOL_ICON_BG: Record<string, string> = {
  'biz-dashboard':    'bg-gradient-to-br from-blue-600 to-indigo-600',
  'biz-daybook':      'bg-gradient-to-br from-emerald-500 to-teal-600',
  'biz-parties':      'bg-gradient-to-br from-violet-500 to-purple-600',
  'biz-invoices':     'bg-gradient-to-br from-amber-500 to-orange-500',
  'biz-products':     'bg-gradient-to-br from-cyan-500 to-blue-500',
  'biz-inventory':    'bg-gradient-to-br from-teal-500 to-emerald-500',
  'biz-stock-entry':  'bg-gradient-to-br from-sky-500 to-cyan-500',
  'biz-reports':      'bg-gradient-to-br from-indigo-500 to-blue-600',
  'biz-outstanding':  'bg-gradient-to-br from-rose-500 to-red-600',
  'biz-purchases':    'bg-gradient-to-br from-purple-500 to-violet-600',
  'biz-quotations':   'bg-gradient-to-br from-sky-400 to-blue-500',
  'biz-staff':        'bg-gradient-to-br from-pink-500 to-rose-500',
  'biz-gst':          'bg-gradient-to-br from-green-500 to-emerald-600',
  'biz-cashflow':     'bg-gradient-to-br from-lime-500 to-green-500',
  'biz-loans':        'bg-gradient-to-br from-red-500 to-rose-600',
  'pf-statement-manager':  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'pf-financial-position': 'bg-gradient-to-br from-emerald-500 to-teal-500',
  'pf-cash-flow':          'bg-gradient-to-br from-teal-500 to-cyan-500',
  'pf-tx-explorer':        'bg-gradient-to-br from-violet-500 to-purple-600',
  'pf-expenditure':        'bg-gradient-to-br from-rose-500 to-pink-500',
  'pf-expenses':           'bg-gradient-to-br from-red-500 to-rose-600',
  'pf-commitments':        'bg-gradient-to-br from-amber-500 to-orange-500',
  'pf-recurring':          'bg-gradient-to-br from-cyan-500 to-sky-500',
  'pf-top-merchants':      'bg-gradient-to-br from-orange-500 to-amber-600',
  'pf-big-spends':         'bg-gradient-to-br from-red-600 to-orange-500',
  'pf-rules':              'bg-gradient-to-br from-slate-600 to-slate-800',
  'pf-income-sources':     'bg-gradient-to-br from-green-500 to-emerald-600',
  'pf-behavior':           'bg-gradient-to-br from-purple-500 to-violet-600',
  'pf-savings-trend':      'bg-gradient-to-br from-lime-500 to-green-500',
  'pf-month-compare':      'bg-gradient-to-br from-sky-500 to-blue-600',
  'pf-heatmap':            'bg-gradient-to-br from-fuchsia-500 to-pink-500',
  'pf-subscriptions':      'bg-gradient-to-br from-indigo-500 to-blue-500',
  'pf-labels':             'bg-gradient-to-br from-pink-500 to-rose-500',
  'pf-liability':          'bg-gradient-to-br from-yellow-500 to-amber-600',
  'pf-ai-analyst':         'bg-gradient-to-br from-violet-600 to-fuchsia-500',
  'crm-people':            'bg-gradient-to-br from-violet-500 to-purple-600',
  'biz-crm-pipeline':      'bg-gradient-to-br from-indigo-500 to-blue-600',
  'analyticsreport':       'bg-gradient-to-br from-blue-600 to-cyan-500',
  'managetransaction':     'bg-gradient-to-br from-indigo-600 to-blue-500',
  'expenses':              'bg-gradient-to-br from-rose-500 to-red-600',
  'credits':               'bg-gradient-to-br from-emerald-500 to-green-600',
  'smart-budget':          'bg-gradient-to-br from-emerald-500 to-teal-600',
  'smart-loan':            'bg-gradient-to-br from-green-600 to-emerald-500',
  'smart-sip':             'bg-gradient-to-br from-lime-500 to-green-600',
  'smart-net-worth':       'bg-gradient-to-br from-sky-500 to-blue-600',
  'smart-retirement':      'bg-gradient-to-br from-blue-600 to-indigo-500',
  'gst-calculator':        'bg-gradient-to-br from-orange-500 to-amber-600',
  'invoice-generator':     'bg-gradient-to-br from-blue-600 to-blue-800',
  'salary-slip':           'bg-gradient-to-br from-violet-600 to-purple-700',
  'smart-agreement':       'bg-gradient-to-br from-slate-600 to-slate-900',
  'id-card':               'bg-gradient-to-br from-cyan-500 to-teal-600',
  'rent-receipt':          'bg-gradient-to-br from-teal-500 to-emerald-600',
  'universal-converter':   'bg-gradient-to-br from-amber-500 to-orange-600',
  'smart-scan':            'bg-gradient-to-br from-blue-500 to-cyan-500',
  'smart-pdf-merge':       'bg-gradient-to-br from-red-600 to-rose-500',
  'smart-pdf-split':       'bg-gradient-to-br from-rose-500 to-pink-600',
  'smart-img-compress':    'bg-gradient-to-br from-pink-500 to-rose-500',
  'smart-img-convert':     'bg-gradient-to-br from-fuchsia-500 to-purple-600',
  'smart-ocr':             'bg-gradient-to-br from-violet-600 to-indigo-600',
  'smart-word':            'bg-gradient-to-br from-slate-600 to-slate-800',
  'smart-excel':           'bg-gradient-to-br from-emerald-600 to-green-700',
  'json-csv':              'bg-gradient-to-br from-yellow-500 to-amber-600',
  'dev-station':           'bg-gradient-to-br from-violet-600 to-purple-700',
  'api-playground':        'bg-gradient-to-br from-blue-500 to-cyan-600',
  'smart-jwt':             'bg-gradient-to-br from-pink-500 to-rose-500',
  'smart-json':            'bg-gradient-to-br from-orange-500 to-amber-500',
  'smart-sql':             'bg-gradient-to-br from-cyan-600 to-teal-500',
  'cron-gen':              'bg-gradient-to-br from-slate-500 to-gray-700',
  'git-cheats':            'bg-gradient-to-br from-red-600 to-orange-500',
  'smart-diff':            'bg-gradient-to-br from-indigo-500 to-violet-600',
  'regex-tester':          'bg-gradient-to-br from-amber-500 to-yellow-600',
  'hash-gen':              'bg-gradient-to-br from-emerald-500 to-teal-600',
  'num-convert':           'bg-gradient-to-br from-purple-500 to-violet-600',
  'timestamp-tool':        'bg-gradient-to-br from-sky-500 to-cyan-600',
  'life-os':               'bg-gradient-to-br from-rose-500 to-pink-600',
  'qr-code':               'bg-gradient-to-br from-slate-700 to-slate-900',
  'smart-pass':            'bg-gradient-to-br from-emerald-500 to-green-600',
  'pomodoro':              'bg-gradient-to-br from-red-500 to-orange-500',
  'unit-convert':          'bg-gradient-to-br from-cyan-500 to-sky-600',
  'case-convert':          'bg-gradient-to-br from-orange-500 to-amber-500',
  'color-picker':          'bg-gradient-to-br from-pink-500 to-rose-600',
  'color-studio':          'bg-gradient-to-br from-violet-500 to-purple-600',
  'smart-bmi':             'bg-gradient-to-br from-teal-500 to-cyan-600',
  'smart-breath':          'bg-gradient-to-br from-sky-500 to-blue-600',
  'smart-workout':         'bg-gradient-to-br from-lime-500 to-green-600',
  'prompt-generator':      'bg-gradient-to-br from-fuchsia-500 to-purple-600',
  'smart-chat':            'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  'smart-analyze':         'bg-gradient-to-br from-purple-600 to-indigo-600',
  'audio-transcription':   'bg-gradient-to-br from-rose-500 to-orange-500',
};

const TONE_CLASSES: Record<string, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral:  'text-indigo-600 dark:text-indigo-400',
};

// ── HomeTile ──────────────────────────────────────────────────────────────────

interface HomeTileProps {
  tool: typeof ALL_TOOLS[0];
  spaceId: string;
  onUnpin: (id: string, spaceId: string) => void;
}

function HomeTile({ tool, spaceId, onUnpin }: HomeTileProps) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category.toLowerCase().replace(/ /g, '-')}/${tool.id}`;
  const IconComponent = typeof tool.icon === 'string'
    ? getIconComponent(tool.icon as IconName)
    : null;
  const iconBg = TOOL_ICON_BG[tool.id] ?? theme.iconBg;
  const [liveData, setLiveData] = useState<TileLiveData | null>(null);

  useEffect(() => {
    setLiveData(getTileLiveDataFull(tool.id));
  }, [tool.id]);

  return (
    <div className="group relative">
      <Link
        href={href}
        className="block h-full rounded-2xl bg-white dark:bg-[#151827] border border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/[0.06] dark:hover:shadow-black/30 transition-all duration-200 p-5 flex flex-col"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-200 ${iconBg}`}>
          {IconComponent ? <IconComponent size={24} /> : null}
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1.5">
          {tool.name}
        </h3>
        {liveData ? (
          <div className="flex-1">
            <span className={`text-base font-black tabular-nums ${TONE_CLASSES[liveData.tone ?? 'neutral']}`}>
              {liveData.value}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {liveData.label}
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
            {(tool as any).desc || (tool as any).description || ''}
          </p>
        )}
        <div className="mt-3">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
            {tool.category}
          </span>
        </div>
      </Link>
      <button
        onClick={() => onUnpin(tool.id, spaceId)}
        title="Remove from space"
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#1e2132] border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/40 shadow-sm"
      >
        <PinOff size={13} />
      </button>
    </div>
  );
}

// ── NewSpaceDialog ─────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = ['📁', '💼', '🏥', '💰', '🧑‍💻', '🎯', '📊', '🛒', '✈️', '🏠', '📚', '⚡'];

interface NewSpaceDialogProps {
  onConfirm: (name: string, emoji: string) => void;
  onCancel: () => void;
}

function NewSpaceDialog({ onConfirm, onCancel }: NewSpaceDialogProps) {
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

        {/* Emoji picker */}
        <div className="flex flex-wrap gap-2 mb-4">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                emoji === e
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-400 dark:ring-indigo-500'
                  : 'bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >{e}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Space name (e.g. Work, Health)"
            maxLength={24}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors mb-4"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── RenameInline ──────────────────────────────────────────────────────────────

interface RenameInlineProps {
  space: Space;
  onDone: () => void;
}

function RenameInline({ space, onDone }: RenameInlineProps) {
  const [value, setValue] = useState(space.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== space.name) {
      renameSpace(space.id, trimmed);
    }
    onDone();
  };

  return (
    <div className="flex items-center gap-1 h-8">
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onDone(); }}
        onBlur={commit}
        maxLength={24}
        className="w-28 px-2 py-1 text-xs rounded-md bg-white dark:bg-[#1e2132] border border-indigo-400 dark:border-indigo-500 focus:outline-none text-slate-900 dark:text-white"
      />
      <button onClick={commit} className="p-1 text-emerald-500 hover:text-emerald-600"><Check size={12} /></button>
      <button onClick={onDone} className="p-1 text-slate-400 hover:text-slate-600"><X size={12} /></button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

interface Props {
  searchIntent?: string | null;
}

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
    const allSpaces = getSpaces();
    const currentActiveId = getActiveSpaceId();
    setSpaces(allSpaces);
    setActiveId(currentActiveId);
    setPinnedIds(getPinsForSpace(currentActiveId));
    setRecentIds(getRecentlyUsed(8));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('onetool-home-updated', refresh);
    return () => window.removeEventListener('onetool-home-updated', refresh);
  }, [refresh]);

  const switchSpace = (id: string) => {
    setActiveSpace(id);
    // also update local state immediately
    setActiveId(id);
    setPinnedIds(getPinsForSpace(id));
  };

  const handleUnpin = (toolId: string, spaceId: string) => {
    removePin(toolId, spaceId);
  };

  const handleCreateSpace = (name: string, emoji: string) => {
    addSpace(name, emoji);
    setShowNewDialog(false);
  };

  const handleDeleteSpace = (id: string) => {
    deleteSpace(id);
    setDeleteConfirmId(null);
  };

  const activeSpace = spaces.find(s => s.id === activeId) ?? spaces[0];

  const pinnedTools = pinnedIds
    .map(id => ALL_TOOLS.find(t => t.id === id))
    .filter(Boolean) as typeof ALL_TOOLS;

  const recentTools = recentIds
    .filter(id => !pinnedIds.includes(id))
    .map(id => ALL_TOOLS.find(t => t.id === id))
    .filter(Boolean) as typeof ALL_TOOLS;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A] pb-12">

      {/* ── Space Tab Bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#0F111A]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.06]">
        <div className="px-4 md:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-0 scrollbar-none">
          {spaces.map(space => {
            const isActive = space.id === activeId;
            const isRenaming = renamingId === space.id;

            return (
              <div key={space.id} className="flex items-center flex-shrink-0">
                {isRenaming ? (
                  <div className="px-3 py-2">
                    <RenameInline space={space} onDone={() => setRenamingId(null)} />
                  </div>
                ) : (
                  <div
                    className={`group flex items-center gap-1.5 px-3 py-3.5 border-b-2 cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    onClick={() => switchSpace(space.id)}
                  >
                    <span className="text-sm">{space.emoji}</span>
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? '' : ''}`}>
                      {space.name}
                    </span>

                    {/* Pinned count badge */}
                    {space.pins.length > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500'
                      }`}>
                        {space.pins.length}
                      </span>
                    )}

                    {/* Edit/Delete actions (hover on active tab) */}
                    {isActive && !space.isDefault && (
                      <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setRenamingId(space.id); }}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Rename space"
                        >
                          <Pencil size={10} />
                        </button>
                        {deleteConfirmId === space.id ? (
                          <>
                            <button
                              onClick={e => { e.stopPropagation(); handleDeleteSpace(space.id); }}
                              className="px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                            >Delete?</button>
                            <button
                              onClick={e => { e.stopPropagation(); setDeleteConfirmId(null); }}
                              className="p-0.5 text-slate-400 hover:text-slate-600"
                            ><X size={10} /></button>
                          </>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteConfirmId(space.id); }}
                            className="p-0.5 rounded text-slate-400 hover:text-red-500"
                            title="Delete space"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* New space button */}
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-1 px-3 py-3.5 flex-shrink-0 text-xs font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border-b-2 border-transparent transition-colors"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Space</span>
          </button>
        </div>
      </div>

      {/* ── Page Body ──────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-6 lg:px-8 pt-6">

        {/* Search intent banner */}
        {searchIntent && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-sm text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span>You searched for &ldquo;<strong>{searchIntent}</strong>&rdquo;</span>
            <Link
              href={`/home?search=${encodeURIComponent(searchIntent)}`}
              className="flex items-center gap-1 font-semibold hover:underline text-indigo-600 dark:text-indigo-400"
            >
              <Search size={13} /> Find matching tools
            </Link>
          </div>
        )}

        {/* Space header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{activeSpace?.emoji}</span>
              <span>{activeSpace?.name}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pinnedTools.length > 0
                ? `${pinnedTools.length} tool${pinnedTools.length > 1 ? 's' : ''} in this space`
                : 'No tools added yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus size={13} />
              Add Tools
            </button>
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium transition-colors"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">All Tools</span>
            </Link>
          </div>
        </div>

        {/* Pinned tools grid */}
        {pinnedTools.length > 0 ? (
          <section className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {pinnedTools.map(tool => (
                <HomeTile
                  key={tool.id}
                  tool={tool}
                  spaceId={activeId}
                  onUnpin={handleUnpin}
                />
              ))}

              {/* Add more tile */}
              <button
                onClick={() => setShowPicker(true)}
                className="flex flex-col items-center justify-center h-full min-h-[160px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-200 gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <span className="text-xs font-medium">Add Tool</span>
              </button>
            </div>
          </section>
        ) : (
          /* Empty state */
          <section className="mb-8">
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 text-3xl">
                {activeSpace?.emoji ?? '📁'}
              </div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                {activeSpace?.isDefault ? 'No tools pinned yet' : `${activeSpace?.name} is empty`}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                {activeSpace?.isDefault
                  ? 'Browse all 158 tools and pin your favourites here for quick access.'
                  : 'Add tools to this space to create a focused workspace.'}
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus size={14} />
                Add Tools
              </button>
            </div>
          </section>
        )}

        {/* Recently visited (shown only in My Home default space) */}
        {activeSpace?.isDefault && recentTools.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Recently visited
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recentTools.map(tool => (
                <HomeTile
                  key={tool.id}
                  tool={tool}
                  spaceId={activeId}
                  onUnpin={handleUnpin}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showNewDialog && (
        <NewSpaceDialog
          onConfirm={handleCreateSpace}
          onCancel={() => setShowNewDialog(false)}
        />
      )}

      {showPicker && activeSpace && (
        <SpaceToolPicker
          spaceId={activeSpace.id}
          spaceName={activeSpace.name}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
