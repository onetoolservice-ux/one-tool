'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, TrendingUp, TrendingDown, Users, Phone, Mail, X } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate,
  addParty, updateParty, deleteParty, addTransaction,
  getPartyBalance, fmtCurrency, todayISO,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_MODES,
  type BizOSStore, type BizParty, type PaymentMode,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

const PARTY_TABS = ['all', 'customer', 'vendor', 'employee', 'other'] as const;
type PartyTab = typeof PARTY_TABS[number];

const EMPTY_PARTY: Omit<BizParty, 'id' | 'createdAt'> = {
  name: '',
  type: 'customer',
  phone: '',
  email: '',
  address: '',
  gstin: '',
  notes: '',
};

const EMPTY_TX = {
  type: 'income' as 'income' | 'expense',
  amount: '',
  category: 'Sales',
  description: '',
  paymentMode: 'cash' as PaymentMode,
  date: todayISO(),
};

export function BizParties() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [tab, setTab] = useState<PartyTab>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editParty, setEditParty] = useState<BizParty | null>(null);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [showTxForm, setShowTxForm] = useState(false);
  const [txForm, setTxForm] = useState({ ...EMPTY_TX });
  const [form, setForm] = useState({ ...EMPTY_PARTY });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  if (!store) return null;

  const allParties = Object.values(store.parties);
  const filtered = allParties.filter(p => {
    const matchTab = tab === 'all' || p.type === tab;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone ?? '').includes(search);
    return matchTab && matchSearch;
  });

  // KPIs
  const totalReceivable = allParties.reduce((sum, p) => {
    const bal = getPartyBalance(p.id, store.transactions, store.invoices);
    return sum + (bal > 0 ? bal : 0);
  }, 0);
  const totalPayable = allParties.reduce((sum, p) => {
    const bal = getPartyBalance(p.id, store.transactions, store.invoices);
    return sum + (bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  const selectedParty = selectedPartyId ? store.parties[selectedPartyId] : null;
  const partyBalance = selectedParty
    ? getPartyBalance(selectedParty.id, store.transactions, store.invoices)
    : 0;
  const partyTxs = selectedParty
    ? store.transactions.filter(t => t.partyId === selectedParty.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const partyInvoices = selectedParty
    ? Object.values(store.invoices).filter(inv => inv.customerId === selectedParty.id)
    : [];

  function handleAddParty(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editParty) {
      updateParty(editParty.id, {
        name: form.name.trim(),
        type: form.type,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        gstin: form.gstin?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
    } else {
      addParty({
        name: form.name.trim(),
        type: form.type,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        gstin: form.gstin?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
    }
    setForm({ ...EMPTY_PARTY });
    setEditParty(null);
    setShowAdd(false);
  }

  function openEdit(p: BizParty) {
    setEditParty(p);
    setForm({ name: p.name, type: p.type, phone: p.phone ?? '', email: p.email ?? '', address: p.address ?? '', gstin: p.gstin ?? '', notes: p.notes ?? '' });
    setShowAdd(true);
  }

  function handleDeleteParty(id: string) {
    if (deleteConfirm === id) {
      if (selectedPartyId === id) setSelectedPartyId(null);
      deleteParty(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function handleAddTx(e: React.FormEvent) {
    e.preventDefault();
    if (!txForm.amount || !selectedPartyId) return;
    addTransaction({
      date: txForm.date,
      type: txForm.type,
      amount: parseFloat(txForm.amount),
      partyId: selectedPartyId,
      category: txForm.category,
      description: txForm.description.trim() || `${txForm.type === 'income' ? 'Received from' : 'Paid to'} ${selectedParty?.name}`,
      paymentMode: txForm.paymentMode,
    });
    setTxForm({ ...EMPTY_TX });
    setShowTxForm(false);
  }

  const typeBadgeColor = (type: BizParty['type']) => ({
    customer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    vendor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    employee: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }[type]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth sticky
        title="Party Register"
        subtitle="Customers · Vendors · Employees — Khata-style ledger"
        kpis={[
          { label: 'Total Parties', value: allParties.length, color: 'neutral', icon: Users },
          { label: 'Receivable', value: fmtCurrency(totalReceivable), color: 'success', icon: TrendingUp, subtitle: 'they owe you' },
          { label: 'Payable', value: fmtCurrency(totalPayable), color: 'error', icon: TrendingDown, subtitle: 'you owe them' },
          { label: 'Customers', value: allParties.filter(p => p.type === 'customer').length, color: 'primary' },
        ]}
        actions={
          <button
            onClick={() => { setForm({ ...EMPTY_PARTY }); setEditParty(null); setShowAdd(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            <Plus size={16} /> Add Party
          </button>
        }
      />

      {/* Add/Edit Party Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">{editParty ? 'Edit Party' : 'New Party'}</h2>
              <button onClick={() => { setShowAdd(false); setEditParty(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-light">×</button>
            </div>
            <form onSubmit={handleAddParty} className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Name *</label>
                <input required className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sharma Builders" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Type *</label>
                <div className="flex gap-2">
                  {(['customer', 'vendor', 'employee', 'other'] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs capitalize transition-colors ${form.type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone</label>
                  <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="name@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">GSTIN</label>
                <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="27AAPFU0939F1Z..." value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Address</label>
                <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Notes</label>
                <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAdd(false); setEditParty(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                  {editParty ? 'Save Changes' : 'Add Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-180px)]">
        {/* Party List */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          {/* Search + Tabs */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search parties..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {PARTY_TABS.map(t => (
                <button key={t}
                  onClick={() => setTab(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                    tab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Party items */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">No parties found</p>
                <button onClick={() => { setForm({ ...EMPTY_PARTY }); setEditParty(null); setShowAdd(true); }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  Add one →
                </button>
              </div>
            ) : (
              filtered.map(p => {
                const bal = getPartyBalance(p.id, store.transactions, store.invoices);
                const isSelected = selectedPartyId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartyId(isSelected ? null : p.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${typeBadgeColor(p.type)}`}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <span className={`capitalize px-1.5 py-0.5 rounded font-semibold ${typeBadgeColor(p.type)} text-[10px]`}>{p.type}</span>
                        {p.phone && <span className="truncate">{p.phone}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-black ${bal > 0 ? 'text-emerald-600 dark:text-emerald-400' : bal < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {bal === 0 ? '—' : `${bal > 0 ? '+' : ''}${fmtCurrency(bal)}`}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {bal > 0 ? 'owes you' : bal < 0 ? 'you owe' : 'settled'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Party Detail */}
        <div className="flex-1 overflow-y-auto">
          {!selectedParty ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Users size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-500 dark:text-slate-400">Select a party to view their ledger</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">All transactions, invoices, and balance in one place</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Party Header */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${typeBadgeColor(selectedParty.type)}`}>
                      {selectedParty.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedParty.name}</h2>
                      <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${typeBadgeColor(selectedParty.type)}`}>
                        {selectedParty.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(selectedParty)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteParty(selectedParty.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        deleteConfirm === selectedParty.id
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                      }`}
                    >
                      {deleteConfirm === selectedParty.id ? 'Confirm Delete' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Balance Banner */}
                <div className={`rounded-xl p-4 flex items-center justify-between ${
                  partyBalance > 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : partyBalance < 0
                    ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Running Balance</p>
                    <p className={`text-2xl font-black ${partyBalance > 0 ? 'text-emerald-700 dark:text-emerald-400' : partyBalance < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {fmtCurrency(Math.abs(partyBalance))}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {partyBalance > 0 ? `${selectedParty.name} owes you` : partyBalance < 0 ? `You owe ${selectedParty.name}` : 'All settled'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setTxForm({ ...EMPTY_TX, category: selectedParty.type === 'vendor' ? 'Purchase' : 'Sales', description: '' }); setShowTxForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    <Plus size={15} /> Add Transaction
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedParty.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg font-medium">
                      <Phone size={12} /> {selectedParty.phone}
                    </span>
                  )}
                  {selectedParty.email && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg font-medium">
                      <Mail size={12} /> {selectedParty.email}
                    </span>
                  )}
                  {selectedParty.gstin && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg font-mono">
                      GST: {selectedParty.gstin}
                    </span>
                  )}
                </div>
                {selectedParty.notes && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">{selectedParty.notes}</p>
                )}
              </div>

              {/* Add Tx Form */}
              {showTxForm && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Add Transaction</h3>
                    <button onClick={() => setShowTxForm(false)}><X size={16} className="text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleAddTx} className="space-y-3">
                    <div className="flex gap-2">
                      {(['income', 'expense'] as const).map(t => (
                        <button key={t} type="button"
                          onClick={() => setTxForm(f => ({ ...f, type: t, category: t === 'income' ? 'Sales' : 'Purchase' }))}
                          className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${txForm.type === t ? (t === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {t === 'income' ? '↑ Income' : '↓ Expense'}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Amount (₹) *</label>
                        <input required type="number" min="0" step="0.01"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                        <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                      <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What is this for?" value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                        <div className="relative">
                          <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                            value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))}>
                            {(txForm.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Payment Mode</label>
                        <div className="relative">
                          <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                            value={txForm.paymentMode} onChange={e => setTxForm(f => ({ ...f, paymentMode: e.target.value as PaymentMode }))}>
                            {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                          </select>
                          <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowTxForm(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold">Cancel</button>
                      <button type="submit"
                        className={`flex-1 py-2 rounded-xl text-white text-sm font-bold ${txForm.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Party Transactions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Transaction History ({partyTxs.length})
                  </h3>
                </div>
                {partyTxs.length === 0 && partyInvoices.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {partyTxs.map(tx => (
                      <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tx.description}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{tx.date} · {tx.category} · {tx.paymentMode.toUpperCase()}</p>
                        </div>
                        <span className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmtCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                    {partyInvoices.map(inv => (
                      <div key={inv.id} className="flex items-center gap-3 px-5 py-3 bg-amber-50/50 dark:bg-amber-900/10">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-amber-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Invoice {inv.number}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{inv.date} · {inv.status}</p>
                        </div>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">{fmtCurrency(inv.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
