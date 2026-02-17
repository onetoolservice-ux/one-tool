'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  PieChart, Pie, BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, FileDown, AlertCircle, BarChart3, Table as TableIcon,
  DollarSign, Calendar, Filter, X, Lightbulb, ChevronRight, Wallet,
  Search, RotateCcw, Save, Layers, SlidersHorizontal
} from 'lucide-react';
import { showToast } from '@/app/shared/Toast';
import { formatCurrency, downloadFile } from '@/app/lib/utils/tool-helpers';
import type { PieLabelRenderProps } from 'recharts';
import {
  getTransactions, getAllMonthKeys, getDetectedColumns,
  monthKeyToLabel, groupByAny, getAvailableDimensions, type Transaction,
  updateTransactionCategories, ALL_CATEGORIES, getAllTransactions,
} from './analytics-store';
import { SAPHeader, type KPICard, type ModeToggle } from './shared/SAPHeader';
import { SAPChartGrid, type ChartConfig } from './shared/SAPChartGrid';
import { SAPDataTable, type TableColumn, type TableGroup, type TableAction } from './shared/SAPDataTable';
import { SAP_COLORS, getChartColor } from './shared/sap-theme';

// ═══════════════════════════════════════════════════════════════════════════════
// CREDITS TOOL — Power BI-style flexible analytics
// Analyze by any dimension: category, payer, month, day of week, or any raw
// column from the uploaded file.
// ═══════════════════════════════════════════════════════════════════════════════

interface InsightCard {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

export function CreditsTool() {
  const [mounted, setMounted] = useState(false);
  const [savedMonths, setSavedMonths] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');
  const [showInsights, setShowInsights] = useState(true);
  const [drillDownKey, setDrillDownKey] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pendingCategoryEdits, setPendingCategoryEdits] = useState<Record<string, string>>({});
  const [groupByDimension, setGroupByDimension] = useState('category');
  const [sortBy, setSortBy] = useState<'total' | 'count' | 'avg' | 'max'>('total');
  const [topN, setTopN] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const months = getAllMonthKeys();
    setSavedMonths(months);
    if (months.length > 0) setSelectedMonths(months);
  }, []);

  useEffect(() => {
    const handler = () => {
      const months = getAllMonthKeys();
      setSavedMonths(months);
    };
    window.addEventListener('analytics-store-updated', handler);
    return () => window.removeEventListener('analytics-store-updated', handler);
  }, []);

  // All credit transactions for selected months
  const credits = useMemo(() => {
    if (selectedMonths.length === 0) return [];
    const all: Transaction[] = [];
    selectedMonths.forEach(m => all.push(...getTransactions(m, 'credit')));
    return all;
  }, [selectedMonths]);

  // Detected columns (from any batch with data)
  const detectedCols = useMemo(() => {
    return getDetectedColumns();
  }, [credits]);

  // Dynamic dimension options based on actual uploaded data
  const availableDimensions = useMemo(() =>
    getAvailableDimensions(credits, detectedCols),
    [credits, detectedCols]
  );

  // Human-readable label for the current dimension
  const dimLabel = useMemo(() =>
    availableDimensions.find(d => d.value === groupByDimension)?.label ?? groupByDimension,
    [availableDimensions, groupByDimension]
  );

  const allCategories = useMemo(() => {
    const cats = new Set(credits.map(t => t.category));
    return Array.from(cats).sort();
  }, [credits]);

  // Monthly trend (for the area chart — always by month)
  const monthlyTrend = useMemo(() => {
    const byMonth = new Map<string, number>();
    selectedMonths.forEach(month => {
      const monthCredits = getTransactions(month, 'credit');
      byMonth.set(month, monthCredits.reduce((s, t) => s + t.amount, 0));
    });
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month: monthKeyToLabel(month), amount }));
  }, [selectedMonths]);

  // Apply all filters including drilldown
  const filtered = useMemo(() => {
    let result = credits;

    if (drillDownKey) {
      const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      result = result.filter(t => {
        if (groupByDimension === 'month') {
          return (t.date ? t.date.substring(0, 7) : 'Unknown') === drillDownKey;
        }
        if (groupByDimension === 'dayofweek') {
          const k = t.date ? (DAYS[new Date(t.date + 'T12:00:00').getDay()] || 'Unknown') : 'Unknown';
          return k === drillDownKey;
        }
        if (groupByDimension.startsWith('raw:')) {
          return ((t.rawData?.[groupByDimension.slice(4)] || '').trim() || 'Unknown') === drillDownKey;
        }
        const val = ((t as unknown as Record<string, unknown>)[groupByDimension] as string || '').trim();
        return (val || 'Unknown') === drillDownKey;
      });
    }

    if (selectedCategory) result = result.filter(t => t.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [credits, drillDownKey, selectedCategory, searchQuery, groupByDimension]);

  // Group and sort by chosen measure
  const grouped = useMemo(() => {
    const g = groupByAny(filtered, groupByDimension);
    if (sortBy === 'count') return [...g].sort((a, b) => b.count - a.count);
    if (sortBy === 'avg') return [...g].sort((a, b) => (b.totalAmount / b.count) - (a.totalAmount / a.count));
    if (sortBy === 'max') return [...g].sort((a, b) => {
      const mA = a.transactions.length > 0 ? Math.max(...a.transactions.map(t => t.amount)) : 0;
      const mB = b.transactions.length > 0 ? Math.max(...b.transactions.map(t => t.amount)) : 0;
      return mB - mA;
    });
    return g; // 'total' — already sorted by groupByAny
  }, [filtered, groupByDimension, sortBy]);

  const totalCredits = useMemo(() => filtered.reduce((a, t) => a + t.amount, 0), [filtered]);
  const avgCredit = filtered.length > 0 ? totalCredits / filtered.length : 0;
  const topGroup = grouped.length > 0 ? grouped[0] : null;
  const monthlyAvg = selectedMonths.length > 0 ? totalCredits / selectedMonths.length : 0;

  // Chart data with Top-N limit and per-row stats for rich tooltips
  const chartData = useMemo(() => {
    return grouped.slice(0, topN).map((g, i) => {
      const maxAmt = g.transactions.length > 0 ? Math.max(...g.transactions.map(t => t.amount)) : 0;
      const avgAmt = g.count > 0 ? g.totalAmount / g.count : 0;
      let barValue: number;
      if (sortBy === 'count') barValue = g.count;
      else if (sortBy === 'avg') barValue = avgAmt;
      else if (sortBy === 'max') barValue = maxAmt;
      else barValue = g.totalAmount;
      return { name: g.key, value: barValue, total: g.totalAmount, color: getChartColor(i), count: g.count, avg: avgAmt, max: maxAmt };
    });
  }, [grouped, topN, sortBy]);

  const insights = useMemo((): InsightCard[] => {
    const cards: InsightCard[] = [];
    if (topGroup && totalCredits > 0) {
      const pct = ((topGroup.totalAmount / totalCredits) * 100).toFixed(0);
      cards.push({
        icon: DollarSign,
        title: `${pct}% from ${topGroup.key}`,
        description: `${formatCurrency(topGroup.totalAmount)} of ${formatCurrency(totalCredits)} from top ${dimLabel}`,
        color: SAP_COLORS.success
      });
    }
    if (grouped.length >= 2) {
      const concentrated = grouped[0].totalAmount / totalCredits > 0.7;
      cards.push({
        icon: concentrated ? AlertCircle : BarChart3,
        title: concentrated ? 'Income is concentrated' : `Spread across ${grouped.length} ${dimLabel}s`,
        description: concentrated
          ? `Over 70% from ${grouped[0].key} — consider diversifying`
          : `Income distributed across ${grouped.length} groups`,
        color: concentrated ? SAP_COLORS.warning : SAP_COLORS.success
      });
    }
    if (monthlyTrend.length > 1) {
      const first = monthlyTrend[0].amount;
      const last = monthlyTrend[monthlyTrend.length - 1].amount;
      const growth = first > 0 ? ((last - first) / first) * 100 : 0;
      if (Math.abs(growth) > 5) {
        cards.push({
          icon: growth > 0 ? TrendingUp : AlertCircle,
          title: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}% income trend`,
          description: `${growth > 0 ? 'Increased' : 'Decreased'} from ${monthlyTrend[0].month} to ${monthlyTrend[monthlyTrend.length - 1].month}`,
          color: growth > 0 ? SAP_COLORS.success : SAP_COLORS.error
        });
      }
    }
    if (filtered.length > 0) {
      const large = filtered.filter(t => t.amount > avgCredit * 2);
      if (large.length > 0) {
        cards.push({
          icon: Wallet,
          title: `${large.length} large deposits`,
          description: `Above ${formatCurrency(avgCredit * 2)} (2× average)`,
          color: SAP_COLORS.primary
        });
      }
    }
    return cards;
  }, [topGroup, totalCredits, grouped, monthlyTrend, filtered, avgCredit, dimLabel]);

  const handleExport = () => {
    if (filtered.length === 0) { showToast('No data to export', 'error'); return; }
    const csv = ['Date,Description,Amount,Category',
      ...filtered.map(t => `${t.date},"${t.description}",${t.amount},${t.category}`)
    ].join('\n');
    downloadFile(csv,
      selectedMonths.length === 1 ? `credits-${selectedMonths[0]}.csv` : `credits-${selectedMonths.length}-months.csv`,
      'text/csv'
    );
    showToast('Credits exported', 'success');
  };

  const saveCategoryEdits = () => {
    if (Object.keys(pendingCategoryEdits).length === 0) return;
    updateTransactionCategories('', pendingCategoryEdits);
    setPendingCategoryEdits({});
    showToast(`Saved ${Object.keys(pendingCategoryEdits).length} category changes`, 'success');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setDrillDownKey(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || drillDownKey;

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month) ? (prev.length > 1 ? prev.filter(m => m !== month) : prev) : [...prev, month]
    );
  };

  const barFormatter = sortBy === 'count'
    ? (v: number) => v.toString()
    : (v: number) => formatCurrency(v);

  if (!mounted) return <div className="p-10 text-center text-slate-500">Loading Credits Analytics...</div>;

  if (savedMonths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-6">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Credits Analytics</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Understand your income sources — salary, refunds, transfers, and more</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upload your bank statement</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Go to Manage Transactions and upload a CSV or Excel file from your bank</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Map your columns</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tell us which column is Date, Amount, and Description — we auto-categorize the rest</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Analyze credits</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">See income trends, source breakdowns, and monthly comparisons — all in your browser</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/tools/analytics/managetransaction" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              <Calendar size={15} /> Upload Statement
            </a>
            <button
              onClick={() => { import('@/app/lib/sample-data').then(m => { m.loadSampleData(); window.location.reload(); }); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Lightbulb size={15} /> Try Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis: KPICard[] = [
    { label: 'Total Credits', value: formatCurrency(totalCredits), color: 'success', icon: TrendingUp, subtitle: `${filtered.length} transactions` },
    { label: 'Monthly Average', value: formatCurrency(monthlyAvg), color: 'primary', subtitle: `${selectedMonths.length} month${selectedMonths.length > 1 ? 's' : ''}` },
    { label: `Top ${dimLabel}`, value: topGroup?.key || '—', color: 'warning', subtitle: topGroup ? formatCurrency(topGroup.totalAmount) : '' },
    { label: `${dimLabel} Groups`, value: grouped.length, color: 'neutral', subtitle: `${selectedMonths.length} month${selectedMonths.length !== 1 ? 's' : ''}` },
  ];

  const modes: { label: string; value: string; onChange: (v: string) => void; options: ModeToggle[] }[] = [
    {
      label: 'View',
      value: viewMode,
      onChange: (v: string) => setViewMode(v as 'dashboard' | 'table'),
      options: [
        { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { key: 'table', label: 'Table', icon: TableIcon },
      ]
    }
  ];

  const charts: ChartConfig[] = [
    {
      id: 'income-sources',
      title: `Income by ${dimLabel}`,
      subtitle: `Top ${chartData.length} of ${grouped.length} • sorted by ${sortBy}`,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={barFormatter} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130}
              tickFormatter={v => v.length > 20 ? v.substring(0, 20) + '…' : v} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xl text-xs">
                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-1.5 max-w-[200px] truncate">{d.name}</p>
                    <div className="space-y-0.5">
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Total</span><span className="font-mono font-bold text-emerald-600">{formatCurrency(d.total)}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Count</span><span className="font-mono">{d.count}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Average</span><span className="font-mono">{formatCurrency(d.avg)}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Max</span><span className="font-mono">{formatCurrency(d.max)}</span></div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" name={sortBy === 'count' ? 'Count' : 'Amount'} radius={[0, 4, 4, 0]}
              onClick={(d) => setDrillDownKey(d.name ?? null)} cursor="pointer">
              {chartData.map((e, i) => (
                <Cell key={i} fill={e.color} opacity={drillDownKey === e.name ? 1 : drillDownKey ? 0.3 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
      height: Math.max(320, chartData.length * 30),
    },
    {
      id: 'distribution',
      title: `${dimLabel} Distribution`,
      subtitle: 'Percentage breakdown (top 8)',
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Pie data={chartData.slice(0, 8)} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90}
              label={(p: PieLabelRenderProps) => `${((p.percent ?? 0) * 100).toFixed(0)}%`}
              onClick={(d) => setDrillDownKey(d.name ?? null)} cursor="pointer"
            >
              {chartData.slice(0, 8).map((e, i) => (
                <Cell key={i} fill={e.color} opacity={drillDownKey === e.name ? 1 : drillDownKey ? 0.3 : 1} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ),
      height: 320,
    },
    {
      id: 'monthly-trend',
      title: 'Monthly Income Trend',
      subtitle: `${monthlyTrend.length} months`,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SAP_COLORS.success} stopOpacity={0.8} />
                <stop offset="95%" stopColor={SAP_COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Area type="monotone" dataKey="amount" name="Income" stroke={SAP_COLORS.success} strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
      height: 320,
      isEmpty: monthlyTrend.length === 0,
    },
    {
      id: 'avg-by-group',
      title: `Average per ${dimLabel}`,
      subtitle: 'Avg transaction value per group',
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.slice(0, 10).map(d => ({ ...d, value: d.avg }))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130}
              tickFormatter={v => v.length > 20 ? v.substring(0, 20) + '…' : v} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="value" name="Avg Amount" radius={[0, 4, 4, 0]}>
              {chartData.slice(0, 10).map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
      height: 320,
    },
  ];

  const tableColumns: TableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, width: '120px' },
    { key: 'description', label: 'Description', sortable: true, render: (val) => <span className="max-w-[300px] truncate block" title={val}>{val}</span> },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right', render: (val) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(val ?? 0)}</span> },
    { key: 'category', label: 'Source ✏️', sortable: true, render: (val, row) => {
      const pending = pendingCategoryEdits[row.id];
      const current = pending ?? val;
      const isDirty = pending !== undefined;
      return (
        <select
          value={current}
          onChange={e => setPendingCategoryEdits(prev => ({ ...prev, [row.id]: e.target.value }))}
          onClick={e => e.stopPropagation()}
          className={`text-xs rounded px-1.5 py-0.5 outline-none cursor-pointer transition-colors ${
            isDirty
              ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200'
              : 'bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
          }`}
        >
          {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      );
    }},
  ];

  const tableGroups: TableGroup[] = grouped.map((g, i) => ({
    key: g.key, label: g.key, color: getChartColor(i), count: g.count, totalAmount: g.totalAmount, rows: g.transactions,
  }));

  const tableActions: TableAction[] = [
    { key: 'export', label: 'Export', icon: FileDown, onClick: handleExport, variant: 'default' },
  ];

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* KPI Header */}
      <SAPHeader title="Credits Analytics" subtitle={`${filtered.length} transactions • ${formatCurrency(totalCredits)}`} modes={modes} kpis={kpis} compact={true} sticky={true} />

      {/* ── TOP TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-shrink-0">
        {/* ── Primary Row ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">

          {/* Month selector */}
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-400 transition-colors"
            >
              <Calendar size={14} className="text-emerald-500" />
              {selectedMonths.length === 1 ? monthKeyToLabel(selectedMonths[0]) : `${selectedMonths.length} months`}
            </button>
            {showMonthPicker && (
              <div className="absolute z-20 top-full mt-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 min-w-[200px]">
                {savedMonths.map(m => (
                  <label key={m} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" checked={selectedMonths.includes(m)} onChange={() => toggleMonth(m)}
                      className="rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{monthKeyToLabel(m)}</span>
                    <span className="ml-auto text-xs text-slate-400">{getTransactions(m, 'credit').length}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search credits..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/30 outline-none"
            />
          </div>

          {/* Active drilldown badge */}
          {drillDownKey && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
              <Filter size={11} /> {drillDownKey}
              <button onClick={() => setDrillDownKey(null)} className="ml-1 hover:text-emerald-900"><X size={11} /></button>
            </span>
          )}

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <RotateCcw size={12} /> Clear
            </button>
          )}

          <div className="flex-1" />

          {/* Save category edits */}
          {Object.keys(pendingCategoryEdits).length > 0 && (
            <button
              onClick={saveCategoryEdits}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors animate-pulse"
            >
              <Save size={13} /> Save {Object.keys(pendingCategoryEdits).length} Changes
            </button>
          )}

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showAdvanced
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <SlidersHorizontal size={13} /> Advanced
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <FileDown size={13} /> Export
          </button>
        </div>

        {/* ── Advanced Row (collapsible) ───────────────────────────────── */}
        {showAdvanced && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center gap-3">

            {/* Category / Source filter */}
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setDrillDownKey(null); }}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/30 outline-none"
            >
              <option value="">All Sources</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat} ({credits.filter(t => t.category === cat).length})</option>
              ))}
            </select>

            {/* Analyze By */}
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Analyze by</span>
              <select
                value={groupByDimension}
                onChange={e => { setGroupByDimension(e.target.value); setDrillDownKey(null); }}
                className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500/30 outline-none font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <optgroup label="Standard">
                  {availableDimensions.filter(d => d.group === 'standard').map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Time">
                  {availableDimensions.filter(d => d.group === 'time').map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </optgroup>
                {availableDimensions.some(d => d.group === 'raw') && (
                  <optgroup label="Your Data Columns">
                    {availableDimensions.filter(d => d.group === 'raw').map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Measure / Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'total' | 'count' | 'avg' | 'max')}
              className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/30 outline-none"
            >
              <option value="total">By Total</option>
              <option value="count">By Count</option>
              <option value="avg">By Average</option>
              <option value="max">By Maximum</option>
            </select>

            {/* Top N */}
            <select
              value={topN}
              onChange={e => setTopN(Number(e.target.value))}
              className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/30 outline-none"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={9999}>All</option>
            </select>

            {/* Insights toggle */}
            {insights.length > 0 && (
              <button
                onClick={() => setShowInsights(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  showInsights
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Lightbulb size={13} /> Insights {showInsights ? 'on' : 'off'}
              </button>
            )}
          </div>
        )}

        {/* Insights strip */}
        {showInsights && insights.length > 0 && viewMode === 'dashboard' && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
            <div className="flex flex-wrap gap-2">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg flex-1 min-w-[200px]">
                  <div className="p-1 rounded" style={{ backgroundColor: `${ins.color}20` }}>
                    <ins.icon size={13} style={{ color: ins.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{ins.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{ins.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drill-down breadcrumb */}
      {drillDownKey && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex-shrink-0">
          <Filter size={14} className="text-emerald-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
            Drill-down: <span className="text-emerald-600">{dimLabel}</span> = {drillDownKey}
          </span>
          <button onClick={() => setDrillDownKey(null)} className="ml-auto p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded">
            <X size={14} className="text-emerald-600" />
          </button>
        </div>
      )}

      {/* ── FULL-WIDTH CONTENT ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {viewMode === 'dashboard' ? (
          <>
            <SAPChartGrid charts={charts} columns={2} />
            {grouped.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {dimLabel} Breakdown
                  </h4>
                  <p className="text-xs text-slate-400">Click a row to drill down</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="px-4 py-2 text-left font-bold text-slate-600 dark:text-slate-300">{dimLabel}</th>
                        <th className="px-4 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Total</th>
                        <th className="px-4 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Max</th>
                        <th className="px-4 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Avg</th>
                        <th className="px-4 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Share</th>
                        <th className="px-4 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Txns</th>
                        <th className="px-4 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((g, i) => {
                        const maxTxn = g.transactions.length > 0 ? Math.max(...g.transactions.map(t => t.amount)) : 0;
                        const avgTxn = g.count > 0 ? g.totalAmount / g.count : 0;
                        return (
                          <tr key={g.key}
                            className={`border-t border-slate-100 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors ${drillDownKey === g.key ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                            onClick={() => setDrillDownKey(drillDownKey === g.key ? null : g.key)}
                          >
                            <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getChartColor(i) }} />
                                <span className="truncate max-w-[200px]" title={g.key}>{g.key}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(g.totalAmount)}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">{formatCurrency(maxTxn)}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-500">{formatCurrency(avgTxn)}</td>
                            <td className="px-4 py-2 text-right text-slate-500">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${totalCredits > 0 ? (g.totalAmount / totalCredits * 100) : 0}%`, backgroundColor: getChartColor(i) }} />
                                </div>
                                {totalCredits > 0 ? ((g.totalAmount / totalCredits) * 100).toFixed(1) : '0'}%
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right text-slate-500">{g.count}</td>
                            <td className="px-4 py-2 text-right"><ChevronRight size={14} className="text-slate-300 inline" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <SAPDataTable
            columns={tableColumns}
            groups={tableGroups}
            selectable={true}
            actions={tableActions}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}
