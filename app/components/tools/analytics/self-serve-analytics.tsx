'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  Upload, BarChart3, TrendingUp, FileDown,
  ArrowUpDown, Activity, Database, Calculator, Hash, Table,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { showToast } from '@/app/shared/Toast';
import { formatNumber, downloadFile } from '@/app/lib/utils/tool-helpers';

// ── Shared Constants ──────────────────────────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#06b6d4', '#84cc16'];

const SAMPLE_CSV = `Month,Revenue,Expenses,Profit,Customers
Jan,45000,32000,13000,120
Feb,52000,34000,18000,145
Mar,48000,31000,17000,132
Apr,61000,38000,23000,178
May,58000,35000,23000,165
Jun,67000,40000,27000,198
Jul,72000,42000,30000,215
Aug,69000,39000,30000,205
Sep,75000,44000,31000,230
Oct,82000,48000,34000,255
Nov,78000,45000,33000,242
Dec,91000,52000,39000,280`;

// ── Utility Functions ─────────────────────────────────────────────────────────
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = lines.slice(1)
    .map(line => line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, '')))
    .filter(row => row.length === headers.length && row.some(cell => cell !== ''));
  return { headers, rows };
}

function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && value.trim() !== '';
}

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELF-SERVE ANALYTICS
// Paste CSV data → auto-detect columns → visualize with charts → view stats
// ═══════════════════════════════════════════════════════════════════════════════
export function SelfServeAnalytics() {
  const [rawData, setRawData] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'stats'>('chart');

  useEffect(() => { setMounted(true); }, []);

  const { headers, rows } = useMemo(() => parseCSV(rawData), [rawData]);

  const numericColumns = useMemo(() =>
    headers.filter((_, i) => rows.length > 0 && rows.every(r => isNumeric(r[i]))),
    [headers, rows]
  );

  // Auto-select axes when data loads
  useEffect(() => {
    if (headers.length > 0 && !xAxis) {
      setXAxis(headers[0]);
      const firstNumeric = numericColumns[0];
      if (firstNumeric) setYAxis(firstNumeric);
    }
  }, [headers, numericColumns, xAxis]);

  // Build chart data
  const chartData = useMemo(() => {
    if (!xAxis || !yAxis || headers.length === 0) return [];
    const xi = headers.indexOf(xAxis);
    const yi = headers.indexOf(yAxis);
    if (xi === -1 || yi === -1) return [];
    return rows.map(r => ({ name: r[xi], value: Number(r[yi]) || 0 }));
  }, [headers, rows, xAxis, yAxis]);

  // Statistics for each numeric column
  const stats = useMemo(() => {
    return numericColumns.map(col => {
      const ci = headers.indexOf(col);
      const values = rows.map(r => Number(r[ci])).filter(v => !isNaN(v));
      if (values.length === 0) return { name: col, count: 0, sum: 0, avg: 0, min: 0, max: 0, median: 0, stdDev: 0 };
      return {
        name: col,
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: getMedian(values),
        stdDev: getStdDev(values),
      };
    });
  }, [headers, rows, numericColumns]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (sortCol === null) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na;
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [rows, sortCol, sortDir]);

  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colIndex);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    if (headers.length === 0) { showToast('No data to export', 'error'); return; }
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, 'analytics-data.csv', 'text/csv');
    showToast('Data exported as CSV', 'success');
  };

  const handleLoadSample = () => {
    setRawData(SAMPLE_CSV);
    setXAxis('');
    setSortCol(null);
    showToast('Sample data loaded!', 'success');
  };

  const handleClear = () => {
    setRawData('');
    setXAxis('');
    setYAxis('');
    setSortCol(null);
    showToast('Data cleared', 'info');
  };

  if (!mounted) return <div className="p-10 text-center text-slate-500">Loading Analytics Engine...</div>;

  const hasData = headers.length > 0 && rows.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)] overflow-hidden p-2">
      {/* ── LEFT: Input & Controls ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[380px] lg:min-w-[380px] h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
        {/* Data Input */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <Database size={15} className="text-blue-500" /> Data Input
            </h3>
            <div className="flex gap-1.5">
              <button onClick={handleLoadSample} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition-colors">
                Sample
              </button>
              {rawData && (
                <button onClick={handleClear} className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            value={rawData}
            onChange={e => { setRawData(e.target.value); setXAxis(''); setSortCol(null); }}
            placeholder={"Paste CSV data here...\n\nExample:\nMonth,Sales,Profit\nJan,45000,13000\nFeb,52000,18000"}
            className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
          {hasData && (
            <p className="text-[11px] text-slate-500 mt-1.5">
              {rows.length} rows &middot; {headers.length} columns &middot; {numericColumns.length} numeric
            </p>
          )}
        </div>

        {/* Chart Controls */}
        {hasData && (
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <BarChart3 size={15} className="text-indigo-500" /> Chart Config
            </h3>

            {/* Chart Type */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { key: 'bar' as const, label: 'Bar', Icon: BarChart3 },
                  { key: 'line' as const, label: 'Line', Icon: Activity },
                  { key: 'area' as const, label: 'Area', Icon: TrendingUp },
                  { key: 'pie' as const, label: 'Pie', Icon: Calculator },
                ]).map(ct => (
                  <button
                    key={ct.key}
                    onClick={() => setChartType(ct.key)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                      chartType === ct.key
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ct.Icon size={14} />
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* X Axis */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">X Axis (Labels)</label>
              <select
                value={xAxis}
                onChange={e => setXAxis(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Y Axis */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Y Axis (Values)</label>
              <select
                value={yAxis}
                onChange={e => setYAxis(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {numericColumns.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <FileDown size={14} /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Visualization ───────────────────────────────────────────── */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-3">
            <Upload size={48} strokeWidth={1.2} />
            <p className="text-base font-semibold">Paste CSV data to get started</p>
            <p className="text-sm">Or click &quot;Sample&quot; to load demo data</p>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex gap-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl p-1">
              {([
                { key: 'chart' as const, label: 'Chart', Icon: BarChart3 },
                { key: 'table' as const, label: 'Table', Icon: Table },
                { key: 'stats' as const, label: 'Statistics', Icon: Calculator },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.Icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Chart View ───────────────────────────────────────────── */}
            {activeTab === 'chart' && chartData.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                  {yAxis} by {xAxis}
                </h4>
                <ResponsiveContainer width="100%" height={350}>
                  {chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatNumber(v, 0)} />
                      <Bar dataKey="value" name={yAxis} radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatNumber(v, 0)} />
                      <Line type="monotone" dataKey="value" name={yAxis} stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                    </LineChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatNumber(v, 0)} />
                      <defs>
                        <linearGradient id="selfServeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" name={yAxis} stroke="#6366f1" strokeWidth={2} fill="url(#selfServeAreaGrad)" />
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Tooltip formatter={(v: number) => formatNumber(v, 0)} />
                      <Legend />
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Statistics View ──────────────────────────────────────── */}
            {activeTab === 'stats' && stats.length > 0 && (
              <div className="space-y-4">
                {/* Summary KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Rows</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{rows.length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Columns</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{headers.length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Numeric Cols</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{numericColumns.length}</p>
                  </div>
                </div>

                {/* Per-column stats */}
                {stats.map(s => (
                  <div key={s.name} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Hash size={13} className="text-indigo-500" /> {s.name}
                    </h5>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        { label: 'Sum', value: formatNumber(s.sum, 0) },
                        { label: 'Average', value: formatNumber(s.avg, 2) },
                        { label: 'Min', value: formatNumber(s.min, 0) },
                        { label: 'Max', value: formatNumber(s.max, 0) },
                        { label: 'Median', value: formatNumber(s.median, 2) },
                        { label: 'Std Dev', value: formatNumber(s.stdDev, 2) },
                      ].map(stat => (
                        <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Table View ───────────────────────────────────────────── */}
            {activeTab === 'table' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        {headers.map((h, i) => (
                          <th
                            key={h}
                            onClick={() => handleSort(i)}
                            className="px-3 py-2.5 text-left font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                          >
                            <span className="flex items-center gap-1">
                              {h}
                              {sortCol === i ? (
                                sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                              ) : (
                                <ArrowUpDown size={10} className="opacity-30" />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((row, ri) => (
                        <tr key={ri} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className={`px-3 py-2 ${isNumeric(cell) ? 'text-right font-mono text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {isNumeric(cell) ? formatNumber(Number(cell), 0) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS REPORT — Consolidated dashboard from shared analytics store
// Reads data from ManageTransactions. Shows multi-month overview with
// credits vs debits trend, category breakdowns, KPI cards, and comparison.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  loadStore, getAllMonthKeys, getMonthData, monthKeyToLabel, monthKeyToShort,
  groupByCategory, calculateSummary, type MonthlyData,
} from './analytics-store';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';
import type { PieLabelRenderProps } from 'recharts';

const REPORT_COLORS = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#06b6d4', '#84cc16'];

export function AnalyticsReport() {
  const [mounted, setMounted] = useState(false);
  const [savedMonths, setSavedMonths] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [activeView, setActiveView] = useState<'overview' | 'compare' | 'categories'>('overview');

  useEffect(() => {
    setMounted(true);
    const months = getAllMonthKeys();
    setSavedMonths(months);
    setSelectedMonths(months.slice(0, Math.min(6, months.length)));
  }, []);

  useEffect(() => {
    const handler = () => {
      const months = getAllMonthKeys();
      setSavedMonths(months);
    };
    window.addEventListener('analytics-store-updated', handler);
    return () => window.removeEventListener('analytics-store-updated', handler);
  }, []);

  const toggleMonth = (key: string) => {
    setSelectedMonths(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key].sort().reverse()
    );
  };

  const selectAll = () => setSelectedMonths([...savedMonths]);
  const clearAll = () => setSelectedMonths([]);

  // ── Computed Data ────────────────────────────────────────────────────────
  const monthsData = useMemo(() => {
    return selectedMonths
      .map(key => getMonthData(key))
      .filter((d): d is MonthlyData => d !== null);
  }, [selectedMonths]);

  const trendData = useMemo(() => {
    return [...monthsData].reverse().map(md => ({
      month: monthKeyToShort(md.monthKey),
      credits: md.summary.totalCredits,
      debits: md.summary.totalDebits,
      net: md.summary.netFlow,
    }));
  }, [monthsData]);

  const allTransactions = useMemo(() => {
    return monthsData.flatMap(md => md.transactions);
  }, [monthsData]);

  const totalSummary = useMemo(() => calculateSummary(allTransactions), [allTransactions]);

  const expensesByCategory = useMemo(() =>
    groupByCategory(allTransactions.filter(t => t.type === 'debit')),
    [allTransactions]
  );
  const creditsByCategory = useMemo(() =>
    groupByCategory(allTransactions.filter(t => t.type === 'credit')),
    [allTransactions]
  );

  const categoryPieData = useMemo(() =>
    expensesByCategory.map((g, i) => ({
      name: g.key,
      value: g.totalAmount,
      color: REPORT_COLORS[i % REPORT_COLORS.length],
    })),
    [expensesByCategory]
  );

  const savingsRate = totalSummary.totalCredits > 0
    ? ((totalSummary.netFlow / totalSummary.totalCredits) * 100)
    : 0;

  const avgMonthlyExpense = monthsData.length > 0
    ? totalSummary.totalDebits / monthsData.length
    : 0;

  const avgMonthlyIncome = monthsData.length > 0
    ? totalSummary.totalCredits / monthsData.length
    : 0;

  if (!mounted) return <div className="p-10 text-center text-slate-500">Loading Analytics Report...</div>;

  if (savedMonths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-slate-400 dark:text-slate-500 gap-4 p-6">
        <Activity size={48} strokeWidth={1.2} />
        <p className="text-base font-semibold">No transaction data available</p>
        <p className="text-sm text-center max-w-md">
          Upload your bank statements in <a href="/tools/analytics/managetransaction" className="font-bold text-blue-500 hover:underline">Manage Transactions</a> first, or try sample data to explore.
        </p>
        <div className="flex gap-3 mt-2">
          <a href="/tools/analytics/managetransaction" className="px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            Upload Statement
          </a>
          <button
            onClick={() => { import('@/app/lib/sample-data').then(m => { m.loadSampleData(); window.location.reload(); }); }}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Try Sample Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)] overflow-hidden p-2">
      {/* ── LEFT: Controls ──────────────────────────────────────────────── */}
      <div className="w-full lg:w-[340px] lg:min-w-[340px] h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
        {/* Month Selection */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm mb-3">
            <Database size={15} className="text-indigo-500" /> Months
          </h3>
          <div className="flex gap-2 mb-2">
            <button onClick={selectAll} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">Select all</button>
            <span className="text-slate-300">|</span>
            <button onClick={clearAll} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors">Clear</button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {savedMonths.map(key => (
              <label key={key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                  selectedMonths.includes(key)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(key)}
                  onChange={() => toggleMonth(key)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                {monthKeyToLabel(key)}
              </label>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm mb-2">View</h3>
          <div className="space-y-1.5">
            {([
              { key: 'overview' as const, label: 'Overview', Icon: BarChart3 },
              { key: 'compare' as const, label: 'Month Compare', Icon: Activity },
              { key: 'categories' as const, label: 'Categories', Icon: Calculator },
            ]).map(v => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === v.key
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                }`}>
                <v.Icon size={13} /> {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Style */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm mb-2">Chart Style</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setChartType('bar')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${chartType === 'bar' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              Bar
            </button>
            <button onClick={() => setChartType('line')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${chartType === 'line' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              Line
            </button>
          </div>
        </div>

        {/* Export */}
        <button onClick={() => {
          if (allTransactions.length === 0) { showToast('No data to export', 'error'); return; }
          const csv = ['Date,Description,Amount,Type,Category',
            ...allTransactions.map(t => `${t.date},"${t.description}",${t.amount},${t.type},${t.category}`)
          ].join('\n');
          downloadFile(csv, `analytics-report.csv`, 'text/csv');
          showToast('Report exported', 'success');
        }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
          <FileDown size={14} /> Export All Data
        </button>
      </div>

      {/* ── RIGHT: Report ────────────────────────────────────────────────── */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
        {selectedMonths.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <Database size={48} strokeWidth={1.2} />
            <p className="text-base font-semibold">Select months to view report</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white">Consolidated Analytics Report</h2>
              <p className="text-xs text-slate-500">
                {selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''} selected &middot;
                {allTransactions.length} transactions &middot;
                Generated {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Income</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSummary.totalCredits)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Expenses</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">{formatCurrency(totalSummary.totalDebits)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Net Flow</p>
                <p className={`text-lg font-black ${totalSummary.netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {totalSummary.netFlow >= 0 ? '+' : ''}{formatCurrency(totalSummary.netFlow)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Savings Rate</p>
                <p className={`text-lg font-black ${savingsRate >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg Monthly Spend</p>
                <p className="text-lg font-black text-slate-800 dark:text-white">{formatCurrency(avgMonthlyExpense)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg Monthly Income</p>
                <p className="text-lg font-black text-slate-800 dark:text-white">{formatCurrency(avgMonthlyIncome)}</p>
              </div>
            </div>

            {/* ── Overview Tab ───────────────────────────────────────── */}
            {activeView === 'overview' && (
              <>
                {/* Credits vs Debits Trend */}
                {trendData.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Income vs Expenses Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      {chartType === 'bar' ? (
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Legend />
                          <Bar dataKey="credits" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="debits" name="Expenses" fill="#ec4899" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="net" name="Net Flow" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Legend />
                          <Line type="monotone" dataKey="credits" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                          <Line type="monotone" dataKey="debits" name="Expenses" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4, fill: '#ec4899' }} />
                          <Line type="monotone" dataKey="net" name="Net Flow" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Expense Distribution Pie */}
                {categoryPieData.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Expense Distribution</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend />
                        <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}
                          label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                          {categoryPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {/* ── Compare Tab ───────────────────────────────────────── */}
            {activeView === 'compare' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 px-4 pt-4 pb-2">Monthly Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="px-4 py-2.5 text-left font-bold text-slate-600 dark:text-slate-300">Month</th>
                        <th className="px-4 py-2.5 text-right font-bold text-slate-600 dark:text-slate-300">Income</th>
                        <th className="px-4 py-2.5 text-right font-bold text-slate-600 dark:text-slate-300">Expenses</th>
                        <th className="px-4 py-2.5 text-right font-bold text-slate-600 dark:text-slate-300">Net Flow</th>
                        <th className="px-4 py-2.5 text-right font-bold text-slate-600 dark:text-slate-300">Savings %</th>
                        <th className="px-4 py-2.5 text-right font-bold text-slate-600 dark:text-slate-300">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthsData.map(md => {
                        const sr = md.summary.totalCredits > 0
                          ? ((md.summary.netFlow / md.summary.totalCredits) * 100).toFixed(1)
                          : '0.0';
                        return (
                          <tr key={md.monthKey} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">{monthKeyToLabel(md.monthKey)}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(md.summary.totalCredits)}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">{formatCurrency(md.summary.totalDebits)}</td>
                            <td className={`px-4 py-2.5 text-right font-mono font-bold ${md.summary.netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {md.summary.netFlow >= 0 ? '+' : ''}{formatCurrency(md.summary.netFlow)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-indigo-600 dark:text-indigo-400">{sr}%</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-500">{md.summary.transactionCount}</td>
                          </tr>
                        );
                      })}
                      {/* Totals row */}
                      <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                        <td className="px-4 py-2.5 font-black text-slate-800 dark:text-white">Total</td>
                        <td className="px-4 py-2.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSummary.totalCredits)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-black text-rose-600 dark:text-rose-400">{formatCurrency(totalSummary.totalDebits)}</td>
                        <td className={`px-4 py-2.5 text-right font-mono font-black ${totalSummary.netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {totalSummary.netFlow >= 0 ? '+' : ''}{formatCurrency(totalSummary.netFlow)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{savingsRate.toFixed(1)}%</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-500">{totalSummary.transactionCount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Categories Tab ─────────────────────────────────────── */}
            {activeView === 'categories' && (
              <>
                {/* Top Expense Categories */}
                {expensesByCategory.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Top Expense Categories</h4>
                    <ResponsiveContainer width="100%" height={Math.max(200, expensesByCategory.length * 36)}>
                      <BarChart data={expensesByCategory.map((g, i) => ({ name: g.key, amount: g.totalAmount, color: REPORT_COLORS[i % REPORT_COLORS.length] }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                          {expensesByCategory.map((_, i) => <Cell key={i} fill={REPORT_COLORS[i % REPORT_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Category Summary Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expense Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 px-4 pt-4 pb-2">Expense Categories</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800">
                            <th className="px-3 py-2 text-left font-bold text-slate-600 dark:text-slate-300">Category</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Amount</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-600 dark:text-slate-300">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expensesByCategory.map((g, i) => (
                            <tr key={g.key} className="border-t border-slate-100 dark:border-slate-800">
                              <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REPORT_COLORS[i % REPORT_COLORS.length] }} />
                                {g.key}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-rose-600 dark:text-rose-400">{formatCurrency(g.totalAmount)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-500">
                                {totalSummary.totalDebits > 0 ? ((g.totalAmount / totalSummary.totalDebits) * 100).toFixed(1) : '0'}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Income Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 px-4 pt-4 pb-2">Income Sources</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800">
                            <th className="px-3 py-2 text-left font-bold text-slate-600 dark:text-slate-300">Source</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-600 dark:text-slate-300">Amount</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-600 dark:text-slate-300">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {creditsByCategory.map((g, i) => (
                            <tr key={g.key} className="border-t border-slate-100 dark:border-slate-800">
                              <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REPORT_COLORS[i % REPORT_COLORS.length] }} />
                                {g.key}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(g.totalAmount)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-500">
                                {totalSummary.totalCredits > 0 ? ((g.totalAmount / totalSummary.totalCredits) * 100).toFixed(1) : '0'}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
