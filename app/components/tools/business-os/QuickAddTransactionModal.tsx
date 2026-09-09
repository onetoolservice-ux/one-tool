'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import {
  addTransaction, todayISO,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_MODES,
  type BizOSStore, type PaymentMode,
} from './biz-os-store';

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

// Shared "add transaction" form — used by the Daybook page and the Dashboard
// quick-add button so logging a sale never requires leaving the home screen.
export function QuickAddTransactionModal({ store, onClose }: { store: BizOSStore; onClose: () => void }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [partySearch, setPartySearch] = useState('');
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const partyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (partyRef.current && !partyRef.current.contains(e.target as Node)) {
        setShowPartyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const parties = Object.values(store.parties);
  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(partySearch.toLowerCase()),
  );
  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedParty = form.partyId ? store.parties[form.partyId] : null;

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
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white">New Entry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-light">×</button>
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
            <button type="button" onClick={onClose}
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
  );
}
