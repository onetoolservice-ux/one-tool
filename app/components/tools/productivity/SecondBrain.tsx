"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Brain, Lightbulb, Flame, CheckCircle2, XCircle,
  Clock, Tag, Trash2, ChevronRight, ArrowUpRight,
  BookOpen, Sparkles, Circle, Archive, Inbox,
  Edit3, Save, Search, Filter, Pin, PinOff,
  CornerDownLeft, AlertCircle, TrendingUp
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type IdeaStatus = 'raw' | 'validated' | 'in-progress' | 'shipped' | 'killed';

interface Idea {
  id: string;
  title: string;
  body: string;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  pinned: boolean;
  tags: string[];
}

interface BrainStore {
  ideas: Idea[];
  lastOpenedId: string | null;
  lastSessionAt: string | null;
}

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'onetool-second-brain';

function loadStore(): BrainStore {
  if (typeof window === 'undefined') return { ideas: [], lastOpenedId: null, lastSessionAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ideas: [], lastOpenedId: null, lastSessionAt: null };
    return JSON.parse(raw) as BrainStore;
  } catch {
    return { ideas: [], lastOpenedId: null, lastSessionAt: null };
  }
}

function saveStore(store: BrainStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* storage full */ }
}

function newId() {
  return `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtRelative(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<IdeaStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  next: IdeaStatus | null;
  nextLabel: string | null;
}> = {
  raw: {
    label: 'Raw',
    color: 'text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700',
    icon: <Circle size={12} />,
    next: 'validated',
    nextLabel: 'Mark Validated',
  },
  validated: {
    label: 'Validated',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <Lightbulb size={12} />,
    next: 'in-progress',
    nextLabel: 'Start Building',
  },
  'in-progress': {
    label: 'Building',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: <Flame size={12} />,
    next: 'shipped',
    nextLabel: 'Mark Shipped',
  },
  shipped: {
    label: 'Shipped',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: <CheckCircle2 size={12} />,
    next: null,
    nextLabel: null,
  },
  killed: {
    label: 'Killed',
    color: 'text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: <XCircle size={12} />,
    next: null,
    nextLabel: null,
  },
};

const STATUS_ORDER: IdeaStatus[] = ['raw', 'validated', 'in-progress', 'shipped', 'killed'];

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, small }: { status: IdeaStatus; small?: boolean }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border
      ${cfg.color} ${cfg.bg} ${cfg.border}
      ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyVault({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
        <Brain size={28} className="text-violet-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Your Second Brain is empty</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-6">
        Every idea you&apos;ve ever had that disappeared — this is where they live now.
        Capture anything. Raw, messy, unfinished. That&apos;s the point.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        <Plus size={16} /> Capture your first idea
      </button>
    </div>
  );
}

// ── Return Banner (session continuity) ───────────────────────────────────────

function ReturnBanner({ days, ideaTitle, onDismiss }: {
  days: number;
  ideaTitle: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-4">
      <AlertCircle size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
          You&apos;re back — {days === 1 ? '1 day' : `${days} days`} since your last session
        </p>
        <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5 truncate">
          Last working on: &ldquo;{ideaTitle}&rdquo;
        </p>
      </div>
      <button onClick={onDismiss} className="text-violet-400 hover:text-violet-600 flex-shrink-0">
        <XCircle size={14} />
      </button>
    </div>
  );
}

// ── Idea Editor (right panel) ─────────────────────────────────────────────────

function IdeaEditor({
  idea,
  onUpdate,
  onDelete,
  onAdvanceStatus,
  onKill,
  onTogglePin,
}: {
  idea: Idea;
  onUpdate: (patch: Partial<Idea>) => void;
  onDelete: () => void;
  onAdvanceStatus: () => void;
  onKill: () => void;
  onTogglePin: () => void;
}) {
  const [title, setTitle] = useState(idea.title);
  const [body, setBody] = useState(idea.body);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cfg = STATUS_CONFIG[idea.status];

  // Sync when idea changes
  useEffect(() => {
    setTitle(idea.title);
    setBody(idea.body);
    setTagInput('');
    setShowDeleteConfirm(false);
    setShowKillConfirm(false);
  }, [idea.id]);

  const scheduleSave = useCallback((patch: Partial<Idea>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdate(patch);
    }, 600);
  }, [onUpdate]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    scheduleSave({ title: v });
  };

  const handleBodyChange = (v: string) => {
    setBody(v);
    scheduleSave({ body: v });
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t || idea.tags.includes(t)) return;
    onUpdate({ tags: [...idea.tags, t] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: idea.tags.filter(t => t !== tag) });
  };

  const idleDays = daysSince(idea.updatedAt);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={idea.status} />
          {idleDays >= 7 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
              <Clock size={10} /> Idle {fmtRelative(idea.updatedAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            title={idea.pinned ? 'Unpin' : 'Pin to top'}
            className={`p-1.5 rounded-lg transition-colors ${idea.pinned ? 'text-violet-500 bg-violet-50 dark:bg-violet-900/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {idea.pinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
          {idea.status !== 'shipped' && idea.status !== 'killed' && cfg.next && (
            <button
              onClick={onAdvanceStatus}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              {cfg.nextLabel} <ArrowUpRight size={12} />
            </button>
          )}
          {idea.status !== 'killed' && idea.status !== 'shipped' && (
            <>
              {showKillConfirm ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-red-500 font-medium">Kill this idea?</span>
                  <button onClick={onKill} className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-500">Yes</button>
                  <button onClick={() => setShowKillConfirm(false)} className="px-2 py-1 text-[10px] rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowKillConfirm(true)}
                  title="Kill idea"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              )}
            </>
          )}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-red-500 font-medium">Delete forever?</span>
              <button onClick={onDelete} className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-500">Yes</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-2 py-1 text-[10px] rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500">No</button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete idea"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Title */}
        <input
          ref={titleRef}
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="What's the idea?"
          className="w-full text-xl font-bold bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none resize-none"
        />

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
          <span>Created {fmtDate(idea.createdAt)}</span>
          <span>·</span>
          <span>Updated {fmtRelative(idea.updatedAt)}</span>
        </div>

        {/* Body */}
        <textarea
          value={body}
          onChange={e => handleBodyChange(e.target.value)}
          placeholder={`Dump everything here — messy is fine.\n\nWhat's the problem it solves?\nWho needs it?\nWhat's the first step?\nWhat's the risk?\n\nNo rules. Just think.`}
          rows={14}
          className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none resize-none leading-relaxed"
        />

        {/* Tags */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Tag size={10} /> Tags
          </p>
          <div className="flex flex-wrap gap-1.5 items-center">
            {idea.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                  <XCircle size={10} />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="add tag, press Enter"
              className="text-xs bg-transparent text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none w-28"
            />
          </div>
        </div>
      </div>

      {/* Status pipeline at bottom */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Lifecycle</p>
        <div className="flex items-center gap-1">
          {STATUS_ORDER.map((s, i) => {
            const isCurrent = s === idea.status;
            const isPast = STATUS_ORDER.indexOf(idea.status) > i && idea.status !== 'killed';
            const scfg = STATUS_CONFIG[s];
            return (
              <React.Fragment key={s}>
                {i > 0 && <ChevronRight size={10} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all
                  ${isCurrent ? `${scfg.color} ${scfg.bg} ${scfg.border}` : isPast ? 'text-slate-300 dark:text-slate-600 bg-transparent border-transparent' : 'text-slate-300 dark:text-slate-700 bg-transparent border-transparent'}`}>
                  {scfg.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Idea List Item ────────────────────────────────────────────────────────────

function IdeaItem({
  idea,
  selected,
  onClick,
}: {
  idea: Idea;
  selected: boolean;
  onClick: () => void;
}) {
  const idleDays = daysSince(idea.updatedAt);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group
        ${selected
          ? 'bg-violet-600 text-white'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
        }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className={`text-sm font-semibold truncate ${selected ? 'text-white' : ''}`}>
          {idea.pinned && <Pin size={10} className="inline mr-1 opacity-60" />}
          {idea.title || <span className="opacity-40 italic">Untitled</span>}
        </span>
        <StatusBadge status={idea.status} small />
      </div>
      <div className={`flex items-center gap-2 text-[10px] ${selected ? 'text-violet-200' : 'text-slate-400'}`}>
        <Clock size={9} />
        <span>{fmtRelative(idea.updatedAt)}</span>
        {idleDays >= 14 && !selected && (
          <span className="text-amber-400 font-medium">· idle</span>
        )}
      </div>
    </button>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ ideas }: { ideas: Idea[] }) {
  const counts = ideas.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<IdeaStatus, number>);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-400 overflow-x-auto">
      <TrendingUp size={10} />
      {STATUS_ORDER.map(s => counts[s] ? (
        <span key={s} className={`${STATUS_CONFIG[s].color} flex-shrink-0`}>
          {counts[s]} {STATUS_CONFIG[s].label}
        </span>
      ) : null)}
      {!ideas.length && <span>No ideas yet</span>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SecondBrain() {
  const [store, setStore] = useState<BrainStore>({ ideas: [], lastOpenedId: null, lastSessionAt: null });
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('all');
  const [showReturnBanner, setShowReturnBanner] = useState(false);
  const [returnDays, setReturnDays] = useState(0);

  // Load store on mount
  useEffect(() => {
    const s = loadStore();
    setStore(s);
    setMounted(true);

    // Session continuity
    if (s.lastSessionAt) {
      const days = daysSince(s.lastSessionAt);
      if (days >= 1 && s.lastOpenedId && s.ideas.find(i => i.id === s.lastOpenedId)) {
        setReturnDays(days);
        setShowReturnBanner(true);
      }
    }

    // Auto-open last idea
    if (s.lastOpenedId && s.ideas.find(i => i.id === s.lastOpenedId)) {
      setSelectedId(s.lastOpenedId);
    } else if (s.ideas.length > 0) {
      // Open most recently updated
      const sorted = [...s.ideas].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setSelectedId(sorted[0].id);
    }
  }, []);

  // Persist & update lastSessionAt when selected changes
  useEffect(() => {
    if (!mounted) return;
    setStore(prev => {
      const next: BrainStore = {
        ...prev,
        lastOpenedId: selectedId,
        lastSessionAt: nowISO(),
      };
      saveStore(next);
      return next;
    });
  }, [selectedId, mounted]);

  const updateStore = useCallback((updater: (prev: BrainStore) => BrainStore) => {
    setStore(prev => {
      const next = updater(prev);
      saveStore(next);
      return next;
    });
  }, []);

  const addIdea = useCallback(() => {
    const idea: Idea = {
      id: newId(),
      title: '',
      body: '',
      status: 'raw',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      lastOpenedAt: nowISO(),
      pinned: false,
      tags: [],
    };
    updateStore(prev => ({ ...prev, ideas: [idea, ...prev.ideas] }));
    setSelectedId(idea.id);
  }, [updateStore]);

  const updateIdea = useCallback((id: string, patch: Partial<Idea>) => {
    updateStore(prev => ({
      ...prev,
      ideas: prev.ideas.map(i =>
        i.id === id ? { ...i, ...patch, updatedAt: nowISO() } : i
      ),
    }));
  }, [updateStore]);

  const deleteIdea = useCallback((id: string) => {
    updateStore(prev => ({
      ...prev,
      ideas: prev.ideas.filter(i => i.id !== id),
      lastOpenedId: prev.lastOpenedId === id ? null : prev.lastOpenedId,
    }));
    setSelectedId(prev => {
      if (prev !== id) return prev;
      const remaining = store.ideas.filter(i => i.id !== id);
      return remaining.length > 0 ? remaining[0].id : null;
    });
  }, [updateStore, store.ideas]);

  const advanceStatus = useCallback((id: string) => {
    const idea = store.ideas.find(i => i.id === id);
    if (!idea) return;
    const cfg = STATUS_CONFIG[idea.status];
    if (!cfg.next) return;
    updateIdea(id, { status: cfg.next });
  }, [store.ideas, updateIdea]);

  const killIdea = useCallback((id: string) => {
    updateIdea(id, { status: 'killed' });
  }, [updateIdea]);

  const togglePin = useCallback((id: string) => {
    const idea = store.ideas.find(i => i.id === id);
    if (!idea) return;
    updateIdea(id, { pinned: !idea.pinned });
  }, [store.ideas, updateIdea]);

  // Filter + sort ideas
  const filteredIdeas = React.useMemo(() => {
    let list = [...store.ideas];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.body.toLowerCase().includes(q) ||
        i.tags.some(t => t.includes(q))
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter(i => i.status === filterStatus);
    }
    // Sort: pinned first, then by updatedAt desc
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return list;
  }, [store.ideas, search, filterStatus]);

  const selectedIdea = store.ideas.find(i => i.id === selectedId) ?? null;
  const returnBannerIdea = store.ideas.find(i => i.id === store.lastOpenedId);

  if (!mounted) return <div className="min-h-[500px] bg-white dark:bg-[#0F111A] rounded-2xl" />;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px] bg-white dark:bg-[#0F111A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Brain size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200">Second Brain</h1>
            <p className="text-[10px] text-slate-400">{store.ideas.length} ideas captured</p>
          </div>
        </div>
        <button
          onClick={addIdea}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
        >
          <Plus size={14} /> New Idea
        </button>
      </div>

      {/* ── Stats ── */}
      <StatsBar ideas={store.ideas} />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col">

          {/* Search + filter */}
          <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Search size={12} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ideas..."
                className="text-xs bg-transparent outline-none text-slate-600 dark:text-slate-300 placeholder:text-slate-400 w-full"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {(['all', ...STATUS_ORDER] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all
                    ${filterStatus === s
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Idea list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredIdeas.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">
                  {search ? 'No ideas match your search.' : 'No ideas in this filter.'}
                </p>
              </div>
            )}
            {filteredIdeas.map(idea => (
              <IdeaItem
                key={idea.id}
                idea={idea}
                selected={idea.id === selectedId}
                onClick={() => setSelectedId(idea.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: editor or empty */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedIdea ? (
            <div className="flex flex-col h-full">
              {/* Return banner inside editor area */}
              {showReturnBanner && returnBannerIdea && (
                <div className="px-5 pt-4">
                  <ReturnBanner
                    days={returnDays}
                    ideaTitle={returnBannerIdea.title || 'Untitled'}
                    onDismiss={() => setShowReturnBanner(false)}
                  />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <IdeaEditor
                  key={selectedIdea.id}
                  idea={selectedIdea}
                  onUpdate={patch => updateIdea(selectedIdea.id, patch)}
                  onDelete={() => deleteIdea(selectedIdea.id)}
                  onAdvanceStatus={() => advanceStatus(selectedIdea.id)}
                  onKill={() => killIdea(selectedIdea.id)}
                  onTogglePin={() => togglePin(selectedIdea.id)}
                />
              </div>
            </div>
          ) : (
            <EmptyVault onAdd={addIdea} />
          )}
        </div>
      </div>
    </div>
  );
}
