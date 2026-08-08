'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileDown, Plus, Pencil, Check, X, Merge, BarChart3, Table,
  ChevronDown, BookOpen, TrendingDown, ShoppingBag, Calendar,
  CreditCard, PieChart as PieChartIcon, AlertTriangle, ArrowRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFButton, PFBadge, PFFilterBarHeader, PFSmartTableBar } from './PfUi';
import { useToast } from '@/app/components/ui/ToastSystem';
import { downloadFile } from '@/app/lib/utils/tool-helpers';
import {
  getAccounts, getStatements, getPFTransactions, filterByPeriod, getAllCategories,
  addUserCategory, bulkApplyCategoryOverride,
  getAvailableMonths, getPeriodRange,
  getStatementCoverageRange, getLastUpdatedTimestamp,
  getLabels, loadPFStore,
  type PFAccount, type PFStatement, type PFTransaction, type PFLabel,
  fmtINR, fmtPct,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDE
// ═══════════════════════════════════════════════════════════════════════════════

const GUIDE_KEY = 'pf-expenditure-guide-seen';

const GUIDE_CARDS = [
  {
    icon: PieChartIcon,
    color: 'blue' as const,
    title: 'Category breakdown',
    desc: 'The donut chart shows exactly where your money goes — each slice is a spending category. Bigger slice = bigger share of your wallet.',
  },
  {
    icon: BarChart3,
    color: 'violet' as const,
    title: 'Monthly trend',
    desc: 'The bar chart reveals your spending pattern month-over-month. Bars above the average line are months you overspent.',
  },
  {
    icon: TrendingDown,
    color: 'emerald' as const,
    title: 'Drill into any category',
    desc: 'Click any row in the table or any slice in the donut to see every transaction that makes up that category.',
  },
  {
    icon: Merge,
    color: 'amber' as const,
    title: 'Clean up categories',
    desc: 'Bank statements often tag things wrong. Rename a category or merge two into one — your changes are saved and reflected everywhere.',
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
};

function GuideView({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto">
      {/* Icon + title */}
      <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 flex items-center justify-center mb-4">
        <PieChartIcon size={26} className="text-orange-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 text-center">Spend by Category</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
        Understand the full picture of your expenditure — broken down, trended, and drillable to the last rupee.
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
        {GUIDE_CARDS.map(card => {
          const Icon = card.icon;
          const cls = COLOR_MAP[card.color];
          return (
            <div key={card.title} className="flex gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${cls}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-0.5">{card.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div className="flex gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 w-full mb-8">
        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-bold">Tip:</span> Internal transfers (e.g. moving money between your own accounts) may appear as "debits" and inflate your spend numbers. Mark those as transfers in Transaction Explorer first for accurate analysis.
        </p>
      </div>

      <button
        onClick={onEnter}
        className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
      >
        View Spend by Category
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CAT_COLORS = [
  '#E76500', '#0070F3', '#107E3E', '#C62828', '#6A1B9A',
  '#00838F', '#F9A825', '#AD1457', '#1565C0', '#2E7D32',
];

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type ViewBy  = 'category' | 'merchant' | 'month' | 'label';
type AggMode = 'sum' | 'avg' | 'count';
type SortBy  = 'amount' | 'count' | 'name' | 'pct';

interface CategoryRow {
  key: string;
  amount: number;
  count: number;
  pct: number;
  prevAmount: number;
  prevCount: number;
  txnIds: string[];
}

function buildRows(txns: PFTransaction[], viewBy: ViewBy, agg: AggMode): CategoryRow[] {
  const map: Record<string, { txns: PFTransaction[]; ids: string[] }> = {};

  for (const t of txns) {
    let key: string;
    if (viewBy === 'category') key = t.category;
    else if (viewBy === 'merchant') key = t.description.split(' ').slice(0, 3).join(' ');
    else { key = t.date?.substring(0, 7) || 'Unknown'; }
    if (!map[key]) map[key] = { txns: [], ids: [] };
    map[key].txns.push(t);
    map[key].ids.push(t.id);
  }

  const total = txns.reduce((a, t) => a + t.amount, 0);

  return Object.entries(map).map(([key, { txns: groupTxns, ids }]) => {
    const sum   = groupTxns.reduce((a, t) => a + t.amount, 0);
    const count = groupTxns.length;
    const amount = agg === 'sum' ? sum : agg === 'avg' ? sum / count : count;
    return { key, amount, count, pct: total > 0 ? (sum / total) * 100 : 0, prevAmount: 0, prevCount: 0, txnIds: ids };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM RECHARTS TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{d.name}</p>
      <p className="text-slate-600 dark:text-slate-300">{fmtINR(d.value)} · {d.pct?.toFixed(1)}%</p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-0.5">{label}</p>
      <p className="text-[#E76500] font-semibold">{fmtINR(payload[0].value)}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ExpenditureDistribution() {
  const { toast } = useToast();
  const [mounted, setMounted]   = useState(false);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [labels, setLabels]     = useState<PFLabel[]>([]);

  // Guide
  const [showGuide, setShowGuide] = useState(false);

  // Controls
  const [period, setPeriod]       = useState('all');
  const [accountId, setAccountId] = useState('all');
  const [statementId, setStatementId] = useState('all');
  const [viewBy, setViewBy]       = useState<ViewBy>('category');
  const [agg, setAgg]             = useState<AggMode>('sum');
  const [sortBy, setSortBy]       = useState<SortBy>('amount');
  const [showMoM, setShowMoM]     = useState(false);
  const [drillKey, setDrillKey]   = useState<string | null>(null);
  const [activeDonut, setActiveDonut] = useState<number | null>(null);

  // Statement Value Help
  const [showStmtVH, setShowStmtVH]       = useState(false);
  const [stmtFilterAcct, setStmtFilterAcct] = useState('all');
  const stmtVHRef = useRef<HTMLDivElement>(null);

  // Category management
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [mergingKey, setMergingKey]   = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState('');
  const [newCatName, setNewCatName]   = useState('');
  const [showAddCat, setShowAddCat]   = useState(false);

  const reload = () => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setAllTxns(getPFTransactions());
    setCategories(getAllCategories());
    setLabels(getLabels());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    if (!localStorage.getItem(GUIDE_KEY)) setShowGuide(true);
    const h = () => reload();
    window.addEventListener('pf-store-updated', h);
    return () => window.removeEventListener('pf-store-updated', h);
  }, []);

  useEffect(() => {
    if (!showStmtVH) return;
    const handler = (e: MouseEvent) => {
      if (stmtVHRef.current && !stmtVHRef.current.contains(e.target as Node)) setShowStmtVH(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStmtVH]);

  const availableMonths = useMemo(() => getAvailableMonths(), [allTxns]);

  const txnLabelMap = useMemo(() => {
    const store = loadPFStore();
    const map = new Map<string, string[]>();
    for (const lm of store.labelMaps ?? []) {
      const label = labels.find(l => l.id === lm.labelId);
      if (!label) continue;
      if (!map.has(lm.transactionId)) map.set(lm.transactionId, []);
      map.get(lm.transactionId)!.push(label.name);
    }
    return map;
  }, [labels]);

  const filteredStmts = useMemo(
    () => stmtFilterAcct === 'all' ? statements : statements.filter(s => s.accountId === stmtFilterAcct),
    [statements, stmtFilterAcct],
  );

  const selectedStmtLabel = useMemo(() => {
    if (statementId === 'all') return 'All Statements';
    return statements.find(s => s.id === statementId)?.fileName ?? 'All Statements';
  }, [statementId, statements]);

  const base = useMemo(() => {
    let txns = allTxns;
    if (accountId !== 'all') txns = txns.filter(t => {
      const stmt = statements.find(s => s.id === t.statementId);
      return stmt?.accountId === accountId;
    });
    if (statementId !== 'all') txns = txns.filter(t => t.statementId === statementId);
    txns = filterByPeriod(txns, period);
    txns = txns.filter(t => t.type === 'debit');
    return txns;
  }, [allTxns, accountId, statementId, period, statements]);

  const prevBase = useMemo(() => {
    if (!showMoM || period === 'all') return [];
    const range = getPeriodRange(period);
    if (!range) return [];
    const from = new Date(range.from);
    const to   = new Date(range.to);
    const days = (to.getTime() - from.getTime()) / 86400000;
    const prevTo   = new Date(from.getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - days * 86400000);
    let txns = allTxns;
    if (accountId !== 'all') txns = txns.filter(t => {
      const stmt = statements.find(s => s.id === t.statementId);
      return stmt?.accountId === accountId;
    });
    txns = txns.filter(t =>
      t.date >= prevFrom.toISOString().split('T')[0] &&
      t.date <= prevTo.toISOString().split('T')[0] &&
      t.type === 'debit'
    );
    return txns;
  }, [allTxns, accountId, statementId, period, showMoM, statements]);

  const rows = useMemo(() => {
    let curr: CategoryRow[];
    if (viewBy === 'label') {
      const labelMap = new Map<string, { txns: PFTransaction[]; ids: string[] }>();
      const total = base.reduce((s, t) => s + t.amount, 0);
      for (const t of base) {
        const txnLabels = txnLabelMap.get(t.id) ?? ['Unlabeled'];
        for (const lname of txnLabels) {
          if (!labelMap.has(lname)) labelMap.set(lname, { txns: [], ids: [] });
          labelMap.get(lname)!.txns.push(t);
          labelMap.get(lname)!.ids.push(t.id);
        }
      }
      curr = Array.from(labelMap.entries()).map(([key, { txns: groupTxns, ids }]) => {
        const sum   = groupTxns.reduce((s, t) => s + t.amount, 0);
        const count = groupTxns.length;
        const amount = agg === 'sum' ? sum : agg === 'avg' ? sum / count : count;
        return { key, amount, count, pct: total > 0 ? (sum / total) * 100 : 0, prevAmount: 0, prevCount: 0, txnIds: ids };
      });
    } else {
      curr = buildRows(base, viewBy, agg);
    }
    const prev = buildRows(prevBase, viewBy, agg);
    const prevMap: Record<string, CategoryRow> = {};
    prev.forEach(r => { prevMap[r.key] = r; });
    return curr.map(r => ({ ...r, prevAmount: prevMap[r.key]?.amount ?? 0, prevCount: prevMap[r.key]?.count ?? 0 }));
  }, [base, prevBase, viewBy, agg, txnLabelMap]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'count')  return b.count  - a.count;
      if (sortBy === 'pct')    return b.pct     - a.pct;
      return a.key.localeCompare(b.key);
    });
  }, [rows, sortBy]);

  // Monthly trend (all debits, not period-filtered, last 12 months)
  const monthlyTrend = useMemo(() => {
    const map: Record<string, number> = {};
    let txns = allTxns;
    if (accountId !== 'all') txns = txns.filter(t => {
      const stmt = statements.find(s => s.id === t.statementId);
      return stmt?.accountId === accountId;
    });
    if (statementId !== 'all') txns = txns.filter(t => t.statementId === statementId);
    for (const t of txns.filter(t => t.type === 'debit')) {
      const m = t.date?.substring(0, 7) ?? 'Unknown';
      map[m] = (map[m] ?? 0) + t.amount;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({
        label: month.replace(/^(\d{4})-(\d{2})$/, (_, y, mo) => {
          const d = new Date(Number(y), Number(mo) - 1);
          return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        }),
        amount,
        fullMonth: month,
      }));
  }, [allTxns, accountId, statementId, statements]);

  // Donut data (top 8 + Others)
  const donutData = useMemo(() => {
    if (viewBy !== 'category' && viewBy !== 'merchant' && viewBy !== 'label') return [];
    const topN = 8;
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    const othersTotal = rest.reduce((s, r) => s + r.amount, 0);
    const data = top.map((r, i) => ({
      name: r.key,
      value: r.amount,
      pct: r.pct,
      color: CAT_COLORS[i % CAT_COLORS.length],
      txnIds: r.txnIds,
    }));
    if (othersTotal > 0) {
      data.push({ name: 'Others', value: othersTotal, pct: rest.reduce((s, r) => s + r.pct, 0), color: '#94a3b8', txnIds: rest.flatMap(r => r.txnIds) });
    }
    return data;
  }, [sorted, viewBy]);

  const drillTxns = useMemo(() => {
    if (!drillKey) return [];
    const row = rows.find(r => r.key === drillKey);
    if (!row) return [];
    return base.filter(t => row.txnIds.includes(t.id));
  }, [drillKey, rows, base]);

  // KPIs
  const totalAmount = base.reduce((a, t) => a + t.amount, 0);
  const topRow      = sorted[0];
  const avgPerMonth = monthlyTrend.length > 0 ? monthlyTrend.reduce((s, m) => s + m.amount, 0) / monthlyTrend.length : 0;
  const biggestTxn  = base.length > 0 ? base.reduce((max, t) => t.amount > max.amount ? t : max, base[0]) : null;
  const avgMonthlyTrend = monthlyTrend.length > 0 ? monthlyTrend.reduce((s, m) => s + m.amount, 0) / monthlyTrend.length : 0;

  const coverage    = getStatementCoverageRange();
  const lastUpdated = getLastUpdatedTimestamp();
  const hasData     = allTxns.length > 0;

  // ── Category management ────────────────────────────────────────────────────
  const handleRename = (oldKey: string) => {
    if (!renameValue.trim() || renameValue.trim() === oldKey) { setRenamingKey(null); return; }
    const newCat = renameValue.trim();
    addUserCategory(newCat);
    const ids = rows.find(r => r.key === oldKey)?.txnIds ?? [];
    bulkApplyCategoryOverride(ids, newCat);
    setRenamingKey(null);
    toast(`Renamed "${oldKey}" → "${newCat}" (${ids.length} transactions)`, 'success');
  };

  const handleMerge = (sourceKey: string) => {
    if (!mergeTarget || mergeTarget === sourceKey) { setMergingKey(null); return; }
    const ids = rows.find(r => r.key === sourceKey)?.txnIds ?? [];
    bulkApplyCategoryOverride(ids, mergeTarget);
    setMergingKey(null);
    toast(`Merged "${sourceKey}" into "${mergeTarget}" (${ids.length} transactions)`, 'success');
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addUserCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCat(false);
    toast(`Category "${newCatName.trim()}" added`, 'success');
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const header = showMoM ? 'Category,Amount,Count,% of Total,Previous,Change' : 'Category,Amount,Count,% of Total';
    const rowLines = sorted.map(r => {
      const change = showMoM ? `,${(r.amount - r.prevAmount).toFixed(2)}` : '';
      const prev   = showMoM ? `,${r.prevAmount.toFixed(2)}` : '';
      return `"${r.key}",${r.amount.toFixed(2)},${r.count},${r.pct.toFixed(1)}${prev}${change}`;
    });
    downloadFile([header, ...rowLines].join('\n'), 'expenditure.csv', 'text/csv');
    toast(`Exported ${sorted.length} rows`, 'success');
  };

  if (!mounted) return null;

  // ── Guide ──────────────────────────────────────────────────────────────────
  if (showGuide) {
    return (
      <GuideView
        onEnter={() => { localStorage.setItem(GUIDE_KEY, '1'); setShowGuide(false); }}
      />
    );
  }

  return (
    <div className="space-y-0">

      {/* ── KPI Header ──────────────────────────────────────────────────────── */}
      <SAPHeader
        title="Spend by Category"
        subtitle="Debit transactions grouped and analysed"
        compact
        fullWidth
        actions={
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <BookOpen size={13} />
            Guide
          </button>
        }
        kpis={hasData ? [
          {
            label: 'Total Spend',
            value: fmtINR(totalAmount),
            icon: TrendingDown,
            color: 'error',
            subtitle: period === 'all' ? 'all time' : period,
          },
          {
            label: 'Top Category',
            value: topRow?.key ?? '—',
            icon: ShoppingBag,
            color: 'warning',
            subtitle: topRow ? `${fmtINR(topRow.amount)} · ${topRow.pct.toFixed(1)}%` : undefined,
          },
          {
            label: 'Avg / Month',
            value: fmtINR(avgPerMonth),
            icon: Calendar,
            color: 'primary',
            subtitle: `over ${monthlyTrend.length} month${monthlyTrend.length !== 1 ? 's' : ''}`,
          },
          {
            label: 'Biggest Txn',
            value: biggestTxn ? fmtINR(biggestTxn.amount) : '—',
            icon: CreditCard,
            color: 'neutral',
            subtitle: biggestTxn ? biggestTxn.description.split(' ').slice(0, 3).join(' ') : undefined,
          },
        ] : undefined}
      />

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <PFFilterBarHeader
          actions={
            <button onClick={() => setShowAddCat(v => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              <Plus size={11} /> Add Category
            </button>
          }
        />
        <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">

          {/* Period */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Month / Period</label>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <option value="all">All Months</option>
              {availableMonths.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>

          {/* Account */}
          {accounts.length > 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Account</label>
              <select value={accountId} onChange={e => { setAccountId(e.target.value); setStatementId('all'); }}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <option value="all">All Accounts</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          {/* Statement */}
          <div className="flex flex-col gap-1 relative" ref={stmtVHRef}>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Statement</label>
            <button
              onClick={() => setShowStmtVH(v => !v)}
              className="flex items-center justify-between text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-[#0070F3] transition-colors text-left w-full"
            >
              <span className="truncate">{selectedStmtLabel}</span>
              <ChevronDown size={14} className="shrink-0 text-slate-400 ml-1" />
            </button>
            {showStmtVH && (
              <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                {accounts.length > 1 && (
                  <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Filter by Account</label>
                    <select value={stmtFilterAcct} onChange={e => setStmtFilterAcct(e.target.value)}
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                      <option value="all">All Accounts</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto py-1">
                  <button onClick={() => { setStatementId('all'); setShowStmtVH(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${statementId === 'all' ? 'text-[#0070F3] font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-200'}`}>
                    All Statements
                  </button>
                  {filteredStmts.map(s => (
                    <button key={s.id} onClick={() => { setStatementId(s.id); setShowStmtVH(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${statementId === s.id ? 'text-[#0070F3] font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-200'}`}>
                      <span className="block truncate">{s.fileName}</span>
                      {accounts.length > 1 && (
                        <span className="text-[10px] text-slate-400">{accounts.find(a => a.id === s.accountId)?.name ?? s.accountId}</span>
                      )}
                    </button>
                  ))}
                  {filteredStmts.length === 0 && (
                    <p className="px-4 py-3 text-xs text-slate-400">No statements found.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <option value="amount">Amount</option>
              <option value="pct">% Share</option>
              <option value="count">Count</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {showAddCat && (
          <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">New Category Name</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Entertainment"
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }} />
              </div>
              <button onClick={handleAddCategory} className="mt-5 text-sm bg-[#0070F3] text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-[#005DD1] transition-colors">Add</button>
              <button onClick={() => setShowAddCat(false)} className="mt-5 text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── No data state ────────────────────────────────────────────────────── */}
      {!hasData ? (
        <div className="bg-white dark:bg-slate-900 text-center py-20 text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Upload a bank statement in Statement Manager to see expenditure distribution.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 text-center py-10 text-slate-400 text-sm">
          {viewBy === 'label' && labels.length === 0
            ? 'No labels created yet. Create labels in Label Manager and assign them to transactions.'
            : 'No transactions found for the selected filters.'}
        </div>
      ) : (
        <>
          {/* ── Charts Row ────────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">

              {/* Donut chart */}
              <div className="p-4">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  {viewBy === 'category' ? 'Category Share' : viewBy === 'merchant' ? 'Merchant Share' : 'Label Share'}
                </p>
                {donutData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="shrink-0" style={{ width: 160, height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%" cy="50%"
                            innerRadius={46} outerRadius={72}
                            paddingAngle={2}
                            dataKey="value"
                            onClick={(entry, index) => {
                              if (entry.name === 'Others') return;
                              setDrillKey(drillKey === entry.name ? null : entry.name);
                              setActiveDonut(activeDonut === index ? null : index);
                            }}
                            stroke="none"
                          >
                            {donutData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={entry.color}
                                opacity={activeDonut !== null && activeDonut !== index ? 0.4 : 1}
                                style={{ cursor: entry.name !== 'Others' ? 'pointer' : 'default' }}
                              />
                            ))}
                          </Pie>
                          <ReTooltip content={<DonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      {donutData.slice(0, 7).map((d, i) => (
                        <button
                          key={d.name}
                          onClick={() => {
                            if (d.name === 'Others') return;
                            setDrillKey(drillKey === d.name ? null : d.name);
                            setActiveDonut(activeDonut === i ? null : i);
                          }}
                          className={`w-full flex items-center gap-2 text-left rounded-md px-1.5 py-0.5 transition-colors ${
                            drillKey === d.name ? 'bg-slate-100 dark:bg-white/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                          } ${d.name !== 'Others' ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate flex-1">{d.name}</span>
                          <span className="text-[10px] font-semibold text-slate-500 shrink-0">{d.pct?.toFixed(1)}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                    Switch to Category / Merchant / Label view for chart
                  </div>
                )}
              </div>

              {/* Monthly bar chart */}
              <div className="p-4">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Monthly Spend Trend {drillKey ? `— ${drillKey}` : '(All Categories)'}
                </p>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={monthlyTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                        width={45}
                      />
                      <ReTooltip content={<BarTooltip />} />
                      <ReferenceLine y={avgMonthlyTrend} stroke="#E76500" strokeDasharray="4 2" strokeWidth={1.5} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={32}>
                        {monthlyTrend.map((entry, index) => (
                          <Cell
                            key={entry.fullMonth}
                            fill={entry.amount > avgMonthlyTrend * 1.15 ? '#C62828' : '#0070F3'}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400">No monthly data</div>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  <span className="inline-block w-3 h-0.5 bg-[#E76500] mr-1 align-middle" style={{ display: 'inline-block' }} />
                  Avg {fmtINR(avgMonthlyTrend)}/mo · <span className="text-[#C62828]">Red bars</span> = above average
                </p>
              </div>
            </div>
          </div>

          {/* ── Table ─────────────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 overflow-hidden">
            <PFSmartTableBar
              title="Breakdown Table"
              badges={
                <>
                  <PFBadge color="slate">{fmtINR(totalAmount)} total</PFBadge>
                  <PFBadge color="blue">
                    {sorted.length} {viewBy === 'category' ? 'categories' : viewBy === 'merchant' ? 'merchants' : viewBy === 'month' ? 'months' : 'labels'}
                  </PFBadge>
                  <PFBadge color="slate">{base.length} txns</PFBadge>
                </>
              }
              actions={
                <>
                  {/* View By */}
                  <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
                    {(['category', 'merchant', 'month', 'label'] as ViewBy[]).map(v => (
                      <button key={v} onClick={() => { setViewBy(v); setDrillKey(null); setActiveDonut(null); }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${viewBy === v ? 'bg-[#0070F3] text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {v === 'category' ? 'Category' : v === 'merchant' ? 'Merchant' : v === 'month' ? 'Month' : 'Label'}
                      </button>
                    ))}
                  </div>

                  <select value={agg} onChange={e => setAgg(e.target.value as AggMode)}
                    className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    <option value="sum">Sum</option>
                    <option value="avg">Avg / Txn</option>
                    <option value="count">Count</option>
                  </select>

                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer px-1">
                    <input type="checkbox" checked={showMoM} onChange={e => setShowMoM(e.target.checked)} className="rounded" />
                    MoM
                  </label>

                  <PFButton icon={<FileDown size={13} />} onClick={handleExport}>Export</PFButton>
                </>
              }
            />

            {drillKey && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Drilling into: {drillKey}</span>
                <span className="text-blue-400">·</span>
                <span>{drillTxns.length} transactions</span>
                <button onClick={() => { setDrillKey(null); setActiveDonut(null); }} className="ml-auto flex items-center gap-1 hover:text-blue-900 dark:hover:text-blue-100">
                  <X size={12} /> Clear
                </button>
              </div>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">
                    {viewBy === 'category' ? 'Category' : viewBy === 'merchant' ? 'Merchant' : viewBy === 'month' ? 'Month' : 'Label'}
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">{agg === 'count' ? 'Count' : agg === 'avg' ? 'Avg / Txn' : 'Amount'}</th>
                  <th className="px-4 py-3 text-right font-semibold hidden sm:table-cell">Txns</th>
                  <th className="px-4 py-3 text-right font-semibold">% of Total</th>
                  {showMoM && <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Prev</th>}
                  {showMoM && <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Δ Change</th>}
                  {viewBy === 'category' && <th className="px-4 py-3 text-center font-semibold w-16">Edit</th>}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => {
                  const change      = r.amount - r.prevAmount;
                  const isRenaming  = renamingKey === r.key;
                  const isMerging   = mergingKey  === r.key;
                  const isDrilled   = drillKey === r.key;
                  const rowColor    = CAT_COLORS[i % CAT_COLORS.length];

                  return (
                    <React.Fragment key={r.key}>
                      <tr
                        className={`border-t border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${isDrilled ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                        onClick={() => { if (!isRenaming && !isMerging) { setDrillKey(isDrilled ? null : r.key); setActiveDonut(isDrilled ? null : i); } }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rowColor }} />
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                  className="text-sm border border-[#0070F3] rounded px-2 py-1 bg-white dark:bg-slate-900 w-36"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') handleRename(r.key); if (e.key === 'Escape') setRenamingKey(null); }} />
                                <button onClick={() => handleRename(r.key)} className="text-[#107E3E]"><Check size={13} /></button>
                                <button onClick={() => setRenamingKey(null)} className="text-slate-400"><X size={13} /></button>
                              </div>
                            ) : (
                              <span className="font-medium text-slate-700 dark:text-slate-200">{r.key}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                          {agg === 'count' ? r.count : fmtINR(r.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 hidden sm:table-cell">{r.count}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 hidden sm:block overflow-hidden">
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(r.pct, 100)}%`, backgroundColor: rowColor }} />
                            </div>
                            <span className={`font-semibold ${r.pct >= 30 ? 'text-[#C62828]' : r.pct >= 15 ? 'text-[#E76500]' : 'text-slate-600 dark:text-slate-300'}`}>
                              {fmtPct(r.pct)}
                            </span>
                          </div>
                        </td>
                        {showMoM && (
                          <>
                            <td className="px-4 py-3 text-right text-slate-500 font-mono hidden md:table-cell">{r.prevAmount > 0 ? fmtINR(r.prevAmount) : '—'}</td>
                            <td className={`px-4 py-3 text-right font-mono font-semibold hidden md:table-cell ${change > 0 ? 'text-[#C62828]' : change < 0 ? 'text-[#107E3E]' : 'text-slate-400'}`}>
                              {r.prevAmount > 0 ? (change >= 0 ? '+' : '') + fmtINR(change) : '—'}
                            </td>
                          </>
                        )}
                        {viewBy === 'category' && (
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button title="Rename"
                                onClick={() => { setRenamingKey(r.key); setRenameValue(r.key); setMergingKey(null); }}
                                className="p-1 text-slate-300 hover:text-[#0070F3] transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button title="Merge into another category"
                                onClick={() => { setMergingKey(isMerging ? null : r.key); setMergeTarget(''); setRenamingKey(null); }}
                                className="p-1 text-slate-300 hover:text-[#E76500] transition-colors">
                                <Merge size={12} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>

                      {isMerging && (
                        <tr className="bg-orange-50 dark:bg-orange-900/10 border-t border-orange-200 dark:border-orange-800">
                          <td colSpan={showMoM ? 7 : 5} className="px-4 py-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-600 dark:text-slate-300 font-medium">Merge "{r.key}" into:</span>
                              <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}
                                className="border border-orange-300 dark:border-orange-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                                <option value="">— select target —</option>
                                {categories.filter(c => c !== r.key).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <button onClick={() => handleMerge(r.key)} disabled={!mergeTarget}
                                className="text-sm bg-[#E76500] text-white px-3 py-1 rounded font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">
                                Merge
                              </button>
                              <button onClick={() => setMergingKey(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {isDrilled && drillTxns.length > 0 && !isRenaming && !isMerging && (
                        <tr className="bg-blue-50 dark:bg-blue-900/10">
                          <td colSpan={showMoM ? 7 : viewBy === 'category' ? 5 : 4} className="px-4 py-3">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                              {drillTxns.length} transactions in {r.key}
                            </p>
                            <div className="max-h-52 overflow-y-auto rounded-lg border border-blue-100 dark:border-blue-800">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-blue-100/60 dark:bg-blue-900/30 text-slate-400 uppercase text-[10px]">
                                    <th className="text-left px-3 py-1.5">Date</th>
                                    <th className="text-left px-3 py-1.5">Description</th>
                                    <th className="text-right px-3 py-1.5">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {drillTxns.slice(0, 25).map(t => (
                                    <tr key={t.id} className="border-t border-blue-100 dark:border-blue-800 hover:bg-blue-100/40 dark:hover:bg-blue-900/20">
                                      <td className="px-3 py-1.5 text-slate-500 whitespace-nowrap">{t.date}</td>
                                      <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{t.description}</td>
                                      <td className="px-3 py-1.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-200">{fmtINR(t.amount)}</td>
                                    </tr>
                                  ))}
                                  {drillTxns.length > 25 && (
                                    <tr><td colSpan={3} className="px-3 py-1.5 text-slate-400 text-center">…and {drillTxns.length - 25} more</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600 space-y-0.5">
              {coverage && (
                <p>Statements covering: <span className="font-medium">{coverage.from} → {coverage.to}</span></p>
              )}
              <p>Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
