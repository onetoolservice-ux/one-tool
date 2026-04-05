'use client';
// ══════════════════════════════════════════════════════════════════════════════
// Grocery Items — Daily Utility Tool
// Designed by Claude
//
// Features:
//   · Quick-add items with section, qty, unit, brand, estimated price
//   · Store-section grouped checklist view
//   · Check off items as you shop — running total updates live
//   · Actual price entry on check-off for spend tracking
//   · Save frequently-bought items as templates for one-tap re-add
//   · Clear checked / uncheck all
//   · Export list as plain text
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart, Plus, Trash2, Check, X, BookMarked,
  Download, RotateCcw, ChevronDown, Edit3, Save,
  Package, Bookmark, BookmarkCheck, CircleDot, Circle,
} from 'lucide-react';

import {
  loadGIStore, saveGIStore,
  addItem, updateItem, deleteItem, toggleChecked,
  clearChecked, uncheckAll,
  saveTemplate, deleteTemplate, addFromTemplate,
  computeSummary, groupBySection, exportAsText,
  fmtPrice,
  STORE_SECTIONS, UNIT_OPTIONS, SECTION_EMOJI,
  type GroceryItem, type GroceryStore, type StoreSection, type GroceryUnit,
  type SavedTemplate,
} from './grocery-items-store';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = ['list', 'saved'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, { label: string; icon: React.ReactNode }> = {
  list:  { label: 'Grocery List', icon: <ShoppingCart size={14} /> },
  saved: { label: 'Saved Items',  icon: <BookMarked size={14} />   },
};

// ── Tiny atoms ────────────────────────────────────────────────────────────────

function Btn({
  onClick, children, variant = 'default', disabled, title, className = '',
}: {
  onClick?: () => void; children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  disabled?: boolean; title?: string; className?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles: Record<string, string> = {
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

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/40';

const selectCls =
  'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/40';

// ── Add-item form ─────────────────────────────────────────────────────────────

interface AddFormState {
  name: string;
  section: StoreSection;
  qty: string;
  unit: GroceryUnit;
  brand: string;
  estimatedPrice: string;
  note: string;
  expanded: boolean;
}

const defaultForm = (): AddFormState => ({
  name: '',
  section: 'Produce',
  qty: '1',
  unit: 'pcs',
  brand: '',
  estimatedPrice: '',
  note: '',
  expanded: false,
});

function AddItemForm({ onAdd }: { onAdd: (item: Omit<GroceryItem, 'id' | 'checked' | 'addedAt'>) => void }) {
  const [f, setF] = useState<AddFormState>(defaultForm);
  const nameRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof AddFormState>(k: K, v: AddFormState[K]) {
    setF(prev => ({ ...prev, [k]: v }));
  }

  function submit() {
    const name = f.name.trim();
    if (!name) return;
    const qty = parseFloat(f.qty) || 1;
    const estimatedPrice = f.estimatedPrice ? parseFloat(f.estimatedPrice) || undefined : undefined;
    onAdd({
      name,
      section: f.section,
      qty,
      unit: f.unit,
      brand: f.brand.trim() || undefined,
      note: f.note.trim() || undefined,
      estimatedPrice,
    });
    setF(prev => ({ ...defaultForm(), section: prev.section, unit: prev.unit, expanded: prev.expanded }));
    nameRef.current?.focus();
  }

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      {/* Name row */}
      <div className="flex gap-2">
        <input
          ref={nameRef}
          value={f.name}
          onChange={e => set('name', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Item name — press Enter to add"
          className={`${inputCls} flex-1`}
        />
        <button
          onClick={submit}
          disabled={!f.name.trim()}
          className="flex-shrink-0 bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Section + qty row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Field label="Section">
            <select value={f.section} onChange={e => set('section', e.target.value as StoreSection)} className={selectCls}>
              {STORE_SECTIONS.map(s => (
                <option key={s} value={s}>{SECTION_EMOJI[s]} {s}</option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <Field label="Qty">
            <input type="number" min="0.1" step="0.1" value={f.qty}
              onChange={e => set('qty', e.target.value)}
              className={inputCls} />
          </Field>
        </div>
        <div>
          <Field label="Unit">
            <select value={f.unit} onChange={e => set('unit', e.target.value as GroceryUnit)} className={selectCls}>
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* More fields toggle */}
      <button
        onClick={() => set('expanded', !f.expanded)}
        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-accent transition-colors"
      >
        <ChevronDown size={12} className={`transition-transform ${f.expanded ? 'rotate-180' : ''}`} />
        {f.expanded ? 'Less' : 'Brand · Price · Note'}
      </button>

      {f.expanded && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Field label="Brand">
              <input value={f.brand} onChange={e => set('brand', e.target.value)}
                placeholder="Optional" className={inputCls} />
            </Field>
          </div>
          <div>
            <Field label="Est. Price (₹)">
              <input type="number" min="0" step="0.5" value={f.estimatedPrice}
                onChange={e => set('estimatedPrice', e.target.value)}
                placeholder="0" className={inputCls} />
            </Field>
          </div>
          <div>
            <Field label="Note">
              <input value={f.note} onChange={e => set('note', e.target.value)}
                placeholder="Optional" className={inputCls} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline actual-price prompt ────────────────────────────────────────────────

function ActualPriceInput({
  item,
  onSave,
  onCancel,
}: {
  item: GroceryItem;
  onSave: (price: number | undefined) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(item.actualPrice?.toString() ?? item.estimatedPrice?.toString() ?? '');
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[11px] text-slate-400">Actual price/unit ₹</span>
      <input
        autoFocus
        type="number" min="0" step="0.5"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(val ? parseFloat(val) : undefined);
          if (e.key === 'Escape') onCancel();
        }}
        className="w-24 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <button onClick={() => onSave(val ? parseFloat(val) : undefined)}
        className="text-accent hover:opacity-80"><Check size={13} /></button>
      <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
    </div>
  );
}

// ── Single item row ───────────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggle,
  onDelete,
  onUpdate,
  onSave,
}: {
  item: GroceryItem;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<GroceryItem>) => void;
  onSave: () => void;
}) {
  const [askPrice, setAskPrice] = useState(false);

  function handleCheck() {
    if (!item.checked) {
      setAskPrice(true);
    } else {
      onToggle();
    }
  }

  function confirmCheck(price: number | undefined) {
    onUpdate({ checked: true, actualPrice: price });
    setAskPrice(false);
  }

  const priceDisplay = item.checked
    ? item.actualPrice != null
      ? fmtPrice(item.actualPrice * item.qty)
      : item.estimatedPrice != null ? fmtPrice(item.estimatedPrice * item.qty) : null
    : item.estimatedPrice != null
      ? fmtPrice(item.estimatedPrice * item.qty)
      : null;

  return (
    <div className={`group flex flex-col gap-1 px-3 py-2.5 rounded-xl border transition-colors ${
      item.checked
        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/40 opacity-60'
        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-2.5">
        {/* Check button */}
        <button onClick={handleCheck} className="flex-shrink-0 text-slate-400 hover:text-accent transition-colors">
          {item.checked
            ? <CircleDot size={18} className="text-accent" />
            : <Circle size={18} />}
        </button>

        {/* Name & meta */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {item.name}
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="text-[11px] text-slate-400">{item.qty} {item.unit}</span>
            {item.brand && <span className="text-[11px] text-slate-400">· {item.brand}</span>}
            {item.note  && <span className="text-[11px] text-slate-400 italic">· {item.note}</span>}
          </div>
        </div>

        {/* Price */}
        {priceDisplay && (
          <span className={`text-xs font-semibold flex-shrink-0 ${item.checked ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {priceDisplay}
          </span>
        )}

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onSave} title="Save as template"
            className="text-slate-300 hover:text-amber-500 dark:text-slate-600 dark:hover:text-amber-400 transition-colors">
            <Bookmark size={13} />
          </button>
          <button onClick={onDelete} title="Remove"
            className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Actual price input */}
      {askPrice && (
        <ActualPriceInput
          item={item}
          onSave={confirmCheck}
          onCancel={() => setAskPrice(false)}
        />
      )}
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ store }: { store: GroceryStore }) {
  const s = computeSummary(store.items);
  if (s.total === 0) return null;
  const pct = s.total > 0 ? Math.round((s.checked / s.total) * 100) : 0;
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {s.checked}/{s.total} items · <span className="font-semibold text-slate-700 dark:text-slate-200">{s.remaining} remaining</span>
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {s.estimatedChecked > 0
            ? `Spent ${fmtPrice(s.estimatedChecked)} / Est. ${fmtPrice(s.estimatedTotal)}`
            : s.estimatedTotal > 0 ? `Est. ${fmtPrice(s.estimatedTotal)}` : ''}
        </span>
      </div>
    </div>
  );
}

// ── List Tab ──────────────────────────────────────────────────────────────────

function ListTab({
  store,
  onChange,
}: {
  store: GroceryStore;
  onChange: (s: GroceryStore) => void;
}) {
  const grouped = groupBySection(store.items);
  const pendingItems = store.items.filter(i => !i.checked);
  const checkedItems = store.items.filter(i => i.checked);

  function handleAdd(fields: Omit<GroceryItem, 'id' | 'checked' | 'addedAt'>) {
    onChange(addItem(store, fields));
  }

  function handleExport() {
    const text = exportAsText(store);
    navigator.clipboard.writeText(text).catch(() => {});
    const el = document.createElement('a');
    el.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    el.download = `${store.listName.replace(/\s+/g, '-')}.txt`;
    el.click();
  }

  const allSections = STORE_SECTIONS.filter(s => grouped.has(s));

  return (
    <div className="space-y-4">
      {/* List name + actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <ListNameEditor store={store} onChange={onChange} />
        <div className="flex items-center gap-2">
          {checkedItems.length > 0 && (
            <Btn onClick={() => onChange(clearChecked(store))} variant="danger">
              <Trash2 size={12} /> Clear checked ({checkedItems.length})
            </Btn>
          )}
          {checkedItems.length > 0 && (
            <Btn onClick={() => onChange(uncheckAll(store))}>
              <RotateCcw size={12} /> Uncheck all
            </Btn>
          )}
          {store.items.length > 0 && (
            <Btn onClick={handleExport}>
              <Download size={12} /> Export
            </Btn>
          )}
        </div>
      </div>

      {/* Summary */}
      <SummaryBar store={store} />

      {/* Add form */}
      <AddItemForm onAdd={handleAdd} />

      {/* Items grouped by section */}
      {store.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Your list is empty</p>
          <p className="text-xs text-slate-400">Type an item above and press Enter to add it.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {allSections.map(section => {
            const items = grouped.get(section) ?? [];
            const pendingInSection = items.filter(i => !i.checked);
            const checkedInSection = items.filter(i => i.checked);
            return (
              <div key={section}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{SECTION_EMOJI[section]}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{section}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{pendingInSection.length} left</span>
                </div>
                <div className="space-y-1.5">
                  {pendingInSection.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => onChange(toggleChecked(store, item.id))}
                      onDelete={() => onChange(deleteItem(store, item.id))}
                      onUpdate={patch => onChange(updateItem(store, item.id, patch))}
                      onSave={() => onChange(saveTemplate(store, item))}
                    />
                  ))}
                  {checkedInSection.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => onChange(toggleChecked(store, item.id))}
                      onDelete={() => onChange(deleteItem(store, item.id))}
                      onUpdate={patch => onChange(updateItem(store, item.id, patch))}
                      onSave={() => onChange(saveTemplate(store, item))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── List name editor ──────────────────────────────────────────────────────────

function ListNameEditor({
  store,
  onChange,
}: {
  store: GroceryStore;
  onChange: (s: GroceryStore) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(store.listName);

  function save() {
    const name = val.trim() || 'My Grocery List';
    onChange({ ...store, listName: name });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          className="text-base font-bold border-b-2 border-accent bg-transparent outline-none text-slate-800 dark:text-slate-100 w-48"
        />
        <button onClick={save} className="text-accent"><Save size={14} /></button>
        <button onClick={() => setEditing(false)} className="text-slate-400"><X size={14} /></button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setVal(store.listName); setEditing(true); }}
      className="flex items-center gap-1.5 text-base font-bold text-slate-800 dark:text-slate-100 hover:text-accent transition-colors group"
    >
      {store.listName}
      <Edit3 size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  );
}

// ── Saved Tab ─────────────────────────────────────────────────────────────────

function SavedTab({
  store,
  onChange,
}: {
  store: GroceryStore;
  onChange: (s: GroceryStore) => void;
}) {
  const saved = store.saved;

  function handleAddToList(tpl: SavedTemplate) {
    onChange(addFromTemplate(store, tpl));
  }

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="text-4xl mb-3">🔖</div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No saved items yet</p>
        <p className="text-xs text-slate-400">
          Hover over any list item and click the bookmark icon to save it as a template for quick re-add.
        </p>
      </div>
    );
  }

  // group saved by section
  const grouped = new Map<StoreSection, SavedTemplate[]>();
  for (const tpl of saved) {
    const arr = grouped.get(tpl.section) ?? [];
    arr.push(tpl);
    grouped.set(tpl.section, arr);
  }

  const sections = Array.from(grouped.keys());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {saved.length} saved item{saved.length !== 1 ? 's' : ''} — tap to add to current list
        </p>
        <Btn
          onClick={() => {
            const next = saved.reduce(
              (s, tpl) => addFromTemplate(s, tpl),
              store,
            );
            onChange(next);
          }}
          variant="primary"
        >
          <Plus size={12} /> Add all to list
        </Btn>
      </div>

      {sections.map(section => (
        <div key={section}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{SECTION_EMOJI[section]}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{section}</span>
          </div>
          <div className="space-y-1.5">
            {(grouped.get(section) ?? []).map(tpl => {
              const inList = store.items.some(
                i => i.name.toLowerCase() === tpl.name.toLowerCase(),
              );
              return (
                <div key={tpl.id}
                  className="group flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleAddToList(tpl)}
                    disabled={inList}
                    title={inList ? 'Already in list' : 'Add to list'}
                    className="flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {inList ? <BookmarkCheck size={16} className="text-accent" /> : <Plus size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{tpl.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">{tpl.qty} {tpl.unit}</span>
                      {tpl.brand && <span className="text-[11px] text-slate-400">· {tpl.brand}</span>}
                      {tpl.estimatedPrice != null && (
                        <span className="text-[11px] text-slate-400">· ~₹{tpl.estimatedPrice}/{tpl.unit}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onChange(deleteTemplate(store, tpl.id))}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-all flex-shrink-0"
                    title="Remove template"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export function GroceryItems() {
  const [store, setStore] = useState<GroceryStore | null>(null);
  const [tab, setTab] = useState<Tab>('list');

  // Load from localStorage once on mount
  useEffect(() => {
    setStore(loadGIStore());
  }, []);

  // Persist on every change
  const handleChange = useCallback((next: GroceryStore) => {
    setStore(next);
    saveGIStore(next);
  }, []);

  if (!store) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
          <ShoppingCart size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Grocery Items</h1>
          <p className="text-xs text-slate-400">Your organised grocery list — section by section</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              tab === t
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {TAB_LABELS[t].icon}
            {TAB_LABELS[t].label}
            {t === 'saved' && store.saved.length > 0 && (
              <span className="ml-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {store.saved.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'list' && <ListTab store={store} onChange={handleChange} />}
      {tab === 'saved' && <SavedTab store={store} onChange={handleChange} />}
    </div>
  );
}

export default GroceryItems;