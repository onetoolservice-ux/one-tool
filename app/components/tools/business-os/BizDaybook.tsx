'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, deleteTransaction,
  fmtCurrency, todayISO,
  type BizOSStore, type BizTransaction,
} from './biz-os-store';
import { QuickAddTransactionModal } from './QuickAddTransactionModal';

// ─────────────────────────────────────────────────────────────────────────────

export function BizDaybook() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  if (!store) return null;

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deleteTransaction(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  // Filter + sort transactions
  let txs: BizTransaction[] = [...store.transactions];
  if (filterType !== 'all') txs = txs.filter(t => t.type === filterType);
  if (filterDate) txs = txs.filter(t => t.date === filterDate);
  txs.sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));

  // Group by date
  const groups: Record<string, BizTransaction[]> = {};
  txs.forEach(tx => {
    groups[tx.date] = groups[tx.date] ?? [];
    groups[tx.date].push(tx);
  });
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  // Today's KPIs
  const today = todayISO();
  const todayIncome = store.transactions.filter(t => t.date === today && t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const todayExpense = store.transactions.filter(t => t.date === today && t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth sticky
        title="Daybook"
        subtitle="Daily income and expense log"
        kpis={[
          { label: "Today's Income", value: fmtCurrency(todayIncome), color: 'success', icon: TrendingUp },
          { label: "Today's Expense", value: fmtCurrency(todayExpense), color: 'error', icon: TrendingDown },
          { label: "Today's Net", value: fmtCurrency(todayIncome - todayExpense), color: todayIncome - todayExpense >= 0 ? 'success' : 'error' },
          { label: 'Total Entries', value: store.transactions.length, color: 'neutral' },
        ]}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            <Plus size={16} /> Add Entry
          </button>
        }
      />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">

        {/* Add Entry Modal */}
        {showForm && (
          <QuickAddTransactionModal store={store} onClose={() => setShowForm(false)} />
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filterType === t
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="date"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold">
              Clear date
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{txs.length} entries</span>
        </div>

        {/* Transactions grouped by date */}
        {sortedDates.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-3">No entries found</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <Plus size={15} /> Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => {
              const dayTxs = groups[date];
              const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
              const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
              const isToday = date === today;
              return (
                <div key={date} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Day Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {isToday ? 'Today' : new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {isToday && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Today</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      {dayIncome > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{fmtCurrency(dayIncome)}</span>}
                      {dayExpense > 0 && <span className="text-rose-600 dark:text-rose-400">-{fmtCurrency(dayExpense)}</span>}
                    </div>
                  </div>
                  {/* Day Transactions */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dayTxs.map(tx => {
                      const party = tx.partyId ? store.parties[tx.partyId] : null;
                      return (
                        <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : 'bg-rose-100 dark:bg-rose-900/30'
                          }`}>
                            {tx.type === 'income'
                              ? <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
                              : <TrendingDown size={15} className="text-rose-600 dark:text-rose-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tx.description}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {tx.category} · {tx.paymentMode.toUpperCase()}{party ? ` · ${party.name}` : ''}
                              {tx.notes ? ` · ${tx.notes}` : ''}
                            </p>
                          </div>
                          <span className={`text-sm font-black shrink-0 ${
                            tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{fmtCurrency(tx.amount)}
                          </span>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className={`shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                              deleteConfirm === tx.id
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 opacity-100'
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={deleteConfirm === tx.id ? 'Click again to confirm delete' : 'Delete'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
