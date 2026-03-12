'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate,
  getProfitAndLoss, fmtCurrency, monthRangeISO,
  type BizOSStore,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type DateRange = 'this-month' | 'last-month' | 'this-year' | 'custom';

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6',
  '#06b6d4', '#84cc16', '#fb923c', '#ec4899', '#14b8a6',
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{p.name}:</span>
          <span className="font-black text-slate-900 dark:text-white">{fmtCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export function BizReports() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [range, setRange] = useState<DateRange>('this-month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  const { from, to } = useMemo(() => {
    const now = new Date();
    if (range === 'this-month') {
      const [f, t] = monthRangeISO();
      return { from: f, to: t };
    }
    if (range === 'last-month') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const f = d.toISOString().split('T')[0];
      const t = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { from: f, to: t };
    }
    if (range === 'this-year') {
      const f = `${now.getFullYear()}-01-01`;
      const t = `${now.getFullYear()}-12-31`;
      return { from: f, to: t };
    }
    return { from: customFrom || monthRangeISO()[0], to: customTo || monthRangeISO()[1] };
  }, [range, customFrom, customTo]);

  const pl = useMemo(() => {
    if (!store) return null;
    return getProfitAndLoss(store, from, to);
  }, [store, from, to]);

  if (!store || !pl) return null;

  const expenseChartData = Object.entries(pl.expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topCustomerData = pl.topCustomers.map(c => ({ name: c.name, value: c.total }));
  const topProductData = pl.topProducts.map(p => ({ name: p.name, value: p.revenue }));

  // Cash flow forecast: pending invoices in next 30 days
  const pendingInvoices = Object.values(store.invoices).filter(
    inv => inv.status === 'sent' || inv.status === 'overdue',
  );
  const forecastTotal = pendingInvoices.reduce((s, inv) => s + inv.total, 0);

  const rangeLabel = {
    'this-month': 'This Month',
    'last-month': 'Last Month',
    'this-year': 'This Year',
    'custom': 'Custom',
  }[range];

  const isEmpty = store.transactions.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth sticky
        title="Business Reports"
        subtitle={`${rangeLabel} · ${from} → ${to}`}
        kpis={[
          { label: 'Total Income', value: fmtCurrency(pl.income), color: 'success', icon: TrendingUp },
          { label: 'Total Expenses', value: fmtCurrency(pl.expenses), color: 'error', icon: TrendingDown },
          { label: 'Net Profit', value: fmtCurrency(pl.gross), color: pl.gross >= 0 ? 'success' : 'error' },
          { label: 'Pending Collection', value: fmtCurrency(forecastTotal), color: 'warning' },
        ]}
        modes={[{
          label: 'Period',
          value: range,
          options: [
            { key: 'this-month', label: 'This Month' },
            { key: 'last-month', label: 'Last Month' },
            { key: 'this-year', label: 'This Year' },
            { key: 'custom', label: 'Custom' },
          ],
          onChange: v => setRange(v as DateRange),
        }]}
      />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">

        {/* Custom date range */}
        {range === 'custom' && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <div className="flex items-center gap-2">
              <input type="date" className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
              <span className="text-slate-400 text-sm">to</span>
              <input type="date" className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customTo} onChange={e => setCustomTo(e.target.value)} />
            </div>
          </div>
        )}

        {isEmpty ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <BarChart3 size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transaction data yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Add entries in the Daybook to see reports here.</p>
          </div>
        ) : (
          <>
            {/* P&L Hero Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Income', value: pl.income, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                { label: 'Total Expenses', value: pl.expenses, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
                { label: 'Net Profit', value: pl.gross, color: pl.gross >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400', bg: pl.gross >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
              ].map(card => (
                <div key={card.label} className={`rounded-2xl border p-6 ${card.bg}`}>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{card.label}</p>
                  <p className={`text-3xl font-black ${card.color}`}>{fmtCurrency(card.value)}</p>
                  {pl.income > 0 && card.label === 'Net Profit' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Margin: {Math.round((pl.gross / pl.income) * 100)}%
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Monthly Income vs Expense Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                Monthly Income vs Expenses (Last 12 Months)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pl.monthlyData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => v === 'income' ? 'Income' : 'Expense'} iconType="square" />
                  <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Breakdown Pie */}
              {expenseChartData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                    Expense Breakdown
                  </h2>
                  <div className="flex gap-4 items-start">
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={expenseChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                          {expenseChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5 pt-2">
                      {expenseChartData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">{d.name}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">{fmtCurrency(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Income Breakdown */}
              {Object.keys(pl.incomeByCategory).length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                    Income by Category
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(pl.incomeByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, val], i) => {
                        const pct = pl.income > 0 ? (val / pl.income) * 100 : 0;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{cat}</span>
                              <span className="font-black text-emerald-700 dark:text-emerald-400">{fmtCurrency(val)}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Top Customers */}
            {topCustomerData.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                  Top Customers by Revenue
                </h2>
                <ResponsiveContainer width="100%" height={Math.max(180, topCustomerData.length * 32)}>
                  <BarChart data={topCustomerData} layout="vertical" barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: number) => [fmtCurrency(v), 'Revenue']} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Products */}
            {topProductData.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                  Top Products by Revenue
                </h2>
                <ResponsiveContainer width="100%" height={Math.max(180, topProductData.length * 32)}>
                  <BarChart data={topProductData} layout="vertical" barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: number) => [fmtCurrency(v), 'Revenue']} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Cash Flow Forecast */}
            {pendingInvoices.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Cash Flow Forecast
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Based on {pendingInvoices.length} pending invoice{pendingInvoices.length > 1 ? 's' : ''} — expected collection
                </p>
                <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expected Incoming</p>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{fmtCurrency(forecastTotal)}</p>
                  </div>
                  <div className="space-y-1">
                    {pendingInvoices.slice(0, 4).map(inv => {
                      const party = store.parties[inv.customerId];
                      return (
                        <div key={inv.id} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{party?.name ?? 'Unknown'}</span>
                          <span className="font-black text-blue-700 dark:text-blue-400">{fmtCurrency(inv.total)}</span>
                          {inv.dueDate && <span className="text-slate-400">due {inv.dueDate}</span>}
                        </div>
                      );
                    })}
                    {pendingInvoices.length > 4 && (
                      <p className="text-xs text-slate-400">+{pendingInvoices.length - 4} more</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
