'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, ChevronDown, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, addTransaction, deleteTransaction,
  fmtCurrency, todayISO,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_MODES,
  type BizOSStore, type BizTransaction, type PaymentMode,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  type: 'income' as 'income' | 'expense',
  amount: '',
  category: '',
  description: '',
  partyId: '',
  paymentMode: 'cash' as PaymentMode,
  date: todayISO(),
  notes: '',
};

export function BizDaybook() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [showForm, setShowForm] = useState(false);
  const [partySearch, setPartySearch] = useState('');
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const partyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (partyRef.current && !partyRef.current.contains(e.target as Node)) {
        setShowPartyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!store) return null;

  const parties = Object.values(store.parties);
  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(partySearch.toLowerCase()),
  );

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description.trim() || !form.category) return;
    addTransaction({
      date: form.date,
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description.trim(),
      partyId: form.partyId || undefined,
      paymentMode: form.paymentMode,
      notes: form.notes.trim() || undefined,
    });
    setForm({ ...DEFAULT_FORM });
    setPartySearch('');
    setShowForm(false);
  }

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

  const selectedParty = form.partyId ? store.parties[form.partyId] : null;

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 dark:text-white">New Entry</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-light">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Income / Expense Toggle */}
                <div className="flex gap-2">
                  {(['income', 'expense'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                        form.type === t
                          ? t === 'income'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t === 'income' ? '↑ Income' : '↓ Expense'}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Amount (₹) *</label>
                  <input
                    type="number" min="0" step="0.01" required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description *</label>
                  <input
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={form.type === 'income' ? 'e.g. Sold 20 bags cement' : 'e.g. Paid electricity bill'}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category *</label>
                    <div className="relative">
                      <select
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      >
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Payment Mode</label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 capitalize"
                        value={form.paymentMode}
                        onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value as PaymentMode }))}
                      >
                        {PAYMENT_MODES.map(m => <option key={m} value={m} className="capitalize">{m.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Date */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>

                  {/* Party Search */}
                  <div ref={partyRef}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Party (Optional)</label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-7"
                        placeholder={selectedParty ? selectedParty.name : 'Search party...'}
                        value={selectedParty ? '' : partySearch}
                        onChange={e => {
                          setPartySearch(e.target.value);
                          setForm(f => ({ ...f, partyId: '' }));
                          setShowPartyDropdown(true);
                        }}
                        onFocus={() => setShowPartyDropdown(true)}
                      />
                      {selectedParty && (
                        <span className="absolute left-3 top-2 text-sm text-slate-900 dark:text-white font-medium truncate max-w-[calc(100%-2.5rem)]">
                          {selectedParty.name}
                        </span>
                      )}
                      <Search size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      {showPartyDropdown && filteredParties.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            onClick={() => { setForm(f => ({ ...f, partyId: '' })); setPartySearch(''); setShowPartyDropdown(false); }}
                          >
                            None
                          </button>
                          {filteredParties.map(p => (
                            <button
                              key={p.id} type="button"
                              className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                              onClick={() => { setForm(f => ({ ...f, partyId: p.id })); setPartySearch(''); setShowPartyDropdown(false); }}
                            >
                              {p.name} <span className="text-xs text-slate-400 capitalize">· {p.type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Notes (Optional)</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className={`flex-2 flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors ${
                      form.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}>
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
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
