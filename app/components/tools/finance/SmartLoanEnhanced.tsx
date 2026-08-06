"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Search, X, ChevronRight, BarChart3, Sparkles,
  AlertCircle, ArrowLeft, TrendingDown, Download,
  Pencil, Check, Tag, Merge, Unlink, ChevronDown, Trash2, RotateCcw,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';
import {
  getPFTransactions, DEBT_CATEGORIES,
  type PFTransaction,
} from '../personal-finance/finance-store';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface LoanGroup {
  key: string;
  transactions: PFTransaction[];
  total: number;
  count: number;
  uniqueMonths: number;
  avgPerMonth: number;
  dateRange: { from: string; to: string };
  // User-override fields (populated by processedGroups)
  displayName?:  string;
  loanType?:     string;
  absorbedKeys?: string[];
}

interface EMIRow {
  month: number;
  principal: number;
  interest: number;
  balance: number;
  cumInterest: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers (outside component — no re-creation on render)
// ─────────────────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const LOAN_TYPES = [
  'Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan',
  'Credit Card EMI', 'Business Loan', 'Gold Loan', 'Two-Wheeler Loan', 'Other',
] as const;

const LOAN_TYPE_COLORS: Record<string, string> = {
  'Home Loan':        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
  'Car Loan':         'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700',
  'Personal Loan':    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  'Education Loan':   'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  'Credit Card EMI':  'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700',
  'Business Loan':    'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700',
  'Gold Loan':        'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
  'Two-Wheeler Loan': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700',
  'Other':            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

function groupLoanTxns(
  txns: PFTransaction[],
  by: 'lender' | 'month' | 'category',
): LoanGroup[] {
  const map: Record<string, PFTransaction[]> = {};
  txns.forEach(t => {
    const key =
      by === 'lender'   ? t.description.split(/\s+/).slice(0, 4).join(' ').slice(0, 38)
      : by === 'month'  ? (t.date?.substring(0, 7) ?? 'Unknown')
      :                   (t.category ?? 'Unknown');
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return Object.entries(map)
    .map(([key, rows]) => {
      const total  = rows.reduce((s, t) => s + t.amount, 0);
      const months = new Set(rows.map(t => t.date?.substring(0, 7)).filter(Boolean));
      const dates  = rows.map(t => t.date).filter(Boolean).sort() as string[];
      return {
        key,
        transactions: [...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
        total:        Math.round(total),
        count:        rows.length,
        uniqueMonths: months.size,
        avgPerMonth:  months.size > 0 ? Math.round(total / months.size) : Math.round(total),
        dateRange: {
          from: dates[0]?.substring(0, 7)                     ?? '—',
          to:   dates[dates.length - 1]?.substring(0, 7)      ?? '—',
        },
      };
    })
    .sort((a, b) => b.total - a.total);
}

function calcEMI(p: number, r: number, n: number): number {
  if (p <= 0 || n <= 0 || r < 0) return 0;
  if (r === 0) return Math.round(p / (n * 12));
  const mr = r / 12 / 100;
  const mo = n * 12;
  const d  = Math.pow(1 + mr, mo) - 1;
  if (d === 0 || !isFinite(d)) return 0;
  const v = (p * mr * Math.pow(1 + mr, mo)) / d;
  return isFinite(v) ? Math.round(v) : 0;
}

function calcPrincipal(emi: number, r: number, n: number): number {
  if (emi <= 0 || n <= 0) return 0;
  if (r === 0) return emi * n * 12;
  const mr = r / 12 / 100;
  const mo = n * 12;
  const v  = emi * (Math.pow(1 + mr, mo) - 1) / (mr * Math.pow(1 + mr, mo));
  return isFinite(v) ? Math.round(v) : 0;
}

function buildBreakdown(p: number, r: number, n: number): EMIRow[] {
  const emi = calcEMI(p, r, n);
  if (emi === 0 || p <= 0) return [];
  const mr = r / 12 / 100;
  let bal = p, cumInt = 0;
  const rows: EMIRow[] = [];
  for (let m = 1; m <= n * 12; m++) {
    const interest = bal * mr;
    const prinPaid = Math.min(emi - interest, bal);
    cumInt += interest;
    bal = Math.max(0, bal - prinPaid);
    rows.push({ month: m, principal: Math.round(prinPaid), interest: Math.round(interest), balance: Math.round(bal), cumInterest: Math.round(cumInt) });
    if (bal <= 0) break;
  }
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Style constants
// ─────────────────────────────────────────────────────────────────────────────
const labelCls =
  'text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls =
  'text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 ' +
  'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none ' +
  'focus:border-rose-400 transition-colors w-full';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const SmartLoanEnhanced = () => {
  const [mounted,     setMounted]     = useState(false);
  const [loanTxns,    setLoanTxns]    = useState<PFTransaction[]>([]);

  // List view
  const [groupBy,     setGroupBy]     = useState<'lender' | 'month' | 'category'>('lender');
  const [sortBy,      setSortBy]      = useState<'total' | 'count' | 'avg'>('total');
  const [search,      setSearch]      = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // User controls: rename, type mapping, merge
  const [overrides,    setOverrides]    = useState<Record<string, { displayName?: string; loanType?: string }>>({});
  const [mergeMap,     setMergeMap]     = useState<Record<string, string[]>>({}); // primaryKey → absorbedKeys[]
  const [checkedKeys,  setCheckedKeys]  = useState<Set<string>>(new Set());
  const [editingKey,     setEditingKey]     = useState<string | null>(null);
  const [editingName,    setEditingName]    = useState('');
  const [categoryKey,    setCategoryKey]    = useState<string | null>(null); // which row's type-dropdown is open
  const [hiddenKeys,     setHiddenKeys]     = useState<Set<string>>(new Set());
  const [toolbarTagOpen, setToolbarTagOpen] = useState(false);

  // Analytics view
  const [view,          setView]          = useState<'list' | 'analytics'>('list');
  const [selectedGroup, setSelectedGroup] = useState<LoanGroup | null>(null);
  const [projEMI,       setProjEMI]       = useState(0);
  const [projRate,      setProjRate]      = useState(0);
  const [projTenure,    setProjTenure]    = useState(0);
  const [showFullAmort, setShowFullAmort] = useState(false);

  // ── Load from PF store ──────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const load = () => {
      const txns = getPFTransactions().filter(
        t => DEBT_CATEGORIES.some(cat => t.category === cat) && t.type === 'debit',
      );
      setLoanTxns(txns);
    };
    load();
    window.addEventListener('pf-store-updated', load);
    return () => window.removeEventListener('pf-store-updated', load);
  }, []);

  // ── List view computed values ───────────────────────────────────────────────
  const groups = useMemo(() => groupLoanTxns(loanTxns, groupBy), [loanTxns, groupBy]);

  const filteredGroups = useMemo(() => {
    let g = groups;
    if (search.trim()) {
      const q = search.toLowerCase();
      g = g.filter(gr => {
        const displayName = overrides[gr.key]?.displayName ?? gr.key;
        const loanType    = overrides[gr.key]?.loanType    ?? '';
        return displayName.toLowerCase().includes(q) || loanType.toLowerCase().includes(q);
      });
    }
    if (sortBy === 'count') return [...g].sort((a, b) => b.count - a.count);
    if (sortBy === 'avg')   return [...g].sort((a, b) => b.avgPerMonth - a.avgPerMonth);
    return g; // 'total' — already sorted by groupLoanTxns
  }, [groups, search, sortBy, overrides]);

  const totals = useMemo(() => {
    const total   = loanTxns.reduce((s, t) => s + t.amount, 0);
    const months  = new Set(loanTxns.map(t => t.date?.substring(0, 7)).filter(Boolean));
    const lenders = new Set(loanTxns.map(t => t.description.split(/\s+/).slice(0, 3).join(' ')));
    return { total, count: loanTxns.length, months: months.size, lenders: lenders.size };
  }, [loanTxns]);

  const avgPerMonth = totals.months > 0 ? Math.round(totals.total / totals.months) : 0;

  const allDates = useMemo(() => {
    const d = loanTxns.map(t => t.date).filter(Boolean).sort() as string[];
    return { from: d[0]?.substring(0, 7) ?? '', to: d[d.length - 1]?.substring(0, 7) ?? '' };
  }, [loanTxns]);

  // ── processedGroups: apply merges + overrides on top of filteredGroups ───────
  const processedGroups = useMemo(() => {
    // Build set of absorbed keys so we can hide them
    const absorbed = new Set<string>();
    Object.values(mergeMap).forEach(keys => keys.forEach(k => absorbed.add(k)));

    return filteredGroups
      .filter(g => !absorbed.has(g.key) && !hiddenKeys.has(g.key))
      .map(g => {
        const absorbedKeys = mergeMap[g.key] ?? [];
        // Pull transactions from absorbed groups (use raw groups not filtered, so merged txns survive search)
        const absorbedTxns = absorbedKeys.flatMap(k => groups.find(gr => gr.key === k)?.transactions ?? []);
        const allTxns = [...g.transactions, ...absorbedTxns]
          .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

        const total  = allTxns.reduce((s, t) => s + t.amount, 0);
        const months = new Set(allTxns.map(t => t.date?.substring(0, 7)).filter(Boolean));
        const dates  = allTxns.map(t => t.date).filter(Boolean).sort() as string[];

        return {
          ...g,
          transactions: allTxns,
          total:        Math.round(total),
          count:        allTxns.length,
          uniqueMonths: months.size,
          avgPerMonth:  months.size > 0 ? Math.round(total / months.size) : Math.round(total),
          dateRange: {
            from: dates[0]?.substring(0, 7)                  ?? '—',
            to:   dates[dates.length - 1]?.substring(0, 7)   ?? '—',
          },
          displayName:   overrides[g.key]?.displayName ?? g.key,
          loanType:      overrides[g.key]?.loanType    ?? '',
          absorbedKeys,
        };
      });
  }, [filteredGroups, groups, mergeMap, overrides]);

  // ── User control handlers ───────────────────────────────────────────────────
  const commitRename = (key: string) => {
    const trimmed = editingName.trim();
    if (trimmed && trimmed !== key) {
      setOverrides(prev => ({ ...prev, [key]: { ...prev[key], displayName: trimmed } }));
    }
    setEditingKey(null);
  };

  const applyLoanType = (key: string, type: string) => {
    setOverrides(prev => ({ ...prev, [key]: { ...prev[key], loanType: type } }));
    setCategoryKey(null);
  };

  const toggleCheck = (key: string) => {
    setCheckedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const mergeSelected = () => {
    if (checkedKeys.size < 2) return;
    const [primary, ...rest] = Array.from(checkedKeys);
    setMergeMap(prev => ({
      ...prev,
      [primary]: [...(prev[primary] ?? []), ...rest.filter(k => k !== primary)],
    }));
    setCheckedKeys(new Set());
  };

  const unmergeGroup = (key: string) => {
    setMergeMap(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetGroup = (key: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    unmergeGroup(key);
  };

  // ── Derived: toolbar button active states ────────────────────────────────────
  const canUnmerge = Array.from(checkedKeys).some(
    k => (processedGroups.find(g => g.key === k)?.absorbedKeys?.length ?? 0) > 0,
  );
  const canReset = Array.from(checkedKeys).some(
    k => !!(overrides[k]?.displayName || overrides[k]?.loanType),
  );

  // ── Toolbar bulk action handlers ─────────────────────────────────────────────
  const handleToolbarRename = () => {
    if (checkedKeys.size !== 1) return;
    const [k] = Array.from(checkedKeys);
    const group = processedGroups.find(g => g.key === k);
    if (group) { setEditingKey(k); setEditingName(group.displayName ?? k); }
  };

  const handleToolbarAnalytics = () => {
    if (checkedKeys.size !== 1) return;
    const [k] = Array.from(checkedKeys);
    const group = processedGroups.find(g => g.key === k);
    if (group) openAnalytics(group);
  };

  const applyLoanTypeToSelected = (type: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      checkedKeys.forEach(k => { next[k] = { ...next[k], loanType: type }; });
      return next;
    });
    setToolbarTagOpen(false);
  };

  const unmergeSelected = () => {
    setMergeMap(prev => {
      const next = { ...prev };
      checkedKeys.forEach(k => { delete next[k]; });
      return next;
    });
  };

  const resetSelected = () => {
    setOverrides(prev => {
      const next = { ...prev };
      checkedKeys.forEach(k => { delete next[k]; });
      return next;
    });
    setMergeMap(prev => {
      const next = { ...prev };
      checkedKeys.forEach(k => { delete next[k]; });
      return next;
    });
  };

  const deleteSelected = () => {
    setHiddenKeys(prev => {
      const next = new Set(prev);
      checkedKeys.forEach(k => next.add(k));
      return next;
    });
    setCheckedKeys(new Set());
  };

  const exportList = () => {
    const rows = [['Name', 'Type', 'Total Paid', 'Payments', 'Months', 'Avg/Month', 'From', 'To']];
    processedGroups.forEach(g => rows.push([
      g.displayName ?? g.key, g.loanType || '—',
      String(g.total), String(g.count), String(g.uniqueMonths),
      String(g.avgPerMonth), g.dateRange.from, g.dateRange.to,
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'loans.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Analytics navigation ────────────────────────────────────────────────────
  const openAnalytics = (group: LoanGroup) => {
    setSelectedGroup(group);
    setProjEMI(group.avgPerMonth);
    setProjRate(0);
    setProjTenure(0);
    setShowFullAmort(false);
    setView('analytics');
  };

  // ── Projection computations ─────────────────────────────────────────────────
  const projPrincipal = useMemo(() => calcPrincipal(projEMI, projRate, projTenure), [projEMI, projRate, projTenure]);
  const projCalcEMI   = useMemo(() => calcEMI(projPrincipal, projRate, projTenure), [projPrincipal, projRate, projTenure]);
  const breakdown     = useMemo(() => buildBreakdown(projPrincipal, projRate, projTenure), [projPrincipal, projRate, projTenure]);
  const totalInterest = breakdown.length > 0 ? breakdown[breakdown.length - 1].cumInterest : 0;
  const totalPayable  = projPrincipal + totalInterest;

  const yearlyData = useMemo(() => {
    if (!projPrincipal || !projTenure) return [];
    const data = [{ year: 'Yr 0', Principal: 0, Interest: 0, Balance: projPrincipal }];
    for (let y = 1; y <= projTenure; y++) {
      const pt = breakdown[y * 12 - 1] ?? breakdown[breakdown.length - 1];
      if (pt) data.push({ year: `Yr ${y}`, Principal: projPrincipal - pt.balance, Interest: pt.cumInterest, Balance: pt.balance });
    }
    return data;
  }, [breakdown, projTenure, projPrincipal]);

  const isProjectionReady = projPrincipal > 0 && projRate > 0 && projTenure > 0;

  // ── CSV export ──────────────────────────────────────────────────────────────
  const exportAmort = () => {
    const rows = [
      ['Month', 'Principal', 'Interest', 'Balance', 'Cum. Interest'],
      ...breakdown.map(r => [r.month, r.principal, r.interest, r.balance, r.cumInterest].map(String)),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'amortization.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (!mounted) return null;

  // ══════════════════════════════════════════════════════════════════════════════
  // EMPTY STATE — no loan data uploaded yet
  // ══════════════════════════════════════════════════════════════════════════════
  if (loanTxns.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-5">
            <CreditCard size={36} className="text-rose-300" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">
            No Loan / EMI Data Yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
            We couldn&apos;t find any loan or EMI transactions. Upload your bank statements and
            we&apos;ll automatically detect all your EMI payments.
          </p>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left space-y-4 mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How to get started</p>
            {[
              { n: '1', title: 'Go to Personal Finance',     sub: 'Click "Personal Finance" in the left sidebar' },
              { n: '2', title: 'Upload your bank statements', sub: 'PDF or CSV — any major Indian bank is supported' },
              { n: '3', title: 'Auto-detection runs',         sub: 'EMI & loan payments are tagged automatically' },
              { n: '4', title: 'Come back here',              sub: 'Your full EMI history and projection analytics will appear' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.n}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Transactions categorised as &ldquo;Loan / EMI&rdquo; are detected automatically.
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ANALYTICS VIEW — full projection for a selected group
  // ══════════════════════════════════════════════════════════════════════════════
  if (view === 'analytics' && selectedGroup) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

        {/* ── Top bar ── */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center gap-4 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition-colors flex-shrink-0">
            <ArrowLeft size={13} /> Back to Loans
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                {selectedGroup.displayName ?? selectedGroup.key}
              </p>
              {selectedGroup.loanType && (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${LOAN_TYPE_COLORS[selectedGroup.loanType] ?? LOAN_TYPE_COLORS['Other']}`}>
                  {selectedGroup.loanType}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {selectedGroup.displayName && selectedGroup.displayName !== selectedGroup.key && (
                <span className="mr-2 italic">orig: {selectedGroup.key}</span>
              )}
              {selectedGroup.count} payment{selectedGroup.count !== 1 ? 's' : ''}
              {' · '}{selectedGroup.uniqueMonths} month{selectedGroup.uniqueMonths !== 1 ? 's' : ''} of data
              {selectedGroup.dateRange.from !== '—' && ` · ${selectedGroup.dateRange.from} → ${selectedGroup.dateRange.to}`}
              {selectedGroup.absorbedKeys && selectedGroup.absorbedKeys.length > 0 && (
                <span className="ml-2 text-blue-400">(+{selectedGroup.absorbedKeys.length} merged)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full">
              {fmtINR(selectedGroup.total)} total paid
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold rounded-full">
              {fmtINR(selectedGroup.avgPerMonth)}/mo avg
            </span>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── Loan details config ── */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
            <div className="flex items-start gap-2 mb-4">
              <Sparkles size={13} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Loan Details — enter interest rate &amp; tenure to calculate your projection
                </p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                  Monthly EMI is pre-filled from your detected average. Adjust any field and the estimated principal updates live.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Monthly EMI (₹)</label>
                <input
                  type="number" value={projEMI || ''} min={1} placeholder="from your data"
                  onChange={e => setProjEMI(Number(e.target.value))}
                  className={inputCls} />
                <span className="text-[9px] text-amber-600 dark:text-amber-500">
                  detected avg: {fmtINR(selectedGroup.avgPerMonth)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Interest Rate %</label>
                <input
                  type="number" value={projRate || ''} min={0} max={30} step={0.1} placeholder="e.g. 8.5"
                  onChange={e => setProjRate(Number(e.target.value))}
                  className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Tenure (years)</label>
                <input
                  type="number" value={projTenure || ''} min={1} max={50} placeholder="e.g. 20"
                  onChange={e => setProjTenure(Number(e.target.value))}
                  className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Est. Principal</label>
                <p className={`text-xl font-black py-0.5 ${projPrincipal > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                  {projPrincipal > 0 ? formatCurrency(projPrincipal) : '—'}
                </p>
                {projCalcEMI > 0 && (
                  <span className="text-[9px] text-slate-400">EMI check: {fmtINR(projCalcEMI)}/mo</span>
                )}
              </div>
            </div>

            {selectedGroup.uniqueMonths < 3 && (
              <p className="mt-3 text-[10px] text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                <AlertCircle size={11} />
                Only {selectedGroup.uniqueMonths} month{selectedGroup.uniqueMonths !== 1 ? 's' : ''} of data —
                the EMI average may not fully represent your actual EMI.
              </p>
            )}
          </div>

          {/* ── Waiting prompt ── */}
          {!isProjectionReady && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <TrendingDown size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                Enter interest rate and tenure above
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                The full projection — monthly EMI, total interest, balance chart, and amortization schedule — will appear here.
              </p>
            </div>
          )}

          {/* ── Full projection ── */}
          {isProjectionReady && (
            <>
              {/* KPI summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Monthly EMI',    value: fmtINR(projCalcEMI),                               cls: 'bg-rose-500 text-white' },
                  { label: 'Est. Principal', value: formatCurrency(projPrincipal),                     cls: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white' },
                  { label: 'Total Interest', value: formatCurrency(totalInterest),                     cls: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white' },
                  { label: 'Total Payable',  value: formatCurrency(totalPayable),                      cls: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white' },
                  { label: 'Interest Share', value: `${totalPayable > 0 ? ((totalInterest / totalPayable) * 100).toFixed(1) : 0}%`, cls: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white' },
                ].map(k => (
                  <div key={k.label} className={`rounded-xl px-4 py-3 ${k.cls}`}>
                    <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">{k.label}</p>
                    <p className="text-lg font-black mt-0.5">{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Loan Balance Over Time</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={yearlyData}>
                        <defs>
                          <linearGradient id="loanBalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 11 }} />
                        <Area type="monotone" dataKey="Balance" stroke="#f43f5e" fill="url(#loanBalGrad)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Principal vs Interest (Yearly)</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 11 }} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Principal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Interest"  fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Amortization schedule */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Amortization Schedule — {breakdown.length} months total
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFullAmort(v => !v)}
                      className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      {showFullAmort ? 'Show first 12' : `Show all ${breakdown.length}`}
                    </button>
                    <button onClick={exportAmort}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                      <Download size={10} /> CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                      <tr>
                        {['Month', 'Principal', 'Interest', 'Balance', 'Cum. Interest'].map(h => (
                          <th key={h} className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(showFullAmort ? breakdown : breakdown.slice(0, 12)).map(r => (
                        <tr key={r.month} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-4 text-slate-400 font-mono">{r.month}</td>
                          <td className="py-2 px-4 text-blue-600 dark:text-blue-400 font-semibold font-mono">{formatCurrency(r.principal)}</td>
                          <td className="py-2 px-4 text-rose-500 dark:text-rose-400 font-semibold font-mono">{formatCurrency(r.interest)}</td>
                          <td className="py-2 px-4 text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(r.balance)}</td>
                          <td className="py-2 px-4 text-slate-400 font-mono">{formatCurrency(r.cumInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actual payment history */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Actual EMI Payments from Statements — {selectedGroup.count} transactions
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                      <tr>
                        {['Date', 'Description', 'Amount'].map(h => (
                          <th key={h} className="text-left py-2 px-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.transactions.map((t, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-4 text-slate-400 font-mono whitespace-nowrap">{t.date}</td>
                          <td className="py-2 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">{t.description}</td>
                          <td className="py-2 px-4 text-rose-600 dark:text-rose-400 font-bold font-mono whitespace-nowrap">{fmtINR(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // LIST VIEW — grouped table of all detected EMI / loan payments
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

      {/* ── Header bar ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0 space-y-3">

        {/* Title + KPI summary chips */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <CreditCard size={16} className="text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Loan &amp; EMI Tracker</p>
              {allDates.from && (
                <p className="text-[10px] text-slate-400 mt-0.5">{allDates.from} → {allDates.to}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full">
              {fmtINR(totals.total)} total paid
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">
              {totals.count} transactions
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">
              {fmtINR(avgPerMonth)}/mo avg
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">
              {totals.lenders} lender{totals.lenders !== 1 ? 's' : ''}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">
              {totals.months} months of data
            </span>
          </div>
        </div>

        {/* ── Row 1: Filter / Group / Sort ── */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-7 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-slate-400 transition-colors w-36" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X size={11} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          {/* Group by */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Group</span>
            {(['lender', 'month', 'category'] as const).map(g => (
              <button key={g} onClick={() => { setGroupBy(g); setExpandedKey(null); }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                  groupBy === g
                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {g}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          {/* Sort by */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Sort</span>
            {([
              { key: 'total', label: 'Amount' },
              { key: 'count', label: 'Count' },
              { key: 'avg',   label: 'Avg/mo' },
            ] as const).map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  sortBy === s.key
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Row 2: Action bar (SAP table toolbar style) ── */}
        <div className="flex items-center gap-1.5 flex-wrap border-t border-slate-100 dark:border-slate-800 pt-2 -mx-6 px-6">
          {/* Left: groups count + hidden restore */}
          <span className="text-[10px] text-slate-400 mr-1">
            {processedGroups.length} group{processedGroups.length !== 1 ? 's' : ''}
            {hiddenKeys.size > 0 && (
              <button onClick={() => setHiddenKeys(new Set())} className="ml-1.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 underline">
                +{hiddenKeys.size} hidden
              </button>
            )}
          </span>

          <div className="flex-1" />

          {/* Contextual actions — only when something is selected */}
          {checkedKeys.size > 0 && (
            <>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-2 py-1 rounded-lg">
                {checkedKeys.size} selected
              </span>

              {/* Rename — exactly 1 */}
              {checkedKeys.size === 1 && (
                <button
                  onClick={handleToolbarRename}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7">
                  <Pencil size={11} /> Rename
                </button>
              )}

              {/* Type — 1+ selected */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setToolbarTagOpen(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7">
                  <Tag size={11} /> Type <ChevronDown size={9} />
                </button>
                {toolbarTagOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[170px]">
                    {LOAN_TYPES.map(t => (
                      <button key={t} onClick={() => applyLoanTypeToSelected(t)}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analytics — exactly 1 */}
              {checkedKeys.size === 1 && (
                <button
                  onClick={handleToolbarAnalytics}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7">
                  <BarChart3 size={11} /> Analytics
                </button>
              )}

              {/* Merge — 2+ */}
              {checkedKeys.size >= 2 && (
                <button
                  onClick={mergeSelected}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7">
                  <Merge size={11} /> Merge
                </button>
              )}

              {/* Unmerge — when applicable */}
              {canUnmerge && (
                <button
                  onClick={unmergeSelected}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7">
                  <Unlink size={11} /> Unmerge
                </button>
              )}

              {/* Reset — when applicable */}
              {canReset && (
                <button
                  onClick={resetSelected}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7">
                  <RotateCcw size={11} /> Reset
                </button>
              )}

              {/* Clear selection */}
              <button
                onClick={() => setCheckedKeys(new Set())}
                title="Clear selection"
                className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                <X size={13} />
              </button>

              <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
            </>
          )}

          {/* Delete — always visible, danger style */}
          <button
            disabled={checkedKeys.size === 0}
            onClick={deleteSelected}
            title="Hide selected from view"
            className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Trash2 size={11} /> Delete
          </button>

          {/* Export — always active */}
          <button
            onClick={exportList}
            title="Export as CSV"
            className="flex items-center gap-1.5 text-xs font-semibold border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto p-6" onClick={() => { setCategoryKey(null); setToolbarTagOpen(false); }}>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
              <tr>
                <th className="py-3 pl-4 pr-2 w-8">
                  <button
                    onClick={() => {
                      if (checkedKeys.size === processedGroups.length && processedGroups.length > 0) {
                        setCheckedKeys(new Set());
                      } else {
                        setCheckedKeys(new Set(processedGroups.map(g => g.key)));
                      }
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checkedKeys.size === processedGroups.length && processedGroups.length > 0
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-400 dark:border-slate-500 hover:border-blue-500'
                    }`}>
                    {checkedKeys.size === processedGroups.length && processedGroups.length > 0 && (
                      <Check size={10} strokeWidth={3} />
                    )}
                  </button>
                </th>
                {[
                  groupBy === 'lender' ? 'Lender / Payee' : groupBy === 'month' ? 'Month' : 'Category',
                  'Type', 'Total Paid', 'Payments', 'Months', 'Avg / Month',
                ].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedGroups.map(group => {
                const isExpanded  = expandedKey === group.key;
                const isChecked   = checkedKeys.has(group.key);
                const isEditing   = editingKey  === group.key;
                const isCatOpen   = categoryKey === group.key;
                const typeCls     = group.loanType ? (LOAN_TYPE_COLORS[group.loanType] ?? LOAN_TYPE_COLORS['Other']) : '';
                const isMerged    = group.absorbedKeys.length > 0;

                return (
                  <React.Fragment key={group.key}>
                    {/* ── Group row ── */}
                    <tr
                      className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${
                        isChecked ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}>

                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleCheck(group.key)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-400 dark:border-slate-500 hover:border-blue-500'
                          }`}>
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </button>
                      </td>

                      {/* Name — click chevron/name to expand; click pencil to rename */}
                      <td className="py-3 px-3 cursor-pointer" onClick={() => setExpandedKey(isExpanded ? null : group.key)}>
                        <div className="flex items-center gap-1.5">
                          <ChevronRight
                            size={12}
                            className={`text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter')  { e.preventDefault(); commitRename(group.key); }
                                  if (e.key === 'Escape') { e.preventDefault(); setEditingKey(null); }
                                }}
                                onBlur={() => commitRename(group.key)}
                                onClick={e => e.stopPropagation()}
                                className="text-xs font-semibold border-b-2 border-blue-400 bg-transparent outline-none text-slate-700 dark:text-slate-200 w-full max-w-[180px]"
                              />
                            ) : (
                              <p className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                                {group.displayName}
                                {group.displayName !== group.key && (
                                  <span className="ml-1 text-[9px] text-slate-400 font-normal">({group.key})</span>
                                )}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {group.dateRange.from !== '—' && (
                                <span className="text-[10px] text-slate-400">{group.dateRange.from} → {group.dateRange.to}</span>
                              )}
                              {isMerged && (
                                <span className="text-[9px] font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full">
                                  +{group.absorbedKeys.length} merged
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Rename pencil */}
                          {!isEditing && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setEditingKey(group.key);
                                setEditingName(group.displayName);
                              }}
                              title="Rename"
                              className="opacity-0 group-hover:opacity-100 hover:!opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all flex-shrink-0">
                              <Pencil size={11} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Type / category badge */}
                      <td className="py-3 px-3 relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setCategoryKey(isCatOpen ? null : group.key)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold transition-colors whitespace-nowrap ${
                            group.loanType
                              ? typeCls
                              : 'border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-400 hover:text-slate-500'
                          }`}>
                          <Tag size={9} />
                          {group.loanType || 'Tag type'}
                          <ChevronDown size={9} className="opacity-60" />
                        </button>
                        {/* Dropdown */}
                        {isCatOpen && (
                          <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[170px]">
                            {LOAN_TYPES.map(t => (
                              <button key={t}
                                onClick={() => applyLoanType(group.key, t)}
                                className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                  group.loanType === t ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                {t}
                              </button>
                            ))}
                            {group.loanType && (
                              <button
                                onClick={() => applyLoanType(group.key, '')}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-semibold border-t border-slate-100 dark:border-slate-800 mt-1 transition-colors">
                                Remove tag
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stats */}
                      <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400 font-mono whitespace-nowrap cursor-pointer" onClick={() => setExpandedKey(isExpanded ? null : group.key)}>
                        {fmtINR(group.total)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 cursor-pointer" onClick={() => setExpandedKey(isExpanded ? null : group.key)}>
                        {group.count}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 cursor-pointer" onClick={() => setExpandedKey(isExpanded ? null : group.key)}>
                        {group.uniqueMonths}mo
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap cursor-pointer" onClick={() => setExpandedKey(isExpanded ? null : group.key)}>
                        {fmtINR(group.avgPerMonth)}
                      </td>

                    </tr>

                    {/* ── Expanded: individual transactions ── */}
                    {isExpanded && group.transactions.map((t, i) => (
                      <tr key={`${group.key}-txn-${i}`} className="bg-slate-50/70 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/60">
                        <td />
                        <td className="py-2 pl-4 pr-3 text-slate-400 font-mono whitespace-nowrap">
                          {t.date}
                        </td>
                        <td colSpan={4} className="py-2 px-3 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {t.description}
                        </td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400 font-bold font-mono whitespace-nowrap">
                          {fmtINR(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {processedGroups.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-slate-400">
                    No results match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
