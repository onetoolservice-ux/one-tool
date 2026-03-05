'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X, SlidersHorizontal, Copy } from 'lucide-react';
import { fmtINR } from './finance-store';

// ══════════════════════════════════════════════════════════════════════════════
// Shared UI primitives for Personal Finance tools
//
// Import from this file in all PF tool components for consistent styling.
// ══════════════════════════════════════════════════════════════════════════════

// ── PFButton ──────────────────────────────────────────────────────────────────
type PFButtonVariant = 'default' | 'primary' | 'danger' | 'active';

const BTN: Record<PFButtonVariant, string> = {
  default: 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500',
  primary: 'border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-600',
  danger:  'border border-slate-300 dark:border-slate-600 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-700',
  active:  'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700',
};

export function PFButton({
  variant = 'default', icon, children, onClick, disabled, title, className = '',
}: {
  variant?: PFButtonVariant; icon?: ReactNode; children?: ReactNode;
  onClick?: () => void; disabled?: boolean; title?: string; className?: string;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
    >
      {icon}{children}
    </button>
  );
}

// ── PFBadge ───────────────────────────────────────────────────────────────────
type PFBadgeColor = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'orange';

const BADGE: Record<PFBadgeColor, string> = {
  blue:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  green:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  amber:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  red:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  slate:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
};

export function PFBadge({ color = 'slate', children }: { color?: PFBadgeColor; children: ReactNode }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE[color]}`}>
      {children}
    </span>
  );
}

// ── PFFilterBarHeader ─────────────────────────────────────────────────────────
export function PFFilterBarHeader({
  activeCount = 0, onClearAll, showFilterBar, onToggle, actions,
}: {
  activeCount?: number; onClearAll?: () => void;
  showFilterBar?: boolean; onToggle?: () => void; actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={13} className="text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filters</span>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {activeCount > 0 && onClearAll && (
          <button onClick={onClearAll} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
            <X size={11} /> Clear all ({activeCount})
          </button>
        )}
        {onToggle !== undefined && (
          <button onClick={onToggle} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            {showFilterBar ? 'Hide Filter Bar' : 'Show Filter Bar'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── PFSmartTableBar ───────────────────────────────────────────────────────────
export function PFSmartTableBar({
  title, count, badges, actions,
}: {
  title: string; count?: number; badges?: ReactNode; actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</span>
        {count !== undefined && <span className="text-sm text-slate-400">({count})</span>}
        {badges && <div className="flex items-center gap-2 flex-wrap">{badges}</div>}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0 ml-3">{actions}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VHFilter — SAP Fiori Value Help infrastructure
//
// Shared by pf-cash-flow, pf-transaction-explorer, and future PF tools.
// ══════════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────────
export type VHOp =
  // text — include
  | 'contains' | 'starts' | 'ends' | 'eq'
  // text — exclude
  | 'ncontains' | 'nstarts' | 'nends' | 'neq'
  // number — include
  | 'num_eq' | 'num_gt' | 'num_gte' | 'num_lt' | 'num_lte' | 'num_between'
  // number — exclude
  | 'num_neq' | 'num_nbetween';

export interface VHCondition { id: string; op: VHOp; val1: string; val2: string; }
export interface VHFilter    { items: string[]; conditions: VHCondition[]; }

export const emptyVHF = (): VHFilter => ({ items: [], conditions: [] });
export const vhfActive = (vhf: VHFilter) => vhf.items.length > 0 || vhf.conditions.length > 0;
export const genId     = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export const VH_EXCLUDE_OPS = new Set<VHOp>(['neq', 'ncontains', 'nstarts', 'nends', 'num_neq', 'num_nbetween']);

// ── Operator metadata ─────────────────────────────────────────────────────────
type OpMeta = { sym: string; label: string };
export const OP_META: Record<VHOp, OpMeta> = {
  contains:     { sym: '∋',   label: 'Contains'            },
  ncontains:    { sym: '⊅',   label: 'Does not contain'    },
  starts:       { sym: '^',   label: 'Starts with'         },
  nstarts:      { sym: '¬^',  label: "Doesn't start with"  },
  ends:         { sym: '$',   label: 'Ends with'           },
  nends:        { sym: '¬$',  label: "Doesn't end with"    },
  eq:           { sym: '=',   label: 'Equal to'            },
  neq:          { sym: '≠',   label: 'Not equal to'        },
  num_eq:       { sym: '=',   label: 'Equal to'            },
  num_neq:      { sym: '≠',   label: 'Not equal to'        },
  num_gt:       { sym: '>',   label: 'Greater than'        },
  num_gte:      { sym: '≥',   label: '≥'                   },
  num_lt:       { sym: '<',   label: 'Less than'           },
  num_lte:      { sym: '≤',   label: '≤'                   },
  num_between:  { sym: '↔',   label: 'Between'             },
  num_nbetween: { sym: '⊄',   label: 'Not between'         },
};

export const TEXT_OPS: VHOp[] = ['contains', 'ncontains', 'starts', 'nstarts', 'ends', 'nends', 'eq', 'neq'];
export const NUM_OPS:  VHOp[] = ['num_eq', 'num_neq', 'num_gt', 'num_gte', 'num_lt', 'num_lte', 'num_between', 'num_nbetween'];

/** Short chip label for a condition, e.g. "∋ salary" or "↔ ₹5,000 – ₹10,000" */
export function condLabel(cond: VHCondition): string {
  const isNum = cond.op.startsWith('num_');
  const fv    = (s: string) => isNum ? fmtINR(parseFloat(s) || 0) : s;
  const sym   = OP_META[cond.op]?.sym ?? cond.op;
  const v2    = cond.val2 ? ` – ${fv(cond.val2)}` : '';
  return `${sym} ${fv(cond.val1)}${v2}`;
}

// ── Logic functions ───────────────────────────────────────────────────────────
export function matchCond(val: string, cond: VHCondition): boolean {
  const v  = val.toLowerCase();
  const c1 = cond.val1.toLowerCase();
  const n  = parseFloat(val);
  const n1 = parseFloat(cond.val1) || 0;
  const n2 = parseFloat(cond.val2) || 0;
  switch (cond.op) {
    case 'contains':     return v.includes(c1);
    case 'ncontains':    return !v.includes(c1);
    case 'starts':       return v.startsWith(c1);
    case 'nstarts':      return !v.startsWith(c1);
    case 'ends':         return v.endsWith(c1);
    case 'nends':        return !v.endsWith(c1);
    case 'eq':           return v === c1;
    case 'neq':          return v !== c1;
    case 'num_eq':       return n === n1;
    case 'num_neq':      return n !== n1;
    case 'num_gt':       return n > n1;
    case 'num_gte':      return n >= n1;
    case 'num_lt':       return n < n1;
    case 'num_lte':      return n <= n1;
    case 'num_between':  return n >= n1 && n <= n2;
    case 'num_nbetween': return n < n1 || n > n2;
    default:             return true;
  }
}

export function applyVHF(vhf: VHFilter, rawVal: string): boolean {
  const inclConds = vhf.conditions.filter(c => !VH_EXCLUDE_OPS.has(c.op));
  const exclConds = vhf.conditions.filter(c =>  VH_EXCLUDE_OPS.has(c.op));
  const hasIncl   = vhf.items.length > 0 || inclConds.length > 0;
  if (hasIncl) {
    const ok = vhf.items.includes(rawVal) || inclConds.some(c => matchCond(rawVal, c));
    if (!ok) return false;
  }
  for (const c of exclConds) {
    if (matchCond(rawVal, c)) return false;
  }
  return true;
}

// ── VHChipStrip ───────────────────────────────────────────────────────────────
// Inline chip strip shown below a text input (e.g. Name field in cash-flow).
export function VHChipStrip({
  vhf, fieldType, onRemoveItem, onRemoveCond,
}: {
  vhf: VHFilter;
  fieldType: 'text' | 'number';
  onRemoveItem: (v: string) => void;
  onRemoveCond: (id: string) => void;
}) {
  if (!vhfActive(vhf)) return null;
  const displayVal = (v: string) => fieldType === 'number' ? fmtINR(parseFloat(v) || 0) : v;
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {vhf.items.map(v => (
        <span key={v} className="flex items-center gap-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60">
          {displayVal(v)}
          <button onClick={() => onRemoveItem(v)} className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100"><X size={9} /></button>
        </span>
      ))}
      {vhf.conditions.map(cond => {
        const isExcl = VH_EXCLUDE_OPS.has(cond.op);
        return (
          <span key={cond.id} className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${isExcl ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-800/60' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200/60 dark:border-green-800/60'}`}>
            {condLabel(cond)}
            <button onClick={() => onRemoveCond(cond.id)} className="ml-0.5"><X size={9} /></button>
          </span>
        );
      })}
    </div>
  );
}

// ── VHFilterField ─────────────────────────────────────────────────────────────
// Chip-picker trigger for enum / category / dynamic column filters.
export function VHFilterField({
  label, vhf, placeholder, displayVal = v => v, onOpen, onRemoveItem, onRemoveCond,
}: {
  label: string;
  vhf: VHFilter;
  placeholder?: string;
  displayVal?: (v: string) => string;
  onOpen: () => void;
  onRemoveItem: (v: string) => void;
  onRemoveCond: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-normal text-slate-700 dark:text-slate-300 truncate" title={label}>
        {label}:
      </label>
      <div
        onClick={onOpen}
        className="flex flex-wrap gap-1 items-center min-h-[34px] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
      >
        {vhf.items.map(v => (
          <span key={v} className="flex items-center gap-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60">
            {displayVal(v)}
            <button onClick={e => { e.stopPropagation(); onRemoveItem(v); }} className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100"><X size={9} /></button>
          </span>
        ))}
        {vhf.conditions.map(cond => {
          const isExcl = VH_EXCLUDE_OPS.has(cond.op);
          return (
            <span key={cond.id} className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${isExcl ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-800/60' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200/60 dark:border-green-800/60'}`}>
              {condLabel(cond)}
              <button onClick={e => { e.stopPropagation(); onRemoveCond(cond.id); }} className="ml-0.5"><X size={9} /></button>
            </span>
          );
        })}
        {!vhfActive(vhf) && <span className="text-slate-400 text-xs">{placeholder ?? 'Any…'}</span>}
        <Copy size={11} className="ml-auto text-slate-400 shrink-0" />
      </div>
    </div>
  );
}

// ── ValueHelpDialog ───────────────────────────────────────────────────────────
// Full-screen SAP Fiori Value Help modal.
// fieldType='enum'   → Tab 1 (checkbox list) only
// fieldType='text'   → Tab 1 + Tab 2 (text condition builder)
// fieldType='number' → Tab 1 + Tab 2 (numeric condition builder)
export function ValueHelpDialog({
  title, values, filter, fieldType, onConfirm, onClose,
}: {
  title: string;
  values: string[];
  filter: VHFilter;
  fieldType: 'text' | 'number' | 'enum';
  onConfirm: (f: VHFilter) => void;
  onClose: () => void;
}) {
  const [draft,    setDraft]    = useState<VHFilter>(() => ({
    items:      [...filter.items],
    conditions: filter.conditions.map(c => ({ ...c })),
  }));
  const [tab,      setTab]      = useState<'select' | 'conds'>('select');
  const [search,   setSearch]   = useState('');
  const [condOp,   setCondOp]   = useState<VHOp>(fieldType === 'number' ? 'num_gt' : 'contains');
  const [condVal1, setCondVal1] = useState('');
  const [condVal2, setCondVal2] = useState('');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const shown       = values.filter(v => v.toLowerCase().includes(search.toLowerCase()));
  const allShown    = shown.length > 0 && shown.every(v => draft.items.includes(v));
  const someShown   = shown.some(v => draft.items.includes(v));
  const totalTokens = draft.items.length + draft.conditions.length;
  const tabOps      = fieldType === 'number' ? NUM_OPS : TEXT_OPS;
  const needsSecond = condOp === 'num_between' || condOp === 'num_nbetween';
  const displayVal  = (v: string) => fieldType === 'number' ? fmtINR(parseFloat(v) || 0) : v;

  const toggleItem = (v: string) =>
    setDraft(prev => ({
      ...prev,
      items: prev.items.includes(v) ? prev.items.filter(x => x !== v) : [...prev.items, v],
    }));

  const toggleAll = () =>
    setDraft(prev => ({
      ...prev,
      items: allShown
        ? prev.items.filter(x => !shown.includes(x))
        : [...new Set([...prev.items, ...shown])],
    }));

  const addCond = () => {
    if (!condVal1.trim()) return;
    setDraft(prev => ({
      ...prev,
      conditions: [...prev.conditions, { id: genId(), op: condOp, val1: condVal1.trim(), val2: condVal2.trim() }],
    }));
    setCondVal1('');
    setCondVal2('');
  };

  const removeCond = (id: string) =>
    setDraft(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) }));
  const removeItem = (v: string) =>
    setDraft(prev => ({ ...prev, items: prev.items.filter(x => x !== v) }));

  const tabBtn = (active: boolean) =>
    `flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
      active ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
    }`;

  const badge = (n: number) => n > 0 ? (
    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full px-1.5 py-0.5 leading-none">
      {n}
    </span>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-[700px] max-w-[95vw] max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl shrink-0">
          <div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Value Help</span>
            <span className="text-sm text-slate-400 dark:text-slate-500"> — {title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1">
            <X size={14} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-4 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <button onClick={() => setTab('select')} className={tabBtn(tab === 'select')}>
            Search and Select {badge(draft.items.length)}
          </button>
          {fieldType !== 'enum' && (
            <button onClick={() => setTab('conds')} className={tabBtn(tab === 'conds')}>
              Define Conditions {badge(draft.conditions.length)}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">

          {/* Tab 1 — Search and Select */}
          {tab === 'select' && (
            <>
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search values…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500"
                />
                <button className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Go
                </button>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                    <tr>
                      <th className="px-4 py-2.5 w-10">
                        <input
                          type="checkbox"
                          checked={allShown}
                          ref={el => { if (el) el.indeterminate = someShown && !allShown; }}
                          onChange={toggleAll}
                          className="rounded cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Value
                        <span className="ml-2 text-[10px] text-slate-400 normal-case font-normal">
                          ({shown.length}{shown.length !== values.length ? ` / ${values.length}` : ''} shown)
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.length === 0 ? (
                      <tr><td colSpan={2} className="px-4 py-10 text-center text-xs text-slate-400">No matching values.</td></tr>
                    ) : shown.map(v => {
                      const isChecked = draft.items.includes(v);
                      return (
                        <tr
                          key={v}
                          onClick={() => toggleItem(v)}
                          className={`border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 cursor-pointer transition-colors ${isChecked ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                        >
                          <td className="px-4 py-2.5">
                            <input type="checkbox" checked={isChecked} onChange={() => toggleItem(v)} onClick={e => e.stopPropagation()} className="rounded cursor-pointer" />
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{displayVal(v)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tab 2 — Define Conditions */}
          {tab === 'conds' && (
            <div className="flex flex-col min-h-0 flex-1">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 items-center shrink-0 flex-wrap">
                <select
                  value={condOp}
                  onChange={e => setCondOp(e.target.value as VHOp)}
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none h-8"
                >
                  {tabOps.map(op => (
                    <option key={op} value={op}>{OP_META[op].label}</option>
                  ))}
                </select>
                <input
                  autoFocus
                  type={fieldType === 'number' ? 'number' : 'text'}
                  placeholder="Value…"
                  value={condVal1}
                  onChange={e => setCondVal1(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCond(); }}
                  className="flex-1 min-w-[100px] text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 h-8"
                />
                {needsSecond && (
                  <>
                    <span className="text-slate-400 text-xs shrink-0">–</span>
                    <input
                      type={fieldType === 'number' ? 'number' : 'text'}
                      placeholder="To…"
                      value={condVal2}
                      onChange={e => setCondVal2(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCond(); }}
                      className="flex-1 min-w-[80px] text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 h-8"
                    />
                  </>
                )}
                <button
                  onClick={addCond}
                  disabled={!condVal1.trim()}
                  className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap h-8 flex items-center gap-1 shrink-0"
                >
                  + Add
                </button>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 px-4 py-3">
                {draft.conditions.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">No conditions defined yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Use the form above to add include or exclude conditions.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {draft.conditions.map(cond => {
                      const isExcl = VH_EXCLUDE_OPS.has(cond.op);
                      return (
                        <div key={cond.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${isExcl ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/50' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/50'}`}>
                          <span className="font-mono font-bold text-base w-6 text-center shrink-0">{OP_META[cond.op].sym}</span>
                          <span className="text-[10px] uppercase tracking-wide font-semibold opacity-60 shrink-0 hidden sm:block">{OP_META[cond.op].label}</span>
                          <span className="flex-1 font-semibold truncate">{condLabel(cond)}</span>
                          <button onClick={() => removeCond(cond.id)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0 p-0.5">
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Token Bar */}
        {totalTokens > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-3 bg-slate-50/60 dark:bg-slate-800/30 shrink-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Selected Items and Conditions ({totalTokens})
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {draft.items.map(v => (
                <span key={v} className="flex items-center gap-1 text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {displayVal(v)}
                  <button onClick={() => removeItem(v)} className="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"><X size={10} /></button>
                </span>
              ))}
              {draft.conditions.map(cond => {
                const isExcl = VH_EXCLUDE_OPS.has(cond.op);
                return (
                  <span key={cond.id} className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isExcl ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'}`}>
                    {condLabel(cond)}
                    <button onClick={() => removeCond(cond.id)} className={`ml-0.5 ${isExcl ? 'hover:text-red-900' : 'hover:text-green-900'}`}><X size={10} /></button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl shrink-0">
          <button onClick={onClose} className="text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(draft); onClose(); }} className="text-xs font-semibold bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AdaptFiltersDialog ────────────────────────────────────────────────────────
// Lets users show/hide filter fields from the filter bar.
// `hidden` is a Set of field keys currently hidden; dialog edits a draft copy.
export function AdaptFiltersDialog({
  fields,
  hidden,
  onConfirm,
  onClose,
}: {
  fields: { key: string; label: string; group?: string }[];
  hidden: Set<string>;
  onConfirm: (hidden: Set<string>) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Set<string>>(() => new Set(hidden));

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const groups = [...new Set(fields.map(f => f.group ?? 'Filters'))];

  const toggle = (key: string) =>
    setDraft(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const showAll = () => setDraft(new Set());
  const hideAll = () => setDraft(new Set(fields.map(f => f.key)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-[460px] max-w-[95vw] max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl shrink-0">
          <div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Adapt Filters</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">Choose which fields appear in the filter bar</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Show All / Hide All row */}
        <div className="flex items-center justify-end gap-4 px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button onClick={showAll} className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">Show All</button>
          <button onClick={hideAll} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline">Hide All</button>
        </div>

        {/* Field list */}
        <div className="overflow-y-auto flex-1 min-h-0 px-4 py-3 space-y-5">
          {groups.map(group => {
            const groupFields = fields.filter(f => (f.group ?? 'Filters') === group);
            return (
              <div key={group}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-1">{group}</div>
                <div className="space-y-0.5">
                  {groupFields.map(f => {
                    const isVisible = !draft.has(f.key);
                    return (
                      <div
                        key={f.key}
                        onClick={() => toggle(f.key)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${!isVisible ? 'opacity-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggle(f.key)}
                          onClick={e => e.stopPropagation()}
                          className="rounded cursor-pointer"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{f.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl shrink-0">
          <button onClick={onClose} className="text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(draft); onClose(); }} className="text-xs font-semibold bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
