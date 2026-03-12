'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock, Users, Package,
  ArrowRight, Plus, Settings, LayoutDashboard,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, getDashboardKPIs, getLast7DaysData,
  fmtCurrency, updateSettings, type BizOSStore,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

export function BizDashboard() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [bizName, setBizName] = useState('');
  const [gstin, setGstin] = useState('');

  useEffect(() => {
    const load = () => {
      const s = loadBizStore();
      setStore(s);
      setBizName(s.settings.businessName);
      setGstin(s.settings.gstin ?? '');
      if (!s.settings.businessName) setShowSetup(true);
    };
    load();
    return onBizStoreUpdate(load);
  }, []);

  if (!store) return null;

  const kpis = getDashboardKPIs(store);
  const chartData = getLast7DaysData(store.transactions);
  const parties = Object.values(store.parties);
  const products = Object.values(store.products);
  const lowStockItems = products.filter(p => p.lowStockAlert > 0 && p.stock <= p.lowStockAlert);
  const recentTxs = [...store.transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  const pendingInvoices = Object.values(store.invoices).filter(
    inv => inv.status === 'sent' || inv.status === 'draft' || inv.status === 'overdue',
  );

  // Top 5 customers by total income transactions
  const customerRevenue: Record<string, number> = {};
  store.transactions.forEach(tx => {
    if (tx.type === 'income' && tx.partyId) {
      customerRevenue[tx.partyId] = (customerRevenue[tx.partyId] ?? 0) + tx.amount;
    }
  });
  const topCustomers = Object.entries(customerRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, total]) => ({ party: store.parties[id], total }))
    .filter(x => x.party);

  const isEmpty = store.transactions.length === 0 && Object.keys(store.parties).length === 0;

  function saveSetup() {
    updateSettings({ businessName: bizName.trim(), gstin: gstin.trim() || undefined });
    setShowSetup(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <LayoutDashboard size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Set Up Your Business</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Takes 10 seconds. You can change this later.</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Business Name *
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sharma Hardware Store"
                  value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 27AAPFU0939F1Z..."
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={saveSetup}
              disabled={!bizName.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm transition-colors"
            >
              Start Using Business OS →
            </button>
          </div>
        </div>
      )}

      <SAPHeader
        fullWidth
        sticky
        title={store.settings.businessName || 'Business Dashboard'}
        subtitle={store.settings.gstin ? `GSTIN: ${store.settings.gstin}` : 'Your Business Command Center'}
        kpis={[
          { label: "Today's Sales", value: fmtCurrency(kpis.todaySales), color: 'success', icon: TrendingUp },
          { label: "Today's Expenses", value: fmtCurrency(kpis.todayExpenses), color: 'error', icon: TrendingDown },
          { label: "Today's Net", value: fmtCurrency(kpis.todayNet), color: kpis.todayNet >= 0 ? 'success' : 'error' },
          { label: 'Month Sales', value: fmtCurrency(kpis.monthSales), color: 'primary' },
          { label: 'Pending', value: fmtCurrency(kpis.pendingAmount), color: 'warning', icon: Clock },
          { label: 'Low Stock', value: kpis.lowStockCount, color: kpis.lowStockCount > 0 ? 'error' : 'neutral', icon: AlertTriangle },
        ]}
        actions={
          <button
            onClick={() => setShowSetup(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Business Settings"
          >
            <Settings size={16} />
          </button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

        {/* Empty State */}
        {isEmpty && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Your Business Dashboard is Ready</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start by adding your first transaction in the Daybook, or add your customers in the Party Register.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/tools/business-os/biz-daybook" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
                <Plus size={16} /> Add Transaction
              </a>
              <a href="/tools/business-os/biz-parties" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
                <Users size={16} /> Add Customer
              </a>
            </div>
          </div>
        )}

        {/* Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low on stock
              </span>
              <a href="/tools/business-os/biz-inventory" className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1">
                Manage Inventory <ArrowRight size={12} />
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 6).map(p => (
                <span key={p.id} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-lg font-semibold">
                  {p.name} — {p.stock} {p.unit} left
                </span>
              ))}
              {lowStockItems.length > 6 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-2 py-1">
                  +{lowStockItems.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* 7-Day Chart */}
        {store.transactions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
              Last 7 Days — Income vs Expenses
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip
                  formatter={(value: number, name: string) => [fmtCurrency(value), name === 'income' ? 'Income' : 'Expense']}
                  contentStyle={{ borderRadius: 10, fontSize: 12 }}
                />
                <Legend formatter={v => v === 'income' ? 'Income' : 'Expense'} iconType="square" />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Top Customers
              </h2>
              <a href="/tools/business-os/biz-parties" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </a>
            </div>
            {topCustomers.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No income transactions yet</p>
            ) : (
              <div className="space-y-2">
                {topCustomers.map(({ party, total }, i) => (
                  <div key={party.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-xs font-black text-slate-400 w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{party.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{party.type}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{fmtCurrency(total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invoices */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} /> Pending Invoices
              </h2>
              <a href="/tools/business-os/biz-invoices" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </a>
            </div>
            {pendingInvoices.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No pending invoices</p>
            ) : (
              <div className="space-y-2">
                {pendingInvoices.slice(0, 5).map(inv => {
                  const customer = store.parties[inv.customerId];
                  const isOverdue = inv.status === 'overdue' ||
                    (inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status === 'sent');
                  return (
                    <div key={inv.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{inv.number}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{customer?.name ?? 'Unknown'}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {isOverdue ? 'Overdue' : inv.status}
                      </span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">{fmtCurrency(inv.total)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        {recentTxs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Recent Transactions
              </h2>
              <a href="/tools/business-os/biz-daybook" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Open Daybook <ArrowRight size={12} />
              </a>
            </div>
            <div className="space-y-1">
              {recentTxs.map(tx => {
                const party = tx.partyId ? store.parties[tx.partyId] : null;
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {tx.date} · {tx.category}{party ? ` · ${party.name}` : ''}
                      </p>
                    </div>
                    <span className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmtCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/tools/business-os/biz-daybook', icon: <Plus size={20} />, label: 'Add Entry', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
            { href: '/tools/business-os/biz-parties', icon: <Users size={20} />, label: `Parties (${Object.keys(store.parties).length})`, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
            { href: '/tools/business-os/biz-inventory', icon: <Package size={20} />, label: `Products (${Object.keys(store.products).length})`, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
            { href: '/tools/business-os/biz-invoices', icon: <Clock size={20} />, label: `Invoices (${Object.keys(store.invoices).length})`, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
            { href: '/tools/business-os/biz-reports', icon: <TrendingUp size={20} />, label: 'Reports', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
            { href: '/tools/business-os/biz-daybook', icon: <TrendingDown size={20} />, label: 'Month Net', color: kpis.monthNet >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
          ].map(item => (
            <a key={item.href + item.label} href={item.href}
              className={`${item.color} rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:opacity-80 transition-opacity`}>
              {item.icon}
              <span className="text-xs font-bold leading-tight">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
