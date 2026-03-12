'use client';

import { useEffect, useState, useRef } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Edit3, Check, X,
  Calendar, Building2, FileText, ArrowUpRight, ArrowDownRight, Info,
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, fmtCurrency, todayISO,
  getPurchaseBills,
  type BizOSStore,
  type BizInvoice,
  type BizPurchaseBill,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BALANCE_KEY = 'biz-cashflow-balance';
const WEEKS = 13; // 91 days ≈ 13 weeks

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WeekBucket {
  label: string;
  startDate: string;
  endDate: string;
  inflow: number;
  outflow: number;
  runningBalance: number;
}

interface EnrichedInvoice {
  invoice: BizInvoice;
  customerName: string;
  daysUntilDue: number | null;
}

interface EnrichedBill {
  bill: BizPurchaseBill;
  vendorName: string;
  daysUntilDue: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function loadBalance(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(BALANCE_KEY);
  if (!raw) return 0;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? 0 : parsed;
}

function saveBalance(val: number): void {
  localStorage.setItem(BALANCE_KEY, String(val));
}

/** Returns YYYY-MM-DD for a date offset by `days` from today */
function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/** Days between today and a given ISO date string. Negative = overdue. */
function daysFromToday(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Week label: "This Week", "Week 2" … "Week 13" */
function weekLabel(weekIndex: number): string {
  if (weekIndex === 0) return 'This Week';
  return `Week ${weekIndex + 1}`;
}

/** Compact INR formatter for chart axis (e.g. ₹1.2L, ₹45K) */
function fmtShort(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val.toFixed(0)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data builders
// ─────────────────────────────────────────────────────────────────────────────

function buildWeeklyForecast(
  store: BizOSStore,
  openingBalance: number,
): WeekBucket[] {
  const today = todayISO();
  const invoiceList = Object.values(store.invoices).filter(
    inv => inv.status !== 'paid' && inv.status !== 'cancelled',
  );
  const purchaseList = Object.values(getPurchaseBills(store)).filter(
    b => b.status !== 'paid',
  );

  // Historical averages from the last 30 days
  const thirtyDaysAgo = offsetDate(-30);
  const recentTxs = store.transactions.filter(t => t.date >= thirtyDaysAgo && t.date <= today);
  const monthIncome = recentTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = recentTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const weeklyAvgIncome = monthIncome / 4;
  const weeklyAvgExpense = monthExpense / 4;

  const buckets: WeekBucket[] = [];
  let runningBalance = openingBalance;

  for (let w = 0; w < WEEKS; w++) {
    const weekStart = offsetDate(w * 7);
    const weekEnd = offsetDate(w * 7 + 6);

    // Inflow: unpaid invoices with dueDate in this week
    const invoiceInflow = invoiceList
      .filter(inv => inv.dueDate && inv.dueDate >= weekStart && inv.dueDate <= weekEnd)
      .reduce((s, inv) => s + inv.total, 0);
    const totalInflow = invoiceInflow + weeklyAvgIncome;

    // Outflow: pending purchase bills with dueDate in this week
    const billOutflow = purchaseList
      .filter(b => b.dueDate && b.dueDate >= weekStart && b.dueDate <= weekEnd)
      .reduce((s, b) => s + (b.total - b.paidAmount), 0);
    const totalOutflow = billOutflow + weeklyAvgExpense;

    runningBalance = runningBalance + totalInflow - totalOutflow;

    buckets.push({
      label: weekLabel(w),
      startDate: weekStart,
      endDate: weekEnd,
      inflow: Math.round(totalInflow),
      outflow: Math.round(totalOutflow),
      runningBalance: Math.round(runningBalance),
    });
  }

  return buckets;
}

function buildEnrichedInvoices(store: BizOSStore): EnrichedInvoice[] {
  return Object.values(store.invoices)
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .map(inv => ({
      invoice: inv,
      customerName: store.parties[inv.customerId]?.name ?? 'Unknown',
      daysUntilDue: inv.dueDate ? daysFromToday(inv.dueDate) : null,
    }))
    .sort((a, b) => {
      if (a.invoice.dueDate && b.invoice.dueDate)
        return a.invoice.dueDate.localeCompare(b.invoice.dueDate);
      if (a.invoice.dueDate) return -1;
      if (b.invoice.dueDate) return 1;
      return 0;
    });
}

function buildEnrichedBills(store: BizOSStore): EnrichedBill[] {
  return Object.values(getPurchaseBills(store))
    .filter(b => b.status !== 'paid')
    .map(b => ({
      bill: b,
      vendorName: store.parties[b.vendorId]?.name ?? 'Unknown',
      daysUntilDue: b.dueDate ? daysFromToday(b.dueDate) : null,
    }))
    .sort((a, b) => {
      if (a.bill.dueDate && b.bill.dueDate)
        return a.bill.dueDate.localeCompare(b.bill.dueDate);
      if (a.bill.dueDate) return -1;
      if (b.bill.dueDate) return 1;
      return 0;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function InvoiceRowColor(daysUntilDue: number | null): string {
  if (daysUntilDue === null) return 'text-slate-400 dark:text-slate-500';
  if (daysUntilDue <= 7) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
  if (daysUntilDue <= 28) return 'text-amber-600 dark:text-amber-400';
  return 'text-slate-500 dark:text-slate-400';
}

function BillRowColor(daysUntilDue: number | null): string {
  if (daysUntilDue === null) return 'text-slate-400 dark:text-slate-500';
  if (daysUntilDue < 0) return 'text-red-600 dark:text-red-400 font-bold';
  if (daysUntilDue <= 7) return 'text-amber-600 dark:text-amber-400 font-semibold';
  return 'text-slate-500 dark:text-slate-400';
}

function DueBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-xs text-slate-400">No due date</span>;
  if (days < 0) return <span className="text-xs font-bold text-red-600 dark:text-red-400">{Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Due today</span>;
  return <span className="text-xs text-slate-500 dark:text-slate-400">in {days}d</span>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CashflowTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6 mb-1">
          <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
          <span className="font-bold text-slate-900 dark:text-white">{fmtShort(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function BizCashflow() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceDraft, setBalanceDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load store and balance
  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    setOpeningBalance(loadBalance());
    return onBizStoreUpdate(load);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingBalance && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingBalance]);

  const handleEditBalance = () => {
    setBalanceDraft(String(openingBalance));
    setEditingBalance(true);
  };

  const handleSaveBalance = () => {
    const val = parseFloat(balanceDraft.replace(/[^0-9.-]/g, ''));
    const final = isNaN(val) ? 0 : val;
    setOpeningBalance(final);
    saveBalance(final);
    setEditingBalance(false);
  };

  const handleCancelBalance = () => {
    setBalanceDraft('');
    setEditingBalance(false);
  };

  const handleBalanceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveBalance();
    if (e.key === 'Escape') handleCancelBalance();
  };

  if (!store) return null;

  // ── Derived data ────────────────────────────────────────────────────────────
  const today = todayISO();
  const in30 = offsetDate(30);

  const unpaidInvoices = Object.values(store.invoices).filter(
    inv => inv.status !== 'paid' && inv.status !== 'cancelled',
  );
  const pendingBills = Object.values(getPurchaseBills(store)).filter(b => b.status !== 'paid');

  const inflow30 = unpaidInvoices
    .filter(inv => inv.dueDate && inv.dueDate >= today && inv.dueDate <= in30)
    .reduce((s, inv) => s + inv.total, 0);

  const outflow30 = pendingBills
    .filter(b => b.dueDate && b.dueDate >= today && b.dueDate <= in30)
    .reduce((s, b) => s + (b.total - b.paidAmount), 0);

  const net30 = inflow30 - outflow30;

  const weeklyData = buildWeeklyForecast(store, openingBalance);
  const enrichedInvoices = buildEnrichedInvoices(store);
  const enrichedBills = buildEnrichedBills(store);

  const minBalance = Math.min(...weeklyData.map(w => w.runningBalance));
  const hasDangerZone = minBalance < 0;

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: 'Current Balance',
      value: fmtCurrency(openingBalance),
      icon: DollarSign,
      color: 'neutral' as const,
      subtitle: 'Opening / bank balance',
    },
    {
      label: 'Expected In (30d)',
      value: fmtCurrency(inflow30),
      icon: TrendingUp,
      color: 'success' as const,
      subtitle: `${unpaidInvoices.filter(i => i.dueDate && i.dueDate >= today && i.dueDate <= in30).length} invoices due`,
    },
    {
      label: 'Expected Out (30d)',
      value: fmtCurrency(outflow30),
      icon: TrendingDown,
      color: 'error' as const,
      subtitle: `${pendingBills.filter(b => b.dueDate && b.dueDate >= today && b.dueDate <= in30).length} bills due`,
    },
    {
      label: 'Net Position (30d)',
      value: fmtCurrency(net30),
      icon: net30 >= 0 ? TrendingUp : AlertTriangle,
      color: net30 >= 0 ? 'success' as const : 'error' as const,
      subtitle: net30 >= 0 ? 'Positive cash flow' : 'Cash deficit risk',
    },
  ];

  // ── Actions (balance edit) ──────────────────────────────────────────────────
  const actions = editingBalance ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bank Balance (₹):</span>
      <input
        ref={inputRef}
        type="number"
        value={balanceDraft}
        onChange={e => setBalanceDraft(e.target.value)}
        onKeyDown={handleBalanceKeyDown}
        className="w-32 px-2 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-600
          rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter amount"
      />
      <button
        onClick={handleSaveBalance}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white
          rounded-lg text-xs font-semibold transition-colors"
      >
        <Check size={13} />
        Save
      </button>
      <button
        onClick={handleCancelBalance}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700
          dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
      >
        <X size={13} />
        Cancel
      </button>
    </div>
  ) : (
    <button
      onClick={handleEditBalance}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800
        dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold
        transition-colors border border-slate-200 dark:border-slate-700"
    >
      <Edit3 size={13} />
      Update Balance
    </button>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <SAPHeader
        title="Cash Flow"
        subtitle="30 · 60 · 90 Day Forecast"
        kpis={kpis}
        actions={actions}
        sticky
      />

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Section 1: Forecast Chart ─────────────────────────────────────── */}
        <div className="mx-4 mt-4 mb-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                90-Day Cash Position
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Weekly inflow/outflow bars + running balance line. Includes historical avg.
              </p>
            </div>
            {hasDangerZone && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30
                border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400">
                <AlertTriangle size={13} />
                Danger Zone Ahead
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="px-2 pb-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtShort}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<CashflowTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                {/* Zero reference line */}
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                {/* Danger zone: negative balance */}
                {hasDangerZone && (
                  <ReferenceLine
                    y={minBalance}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: `Low: ${fmtShort(minBalance)}`,
                      position: 'insideBottomRight',
                      fontSize: 10,
                      fill: '#ef4444',
                    }}
                  />
                )}
                <Bar
                  dataKey="inflow"
                  name="Expected In"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  fillOpacity={0.85}
                />
                <Bar
                  dataKey="outflow"
                  name="Expected Out"
                  fill="#ef4444"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  fillOpacity={0.85}
                />
                <Line
                  type="monotone"
                  dataKey="runningBalance"
                  name="Running Balance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#3b82f6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend note */}
          <div className="px-5 pb-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500 opacity-85" />
              Green bars include confirmed invoice inflows + historical average
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-500 opacity-85" />
              Red bars include confirmed purchase bills + historical average expenses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-1.5 rounded-full bg-blue-500" />
              Blue line = projected bank balance after each week
            </span>
          </div>
        </div>

        {/* ── Section 2: Detailed Timeline ──────────────────────────────────── */}
        <div className="mx-4 mb-4 grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Left: Expected Inflows */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <ArrowUpRight size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expected Inflows</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Unpaid invoices sorted by due date</p>
              </div>
              <div className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {fmtCurrency(enrichedInvoices.reduce((s, e) => s + e.invoice.total, 0))}
              </div>
            </div>

            {enrichedInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <FileText size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No pending invoices</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Create invoices to see expected inflows here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Due Date</th>
                      <th className="text-left px-2 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Customer</th>
                      <th className="text-left px-2 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Invoice</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Amount</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrichedInvoices.map(({ invoice, customerName, daysUntilDue }) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {invoice.dueDate ? (
                            <span className={InvoiceRowColor(daysUntilDue)}>
                              {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">No due date</span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px] block">
                            {customerName}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-mono text-slate-500 dark:text-slate-400">{invoice.number}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {fmtCurrency(invoice.total)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DueBadge days={daysUntilDue} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800">
                      <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Total Expected ({enrichedInvoices.length} invoices)
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {fmtCurrency(enrichedInvoices.reduce((s, e) => s + e.invoice.total, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Right: Expected Outflows */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <ArrowDownRight size={15} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expected Outflows</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pending purchase bills sorted by due date</p>
              </div>
              <div className="ml-auto text-xs font-bold text-red-600 dark:text-red-400">
                {fmtCurrency(enrichedBills.reduce((s, e) => s + (e.bill.total - e.bill.paidAmount), 0))}
              </div>
            </div>

            {enrichedBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Building2 size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No pending bills</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Purchase bills you owe vendors will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Due Date</th>
                      <th className="text-left px-2 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Vendor</th>
                      <th className="text-left px-2 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Bill #</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Amount</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrichedBills.map(({ bill, vendorName, daysUntilDue }) => (
                      <tr
                        key={bill.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {bill.dueDate ? (
                            <span className={BillRowColor(daysUntilDue)}>
                              {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">No due date</span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px] block">
                            {vendorName}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-mono text-slate-500 dark:text-slate-400">{bill.number}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">
                          {fmtCurrency(bill.total - bill.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DueBadge days={daysUntilDue} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800">
                      <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-red-700 dark:text-red-400">
                        Total Outstanding ({enrichedBills.length} bills)
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-black text-red-700 dark:text-red-400">
                        {fmtCurrency(enrichedBills.reduce((s, e) => s + (e.bill.total - e.bill.paidAmount), 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Info strip ────────────────────────────────────────────────────── */}
        <div className="mx-4 mb-6 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800
          rounded-xl flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            <strong>Forecast methodology:</strong> Confirmed invoice inflows and purchase bill outflows are placed in their exact due-date week.
            Historical averages from the last 30 days (total income/expense divided by 4) are added to every week to account for recurring cash flows.
            Update your opening bank balance using the "Update Balance" button to keep projections accurate.
          </span>
        </div>

      </div>
    </div>
  );
}
