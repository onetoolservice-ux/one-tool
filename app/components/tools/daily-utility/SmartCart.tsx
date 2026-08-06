'use client';
// ══════════════════════════════════════════════════════════════════════════════
// Smart Cart — Daily Utility Tool
// Designed by Claude
//
// Features:
//   · Multi-list shopping management (Grocery, Wishlist, custom)
//   · Item capture with Need / Want / Luxury priority classification
//   · Quantity, unit, estimated & actual price tracking
//   · By-category grouped view + flat checklist mode
//   · History tab — bought items with actual vs estimated comparison
//   · Budget Pulse — reads PF Budget Planner for category budget comparison
//   · Clone recurring items into a fresh list
//   · Export list as plain text
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingBag, Plus, Trash2, Check, X, RotateCcw, ChevronDown,
  BarChart3, Clock, Wallet, Copy, Download, Star, Archive,
  Edit3, Save, AlertCircle, TrendingUp, TrendingDown, Zap,
  Package, Circle, CheckCircle2, MinusCircle, RefreshCw,
} from 'lucide-react';

import {
  loadSCStore, saveSCStore, addList, updateList, deleteList,
  setActiveList, cloneListRecurring,
  addItem, updateItem, deleteItem, markBought, markPending,
  clearBought, clearSkipped,
  computeSummary, groupByCategory,
  fmtPrice, fmtDate,
  CART_ITEM_CATEGORIES, UNIT_OPTIONS, LIST_COLORS,
  PRIORITY_META, CATEGORY_EMOJI,
  type CartList, type CartItem, type CartItemCategory,
  type ItemPriority, type ItemStatus, type ItemUnit, type ListColorKey,
} from './smart-cart-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['cart', 'lists', 'history', 'budget'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, { label: string; icon: React.ReactNode }> = {
  cart:    { label: 'Cart',         icon: <ShoppingBag size={14} /> },
  lists:   { label: 'Lists',        icon: <Package size={14} />     },
  history: { label: 'History',      icon: <Clock size={14} />       },
  budget:  { label: 'Budget Pulse', icon: <Wallet size={14} />      },
};

type ViewMode  = 'by-category' | 'flat' | 'by-priority';
type FilterMode = 'all' | 'pending' | 'bought' | 'skipped';

const EMOJI_OPTIONS = ['🛒', '⭐', '💊', '📦', '🎁', '🏠', '👕', '📚', '🎯', '✅', '🛍️', '🧴', '🥦', '🍳', '🐾', '📝'];

// ── Tiny reusable atoms ───────────────────────────────────────────────────────

function Btn({
  onClick, children, variant = 'default', disabled, title, className = '',
}: {
  onClick?: () => void; children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  disabled?: boolean; title?: string; className?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    default: 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
    primary: 'bg-accent text-white hover:opacity-90 border border-accent',
    danger:  'border border-slate-300 dark:border-slate-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40',
    ghost:   'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${color}`}>
      {children}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: ItemPriority }) {
  const m = PRIORITY_META[priority];
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  );
}

function EmptyState({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

// ── Quick-Add Form ────────────────────────────────────────────────────────────

interface QuickAddFormProps {
  listId: string;
  onAdded: () => void;
}

function QuickAddForm({ listId, onAdded }: QuickAddFormProps) {
  const [name, setName]         = useState('');
  const [category, setCategory] = useState<CartItemCategory>('Grocery');
  const [priority, setPriority] = useState<ItemPriority>('need');
  const [qty, setQty]           = useState('1');
  const [unit, setUnit]         = useState<ItemUnit>('pcs');
  const [price, setPrice]       = useState('');
  const [store, setStore]       = useState('');
  const [recurring, setRecurring] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName(''); setPrice(''); setStore('');
    setQty('1'); setUnit('pcs'); setRecurring(false);
    nameRef.current?.focus();
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addItem({
      listId,
      name: name.trim(),
      category,
      priority,
      quantity: Math.max(1, parseFloat(qty) || 1),
      unit,
      estimatedPrice: parseFloat(price) || 0,
      store: store.trim() || undefined,
      status: 'pending',
      isRecurring: recurring,
    });
    reset();
    onAdded();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setName('');
  };

  const sel = 'h-8 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-accent/50';

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 p-3">
      {/* Row 1: name + controls */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          ref={nameRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add item… (press Enter)"
          className="flex-1 min-w-[160px] h-8 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-slate-400"
        />
        <select value={category} onChange={e => setCategory(e.target.value as CartItemCategory)} className={sel}>
          {CART_ITEM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value as ItemPriority)} className={sel}>
          <option value="need">Need</option>
          <option value="want">Want</option>
          <option value="luxury">Luxury</option>
        </select>
        <button
          onClick={() => setExpanded(p => !p)}
          className="h-8 px-2 text-xs text-slate-500 dark:text-slate-400 hover:text-accent border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1"
        >
          {expanded ? 'Less' : 'More'} <ChevronDown size={12} className={expanded ? 'rotate-180' : ''} />
        </button>
        <Btn variant="primary" onClick={handleAdd} disabled={!name.trim()}>
          <Plus size={13} /> Add
        </Btn>
      </div>

      {/* Row 2: expanded fields */}
      {expanded && (
        <div className="flex gap-2 flex-wrap items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Qty</span>
            <input
              type="number" value={qty} onChange={e => setQty(e.target.value)} min="0.1" step="0.5"
              className="w-16 h-7 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-2 focus:outline-none"
            />
          </div>
          <select value={unit} onChange={e => setUnit(e.target.value as ItemUnit)} className={`${sel} w-20`}>
            {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">₹ Est.</span>
            <input
              type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" placeholder="0"
              className="w-20 h-7 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-2 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Store</span>
            <input
              value={store} onChange={e => setStore(e.target.value)} placeholder="e.g. DMart"
              className="w-24 h-7 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-2 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="rounded accent-accent" />
            Recurring
          </label>
        </div>
      )}
    </div>
  );
}

// ── Item Row ──────────────────────────────────────────────────────────────────

function ItemRow({ item, onRefresh }: { item: CartItem; onRefresh: () => void }) {
  const [editing, setEditing]     = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [actualPrice, setActualPrice]  = useState('');
  const [editName, setEditName]   = useState(item.name);
  const [editPrice, setEditPrice] = useState(String(item.estimatedPrice));
  const [editQty, setEditQty]     = useState(String(item.quantity));
  const [editStore, setEditStore] = useState(item.store ?? '');
  const [editNotes, setEditNotes] = useState(item.notes ?? '');
  const [editPriority, setEditPriority] = useState<ItemPriority>(item.priority);
  const [editRecurring, setEditRecurring] = useState(item.isRecurring);

  const isBought  = item.status === 'bought';
  const isSkipped = item.status === 'skipped';

  const handleBuy = () => {
    markBought(item.id, actualPrice ? parseFloat(actualPrice) : undefined);
    setShowBuyModal(false);
    setActualPrice('');
    onRefresh();
  };

  const handleUndoBuy = () => { markPending(item.id); onRefresh(); };

  const handleSkip = () => {
    updateItem(item.id, { status: 'skipped' });
    onRefresh();
  };

  const handleDelete = () => { deleteItem(item.id); onRefresh(); };

  const saveEdit = () => {
    updateItem(item.id, {
      name: editName.trim() || item.name,
      estimatedPrice: parseFloat(editPrice) || 0,
      quantity: parseFloat(editQty) || 1,
      store: editStore.trim() || undefined,
      notes: editNotes.trim() || undefined,
      priority: editPriority,
      isRecurring: editRecurring,
    });
    setEditing(false);
    onRefresh();
  };

  const rowBase = `group flex items-start gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 transition-colors ${
    isBought  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 opacity-75' :
    isSkipped ? 'bg-slate-50 dark:bg-slate-900/50 opacity-50' :
    'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
  }`;

  if (editing) {
    const inp = 'h-7 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-accent/50';
    return (
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-accent/5">
        <div className="flex gap-2 flex-wrap mb-2">
          <input value={editName} onChange={e => setEditName(e.target.value)}
            className={`${inp} flex-1 min-w-[140px] h-8 text-sm`} />
          <select value={editPriority} onChange={e => setEditPriority(e.target.value as ItemPriority)}
            className={`${inp} w-24`}>
            <option value="need">Need</option>
            <option value="want">Want</option>
            <option value="luxury">Luxury</option>
          </select>
          <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)}
            className={`${inp} w-16`} placeholder="Qty" />
          <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
            className={`${inp} w-20`} placeholder="₹ Est." />
          <input value={editStore} onChange={e => setEditStore(e.target.value)}
            className={`${inp} w-24`} placeholder="Store" />
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input type="checkbox" checked={editRecurring} onChange={e => setEditRecurring(e.target.checked)} className="accent-accent" />
            Recurring
          </label>
        </div>
        <input value={editNotes} onChange={e => setEditNotes(e.target.value)}
          className={`${inp} w-full h-7 mb-2`} placeholder="Notes (optional)" />
        <div className="flex gap-2">
          <Btn variant="primary" onClick={saveEdit}><Save size={12} /> Save</Btn>
          <Btn onClick={() => setEditing(false)}><X size={12} /> Cancel</Btn>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={rowBase}>
        {/* Status toggle */}
        <button
          onClick={() => isBought ? handleUndoBuy() : setShowBuyModal(true)}
          className="mt-0.5 flex-shrink-0"
          title={isBought ? 'Undo bought' : 'Mark as bought'}
        >
          {isBought ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : isSkipped ? (
            <MinusCircle size={18} className="text-slate-300 dark:text-slate-600" />
          ) : (
            <Circle size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-accent/60 transition-colors" />
          )}
        </button>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${isBought || isSkipped ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {item.name}
            </span>
            <PriorityBadge priority={item.priority} />
            {item.isRecurring && (
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <RefreshCw size={9} /> Recurring
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{item.quantity} {item.unit}</span>
            {item.estimatedPrice > 0 && (
              <span>Est. {fmtPrice(item.estimatedPrice * item.quantity)}</span>
            )}
            {isBought && item.actualPrice !== undefined && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Paid {fmtPrice(item.actualPrice * item.quantity)}
                {item.actualPrice < item.estimatedPrice && (
                  <span className="ml-1 text-emerald-500">↓ saved {fmtPrice((item.estimatedPrice - item.actualPrice) * item.quantity)}</span>
                )}
                {item.actualPrice > item.estimatedPrice && (
                  <span className="ml-1 text-rose-500">↑ over {fmtPrice((item.actualPrice - item.estimatedPrice) * item.quantity)}</span>
                )}
              </span>
            )}
            {item.store && <span>@ {item.store}</span>}
            {item.notes && <span className="italic">"{item.notes}"</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!isBought && !isSkipped && (
            <>
              <button onClick={() => setEditing(true)} title="Edit"
                className="p-1 rounded text-slate-400 hover:text-accent">
                <Edit3 size={13} />
              </button>
              <button onClick={handleSkip} title="Skip item"
                className="p-1 rounded text-slate-400 hover:text-amber-500">
                <MinusCircle size={13} />
              </button>
            </>
          )}
          {isSkipped && (
            <button onClick={() => { updateItem(item.id, { status: 'pending' }); onRefresh(); }} title="Restore"
              className="p-1 rounded text-slate-400 hover:text-accent">
              <RotateCcw size={13} />
            </button>
          )}
          <button onClick={handleDelete} title="Delete"
            className="p-1 rounded text-slate-400 hover:text-red-500">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Buy modal */}
      {showBuyModal && (
        <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            Mark "{item.name}" as bought
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Actual price ₹</span>
              <input
                type="number"
                value={actualPrice}
                onChange={e => setActualPrice(e.target.value)}
                placeholder={String(item.estimatedPrice || 0)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleBuy()}
                className="w-24 h-7 text-xs border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 rounded-lg px-2 focus:outline-none"
              />
            </div>
            <Btn variant="primary" onClick={handleBuy}><Check size={12} /> Confirm</Btn>
            <Btn onClick={() => setShowBuyModal(false)}><X size={12} /> Cancel</Btn>
          </div>
        </div>
      )}
    </>
  );
}

// ── Cart Tab ──────────────────────────────────────────────────────────────────

function CartTab({ listId, onRefresh }: { listId: string; onRefresh: () => void }) {
  const [items, setItems]       = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('by-category');
  const [filter, setFilter]     = useState<FilterMode>('all');
  const [tick, setTick]         = useState(0);

  const refresh = useCallback(() => {
    const store = loadSCStore();
    setItems(store.items.filter(i => i.listId === listId));
    setTick(t => t + 1);
    onRefresh();
  }, [listId, onRefresh]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('sc-store-updated', handler);
    return () => window.removeEventListener('sc-store-updated', handler);
  }, [refresh]);

  const filtered = items.filter(i => {
    if (filter === 'all') return true;
    return i.status === filter;
  });

  const summary = computeSummary(items);

  const sel = 'h-7 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg px-2 focus:outline-none';

  const renderItems = () => {
    if (filtered.length === 0) {
      return (
        <EmptyState
          emoji="🛒"
          title={filter === 'all' ? 'Your cart is empty' : `No ${filter} items`}
          sub={filter === 'all' ? 'Add your first item above — press Enter to add fast' : 'Change filter to see other items'}
        />
      );
    }

    if (viewMode === 'by-category') {
      const groups = groupByCategory(filtered);
      return groups.map(group => (
        <div key={group.category}>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            <span className="text-sm">{CATEGORY_EMOJI[group.category] ?? '📦'}</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{group.category}</span>
            <span className="text-xs text-slate-400">({group.items.length})</span>
            {group.estimatedTotal > 0 && (
              <span className="ml-auto text-xs font-semibold text-slate-500">{fmtPrice(group.estimatedTotal)}</span>
            )}
          </div>
          {group.items.map(item => (
            <ItemRow key={item.id} item={item} onRefresh={refresh} />
          ))}
        </div>
      ));
    }

    if (viewMode === 'by-priority') {
      const priorities: ItemPriority[] = ['need', 'want', 'luxury'];
      return priorities.map(p => {
        const pItems = filtered.filter(i => i.priority === p);
        if (pItems.length === 0) return null;
        const m = PRIORITY_META[p];
        return (
          <div key={p}>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <span className={`w-2 h-2 rounded-full ${m.dot}`} />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{m.label}</span>
              <span className="text-xs text-slate-400">({pItems.length})</span>
              <span className="ml-auto text-xs font-semibold text-slate-500">
                {fmtPrice(pItems.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0))}
              </span>
            </div>
            {pItems.sort((a, b) => a.sortOrder - b.sortOrder).map(item => (
              <ItemRow key={item.id} item={item} onRefresh={refresh} />
            ))}
          </div>
        );
      });
    }

    // flat
    return filtered
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => <ItemRow key={item.id} item={item} onRefresh={refresh} />);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick add */}
      <QuickAddForm listId={listId} onAdded={refresh} />

      {/* Controls bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F111A] flex-wrap">
        <select value={viewMode} onChange={e => setViewMode(e.target.value as ViewMode)} className={sel}>
          <option value="by-category">By Category</option>
          <option value="by-priority">By Priority</option>
          <option value="flat">Flat List</option>
        </select>
        <select value={filter} onChange={e => setFilter(e.target.value as FilterMode)} className={sel}>
          <option value="all">All ({items.length})</option>
          <option value="pending">Pending ({summary.pending})</option>
          <option value="bought">Bought ({summary.bought})</option>
          <option value="skipped">Skipped ({summary.skipped})</option>
        </select>
        {summary.bought > 0 && (
          <Btn variant="ghost" onClick={() => { clearBought(listId); refresh(); }}>
            <Trash2 size={12} /> Clear bought
          </Btn>
        )}
        {summary.skipped > 0 && (
          <Btn variant="ghost" onClick={() => { clearSkipped(listId); refresh(); }}>
            <X size={12} /> Clear skipped
          </Btn>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {renderItems()}
      </div>

      {/* Summary footer */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <span className="text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.pending}</span> pending
              {summary.bought > 0 && <> · <span className="font-semibold text-emerald-600">{summary.bought}</span> bought</>}
            </span>
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              {summary.needTotal > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-500">Need</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtPrice(summary.needTotal)}</span>
                </span>
              )}
              {summary.wantTotal > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-500">Want</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtPrice(summary.wantTotal)}</span>
                </span>
              )}
              {summary.luxuryTotal > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-slate-500">Luxury</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtPrice(summary.luxuryTotal)}</span>
                </span>
              )}
              <span className="font-bold text-slate-800 dark:text-slate-100 border-l border-slate-300 dark:border-slate-600 pl-3">
                Total Est. {fmtPrice(summary.estimatedTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── New List Modal ────────────────────────────────────────────────────────────

function NewListModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName]     = useState('');
  const [emoji, setEmoji]   = useState('🛒');
  const [color, setColor]   = useState<ListColorKey>('green');
  const [desc, setDesc]     = useState('');
  const [budget, setBudget] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    addList({ name: name.trim(), emoji, color, description: desc.trim() || undefined, isArchived: false, budget: budget ? parseFloat(budget) : undefined });
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">New Shopping List</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Icon</p>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-xl p-1.5 rounded-lg transition-colors ${emoji === e ? 'bg-accent/10 ring-1 ring-accent' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">List Name *</p>
            <input
              value={name} onChange={e => setName(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Monthly Grocery"
              className="w-full h-9 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Color</p>
            <div className="flex gap-2">
              {LIST_COLORS.map(c => (
                <button key={c.key} onClick={() => setColor(c.key as ListColorKey)}
                  className={`w-6 h-6 rounded-full ${c.dot} transition-transform ${color === c.key ? 'ring-2 ring-offset-2 ring-accent scale-110' : 'hover:scale-110'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Optional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Budget ₹</p>
              <input
                type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="optional"
                className="w-full h-8 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 focus:outline-none"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</p>
              <input
                value={desc} onChange={e => setDesc(e.target.value)} placeholder="optional"
                className="w-full h-8 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Btn variant="primary" onClick={handleCreate} disabled={!name.trim()} className="flex-1 justify-center">
            <Plus size={14} /> Create List
          </Btn>
          <Btn onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Lists Tab ─────────────────────────────────────────────────────────────────

function ListsTab({ lists, items, activeListId, onRefresh }: {
  lists: CartList[]; items: CartItem[]; activeListId: string | null; onRefresh: () => void;
}) {
  const [showNew, setShowNew] = useState(false);

  const activeLists   = lists.filter(l => !l.isArchived);
  const archivedLists = lists.filter(l => l.isArchived);

  const getStats = (listId: string) => {
    const listItems = items.filter(i => i.listId === listId);
    return computeSummary(listItems);
  };

  const ListCard = ({ list }: { list: CartList }) => {
    const stats  = getStats(list.id);
    const cMeta  = LIST_COLORS.find(c => c.key === list.color) ?? LIST_COLORS[0];
    const isActive = list.id === activeListId;

    return (
      <div className={`rounded-xl border p-4 transition-colors cursor-pointer ${isActive
        ? 'border-accent bg-accent/5 dark:bg-accent/10'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-accent/40'}`}
        onClick={() => { setActiveList(list.id); onRefresh(); }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{list.emoji}</span>
            <div>
              <p className={`font-semibold text-sm ${isActive ? 'text-accent' : 'text-slate-800 dark:text-slate-100'}`}>
                {list.name}
              </p>
              {list.description && <p className="text-xs text-slate-400">{list.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => updateList(list.id, { isArchived: !list.isArchived })}
              title={list.isArchived ? 'Unarchive' : 'Archive'}
              className="p-1 rounded text-slate-400 hover:text-amber-500">
              <Archive size={13} />
            </button>
            <button onClick={() => {
              if (confirm(`Delete "${list.name}" and all its items?`)) { deleteList(list.id); onRefresh(); }
            }} className="p-1 rounded text-slate-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className={`px-1.5 py-0.5 rounded-full font-semibold ${cMeta.bg} ${cMeta.text}`}>
            {stats.total} items
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">{stats.bought} bought</span>
          <span className="text-slate-400">{stats.pending} pending</span>
          {stats.estimatedTotal > 0 && (
            <span className="ml-auto font-semibold text-slate-700 dark:text-slate-300">
              {fmtPrice(stats.estimatedTotal)}
            </span>
          )}
        </div>

        {list.budget && stats.estimatedTotal > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Budget: {fmtPrice(list.budget)}</span>
              <span className={stats.estimatedTotal > list.budget ? 'text-red-500' : 'text-emerald-600'}>
                {stats.estimatedTotal > list.budget ? `Over by ${fmtPrice(stats.estimatedTotal - list.budget)}` : `${fmtPrice(list.budget - stats.estimatedTotal)} remaining`}
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${stats.estimatedTotal > list.budget ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (stats.estimatedTotal / list.budget) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {activeLists.length} active list{activeLists.length !== 1 ? 's' : ''}
        </p>
        <Btn variant="primary" onClick={() => setShowNew(true)}>
          <Plus size={13} /> New List
        </Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {activeLists.map(list => <ListCard key={list.id} list={list} />)}
      </div>

      {archivedLists.length > 0 && (
        <>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Archived</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
            {archivedLists.map(list => <ListCard key={list.id} list={list} />)}
          </div>
        </>
      )}

      {showNew && (
        <NewListModal onClose={() => setShowNew(false)} onCreated={onRefresh} />
      )}
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab({ items, lists }: { items: CartItem[]; lists: CartList[] }) {
  const boughtItems = items
    .filter(i => i.status === 'bought')
    .sort((a, b) => new Date(b.boughtAt ?? b.addedAt).getTime() - new Date(a.boughtAt ?? a.addedAt).getTime());

  if (boughtItems.length === 0) {
    return <EmptyState emoji="🕐" title="No purchase history yet" sub="Mark items as bought in the Cart tab to build your history" />;
  }

  const totalEstimated = boughtItems.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);
  const totalActual    = boughtItems.reduce((s, i) => s + (i.actualPrice ?? i.estimatedPrice) * i.quantity, 0);
  const savedTotal     = totalEstimated - totalActual;

  const getListName = (listId: string) => lists.find(l => l.id === listId)?.name ?? 'Unknown';

  // Category breakdown
  const catMap = new Map<string, { est: number; actual: number; count: number }>();
  boughtItems.forEach(i => {
    const cur = catMap.get(i.category) ?? { est: 0, actual: 0, count: 0 };
    catMap.set(i.category, {
      est:    cur.est    + i.estimatedPrice * i.quantity,
      actual: cur.actual + (i.actualPrice ?? i.estimatedPrice) * i.quantity,
      count:  cur.count  + 1,
    });
  });
  const catBreakdown = Array.from(catMap.entries())
    .sort((a, b) => b[1].actual - a[1].actual);

  return (
    <div className="p-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{boughtItems.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Items Bought</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{fmtPrice(totalActual)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Spent</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${savedTotal >= 0
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'}`}>
          <p className={`text-lg font-bold flex items-center justify-center gap-1 ${savedTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {savedTotal >= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            {fmtPrice(Math.abs(savedTotal))}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{savedTotal >= 0 ? 'Saved' : 'Over Budget'}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">By Category</p>
        </div>
        {catBreakdown.map(([cat, d]) => (
          <div key={cat} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-base">{CATEGORY_EMOJI[cat as CartItemCategory] ?? '📦'}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{fmtPrice(d.actual)}</span>
              </div>
              <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent/60 rounded-full" style={{ width: `${(d.actual / totalActual) * 100}%` }} />
              </div>
            </div>
            <span className="text-xs text-slate-400 w-14 text-right">{d.count} item{d.count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>

      {/* Item list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Recent Purchases</p>
        </div>
        {boughtItems.slice(0, 50).map(item => {
          const actual = (item.actualPrice ?? item.estimatedPrice) * item.quantity;
          const est    = item.estimatedPrice * item.quantity;
          const diff   = actual - est;
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">
                  {getListName(item.listId)} · {fmtDate(item.boughtAt ?? item.addedAt)}
                </p>
              </div>
              <PriorityBadge priority={item.priority} />
              <div className="text-right text-xs flex-shrink-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{fmtPrice(actual)}</p>
                {diff !== 0 && (
                  <p className={diff > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                    {diff > 0 ? '+' : ''}{fmtPrice(diff)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Budget Pulse Tab ──────────────────────────────────────────────────────────

function BudgetPulseTab({ items, lists, activeListId }: {
  items: CartItem[]; lists: CartList[]; activeListId: string | null;
}) {
  const [bpData, setBpData] = useState<{
    envelopes: { category: string; allocated: number }[];
    month: string;
  } | null>(null);
  const [hasBP, setHasBP] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('otsd-monthly-budget-planner');
      if (!raw) return;
      const store = JSON.parse(raw);
      const month = new Date().toISOString().slice(0, 7);
      const plan  = store.plans?.[month] ?? null;
      if (plan && Array.isArray(plan.envelopes) && plan.envelopes.length > 0) {
        setHasBP(true);
        setBpData({ envelopes: plan.envelopes.map((e: {category:string;allocated:number}) => ({ category: e.category, allocated: e.allocated })), month });
      }
    } catch { /* ignore */ }
  }, []);

  const cartItems = activeListId ? items.filter(i => i.listId === activeListId && i.status !== 'skipped') : [];
  const summary   = computeSummary(cartItems);

  // Map cart categories to budget categories
  const GROCERY_CATS: CartItemCategory[] = ['Grocery', 'Fruits & Veg', 'Dairy', 'Meat & Fish'];
  const HEALTH_CATS:  CartItemCategory[] = ['Medicine'];
  const CARE_CATS:    CartItemCategory[] = ['Personal Care'];

  const groceryEst  = cartItems.filter(i => GROCERY_CATS.includes(i.category)).reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);
  const healthEst   = cartItems.filter(i => HEALTH_CATS.includes(i.category)).reduce((s, i)  => s + i.estimatedPrice * i.quantity, 0);
  const careEst     = cartItems.filter(i => CARE_CATS.includes(i.category)).reduce((s, i)    => s + i.estimatedPrice * i.quantity, 0);
  const otherEst    = cartItems.filter(i => ![...GROCERY_CATS, ...HEALTH_CATS, ...CARE_CATS].includes(i.category)).reduce((s, i) => s + i.estimatedPrice * i.quantity, 0);

  const PulseCard = ({ label, cartEst, budgetAlloc, emoji }: { label: string; cartEst: number; budgetAlloc: number | null; emoji: string }) => {
    const pct    = budgetAlloc && budgetAlloc > 0 ? (cartEst / budgetAlloc) * 100 : null;
    const over   = pct !== null && pct > 100;
    const warn   = pct !== null && pct > 75 && !over;

    return (
      <div className={`rounded-xl border p-4 ${over ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : warn ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
            {budgetAlloc !== null && (
              <p className="text-xs text-slate-400">Budget: {fmtPrice(budgetAlloc)}</p>
            )}
          </div>
          {over && <AlertCircle size={16} className="text-red-500" />}
          {warn && <AlertCircle size={16} className="text-amber-500" />}
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500">Cart estimate</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{fmtPrice(cartEst)}</p>
          </div>
          {budgetAlloc !== null && pct !== null && (
            <div className="text-right">
              <p className="text-xs text-slate-500">of budget</p>
              <p className={`text-lg font-bold ${over ? 'text-red-500' : warn ? 'text-amber-500' : 'text-emerald-600'}`}>
                {Math.round(pct)}%
              </p>
            </div>
          )}
        </div>

        {budgetAlloc !== null && (
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, pct ?? 0)}%` }}
            />
          </div>
        )}

        {budgetAlloc !== null && cartEst > 0 && (
          <p className={`text-xs mt-2 ${over ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {over
              ? `⚠️ Over by ${fmtPrice(cartEst - budgetAlloc)}`
              : `✓ ${fmtPrice(budgetAlloc - cartEst)} remaining in budget`}
          </p>
        )}

        {budgetAlloc === null && cartEst > 0 && (
          <p className="text-xs text-slate-400 mt-1">No budget set for this category</p>
        )}
      </div>
    );
  };

  const getEnvelopeAlloc = (keywords: string[]): number | null => {
    if (!bpData) return null;
    const match = bpData.envelopes.find(e =>
      keywords.some(kw => e.category.toLowerCase().includes(kw.toLowerCase()))
    );
    return match?.allocated ?? null;
  };

  const activeList = lists.find(l => l.id === activeListId);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Zap size={20} className="text-accent" />
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">Budget Pulse</p>
          <p className="text-xs text-slate-500">
            {hasBP
              ? `Comparing against ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} budget plan`
              : 'Set up Budget Planner to see live budget comparison'}
          </p>
        </div>
      </div>

      {/* Cart overview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          Cart: {activeList?.name ?? 'Active List'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-rose-600">{fmtPrice(summary.needTotal)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Need</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">{fmtPrice(summary.wantTotal)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Want</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{fmtPrice(summary.luxuryTotal)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Luxury</p>
          </div>
        </div>
        {summary.estimatedTotal > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-slate-500">Total Estimated</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{fmtPrice(summary.estimatedTotal)}</span>
          </div>
        )}
        {summary.luxuryTotal > 0 && (
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-slate-500">Luxury (optional)</span>
            <span className="text-purple-600 font-semibold">
              Skip to save {fmtPrice(summary.luxuryTotal)} ({Math.round((summary.luxuryTotal / summary.estimatedTotal) * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* Budget comparison */}
      {!hasBP ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 text-center">
          <Wallet size={28} className="text-blue-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Budget Planner not set up</p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-3">
            Set up your monthly budget in the <strong>Personal Finance → Budget Planner</strong> tool to see how this cart compares to your allocated budget for each category.
          </p>
          <a href="/tools/personal-finance/pf-budget-planner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
            <Wallet size={13} /> Go to Budget Planner
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groceryEst > 0 && (
            <PulseCard
              label="Grocery"
              emoji="🛒"
              cartEst={groceryEst}
              budgetAlloc={getEnvelopeAlloc(['Grocery', 'Food', 'groceries'])}
            />
          )}
          {healthEst > 0 && (
            <PulseCard
              label="Medicine & Health"
              emoji="💊"
              cartEst={healthEst}
              budgetAlloc={getEnvelopeAlloc(['Health', 'Medicine', 'medical'])}
            />
          )}
          {careEst > 0 && (
            <PulseCard
              label="Personal Care"
              emoji="🧴"
              cartEst={careEst}
              budgetAlloc={getEnvelopeAlloc(['Personal Care', 'toiletries', 'hygiene'])}
            />
          )}
          {otherEst > 0 && (
            <PulseCard
              label="Other Items"
              emoji="📦"
              cartEst={otherEst}
              budgetAlloc={getEnvelopeAlloc(['Shopping', 'misc', 'Miscellaneous'])}
            />
          )}
        </div>
      )}

      {/* Need vs Want insight */}
      {summary.estimatedTotal > 0 && (
        <div className="mt-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Spend Intelligence</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Essential (Need)</span>
                <span className="font-semibold text-rose-600">{Math.round((summary.needTotal / summary.estimatedTotal) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(summary.needTotal / summary.estimatedTotal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Discretionary (Want)</span>
                <span className="font-semibold text-amber-600">{Math.round((summary.wantTotal / summary.estimatedTotal) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(summary.wantTotal / summary.estimatedTotal) * 100}%` }} />
              </div>
            </div>
            {summary.luxuryTotal > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Luxury (Optional)</span>
                  <span className="font-semibold text-purple-600">{Math.round((summary.luxuryTotal / summary.estimatedTotal) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(summary.luxuryTotal / summary.estimatedTotal) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
          {summary.needTotal / summary.estimatedTotal >= 0.8 && (
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Great — {Math.round((summary.needTotal / summary.estimatedTotal) * 100)}% of your cart is essentials. Smart shopping!
            </p>
          )}
          {summary.luxuryTotal / summary.estimatedTotal > 0.3 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚡ Tip: {Math.round((summary.luxuryTotal / summary.estimatedTotal) * 100)}% of your cart is luxury items. Consider deferring some to save {fmtPrice(summary.luxuryTotal)}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SmartCart() {
  const [mounted, setMounted]       = useState(false);
  const [tab, setTab]               = useState<Tab>('cart');
  const [lists, setLists]           = useState<CartList[]>([]);
  const [items, setItems]           = useState<CartItem[]>([]);
  const [activeListId, setActiveLId] = useState<string | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [showClone, setShowClone]   = useState(false);
  const [cloneName, setCloneName]   = useState('');
  const [showExport, setShowExport] = useState(false);
  const [listDropdown, setListDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const store = loadSCStore();
    setLists(store.lists);
    setItems(store.items);
    setActiveLId(store.activeListId);
  }, []);

  useEffect(() => { setMounted(true); refresh(); }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('sc-store-updated', handler);
    return () => window.removeEventListener('sc-store-updated', handler);
  }, [refresh]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setListDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const activeList   = lists.find(l => l.id === activeListId);
  const activeLists  = lists.filter(l => !l.isArchived);
  const activeItems  = activeListId ? items.filter(i => i.listId === activeListId) : [];
  const pendingCount = activeItems.filter(i => i.status === 'pending').length;

  const exportText = () => {
    if (!activeList) return;
    const listItems = items.filter(i => i.listId === activeListId && i.status === 'pending');
    const groups = groupByCategory(listItems);
    let text = `${activeList.emoji} ${activeList.name}\n`;
    text += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    groups.forEach(g => {
      text += `── ${g.category} ──\n`;
      g.items.forEach(i => {
        text += `  ${i.priority === 'need' ? '●' : i.priority === 'want' ? '○' : '◇'} ${i.name} (${i.quantity} ${i.unit})`;
        if (i.estimatedPrice > 0) text += ` ~₹${i.estimatedPrice}`;
        text += '\n';
      });
      text += '\n';
    });
    const summary = computeSummary(listItems);
    text += `Total Estimated: ₹${summary.estimatedTotal}`;
    navigator.clipboard.writeText(text).then(() => setShowExport(true));
    setTimeout(() => setShowExport(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F111A]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F111A] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Smart Cart</h1>
            <p className="text-[10px] text-slate-400 leading-tight">by Claude · Daily Utility</p>
          </div>
        </div>

        {/* List selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setListDropdown(p => !p)}
              className="flex items-center gap-2 h-8 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-accent/50 bg-white dark:bg-slate-900 transition-colors"
            >
              <span>{activeList?.emoji ?? '🛒'}</span>
              <span>{activeList?.name ?? 'Select list'}</span>
              {pendingCount > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
              <ChevronDown size={12} className={listDropdown ? 'rotate-180' : ''} />
            </button>
            {listDropdown && (
              <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl min-w-[200px] py-1">
                {activeLists.map(l => {
                  const cnt = items.filter(i => i.listId === l.id && i.status === 'pending').length;
                  return (
                    <button
                      key={l.id}
                      onClick={() => { setActiveList(l.id); setListDropdown(false); refresh(); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-left ${l.id === activeListId ? 'text-accent font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <span>{l.emoji}</span>
                      <span className="flex-1">{l.name}</span>
                      {cnt > 0 && <span className="text-slate-400">{cnt}</span>}
                    </button>
                  );
                })}
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => { setListDropdown(false); setShowNewList(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-accent hover:bg-accent/5"
                  >
                    <Plus size={12} /> New List
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeList && (
            <>
              <Btn variant="ghost" onClick={exportText} title="Copy list as text">
                {showExport ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {showExport ? 'Copied!' : 'Export'}
              </Btn>
              {items.some(i => i.listId === activeListId && i.isRecurring) && (
                <Btn variant="ghost" onClick={() => setShowClone(true)} title="Clone recurring items to new list">
                  <RefreshCw size={13} /> Clone
                </Btn>
              )}
            </>
          )}
          <Btn variant="primary" onClick={() => setShowNewList(true)}>
            <Plus size={13} /> New List
          </Btn>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F111A] overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {TAB_LABELS[t].icon}
            {TAB_LABELS[t].label}
            {t === 'history' && items.filter(i => i.status === 'bought').length > 0 && (
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 rounded-full">
                {items.filter(i => i.status === 'bought').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'cart' && (
          activeListId
            ? <CartTab listId={activeListId} onRefresh={refresh} />
            : <EmptyState emoji="🛒" title="No list selected" sub="Create a new list to start adding items" />
        )}
        {tab === 'lists' && (
          <ListsTab lists={lists} items={items} activeListId={activeListId} onRefresh={refresh} />
        )}
        {tab === 'history' && <HistoryTab items={items} lists={lists} />}
        {tab === 'budget' && (
          <BudgetPulseTab items={items} lists={lists} activeListId={activeListId} />
        )}
      </div>

      {/* ── New list modal ─────────────────────────────────────────────────── */}
      {showNewList && (
        <NewListModal onClose={() => setShowNewList(false)} onCreated={refresh} />
      )}

      {/* ── Clone modal ────────────────────────────────────────────────────── */}
      {showClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <RefreshCw size={16} className="text-accent" /> Clone Recurring Items
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Creates a fresh list with all recurring items from "{activeList?.name}" pre-populated as pending.
            </p>
            <input
              value={cloneName}
              onChange={e => setCloneName(e.target.value)}
              placeholder={`${activeList?.name} (copy)`}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  cloneListRecurring(activeListId!, cloneName || `${activeList?.name} (copy)`);
                  setShowClone(false); setCloneName(''); refresh();
                }
              }}
              className="w-full h-9 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 mb-4 focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
            <div className="flex gap-2">
              <Btn variant="primary" className="flex-1 justify-center"
                onClick={() => {
                  cloneListRecurring(activeListId!, cloneName || `${activeList?.name} (copy)`);
                  setShowClone(false); setCloneName(''); refresh();
                }}>
                <RefreshCw size={13} /> Clone List
              </Btn>
              <Btn onClick={() => setShowClone(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
