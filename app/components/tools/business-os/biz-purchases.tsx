'use client';

import { useEffect, useState, useRef } from 'react';
import {
  ShoppingBag, Plus, Trash2, Edit2, CheckCircle, X, Search,
  ArrowUpDown, Filter,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, fmtCurrency, todayISO,
  addPurchaseBill, updatePurchaseBill, deletePurchaseBill, markPurchasePaid,
  getPurchaseBills, GST_RATES,
  type BizOSStore, type BizPurchaseBill, type BizPurchaseItem,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'bills' | 'new';
type FilterStatus = 'all' | 'pending' | 'paid' | 'partial';
type SortKey = 'date' | 'amount' | 'vendor';

const STATUS_CONFIG: Record<BizPurchaseBill['status'], { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  paid:    { label: 'Paid',    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  partial: { label: 'Partial', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const EMPTY_ITEM: BizPurchaseItem = { name: '', qty: 1, rate: 0, gstRate: 18, amount: 0 };

function calcItem(item: BizPurchaseItem): BizPurchaseItem {
  const base = item.qty * item.rate;
  const gst = (base * item.gstRate) / 100;
  return { ...item, amount: base + gst };
}

// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  number: string;
  vendorId: string;
  vendorSearch: string;
  date: string;
  dueDate: string;
  notes: string;
  items: BizPurchaseItem[];
}

function emptyForm(): FormState {
  return {
    number: '',
    vendorId: '',
    vendorSearch: '',
    date: todayISO(),
    dueDate: '',
    notes: '',
    items: [{ ...EMPTY_ITEM }],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function BizPurchases() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('bills');
  const [editingId, setEditingId] = useState<string | null>(null);

  // List state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [itemDropdowns, setItemDropdowns] = useState<Record<number, boolean>>({});
  const [itemSearches, setItemSearches] = useState<Record<number, string>>({});
  const vendorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  if (!store) return null;

  // ── Derived data ─────────────────────────────────────────────────────────

  const purchases = getPurchaseBills(store);
  const allBills = Object.values(purchases).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const vendors = Object.values(store.parties).filter(p => p.type === 'vendor');
  const allProducts = Object.values(store.products);

  // KPI calculations
  const thisMonth = todayISO().slice(0, 7);

  const totalPayable = allBills
    .filter(b => b.status !== 'paid')
    .reduce((s, b) => s + (b.total - b.paidAmount), 0);

  const billsThisMonth = allBills.filter(b => b.date.startsWith(thisMonth)).length;

  const itcThisMonth = allBills
    .filter(b => b.date.startsWith(thisMonth))
    .reduce((s, b) => s + b.gstAmount, 0);

  const paidThisMonth = allBills
    .filter(b => b.status === 'paid' && b.date.startsWith(thisMonth))
    .reduce((s, b) => s + b.paidAmount, 0);

  // ── Filtered & sorted bills ───────────────────────────────────────────────

  const filtered = allBills
    .filter(b => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      if (search) {
        const vendor = store.parties[b.vendorId];
        const q = search.toLowerCase();
        if (
          !b.number.toLowerCase().includes(q) &&
          !(vendor?.name.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'date') return b.date.localeCompare(a.date);
      if (sortKey === 'amount') return b.total - a.total;
      if (sortKey === 'vendor') {
        const vA = store.parties[a.vendorId]?.name ?? '';
        const vB = store.parties[b.vendorId]?.name ?? '';
        return vA.localeCompare(vB);
      }
      return 0;
    });

  // ── Form computed totals ──────────────────────────────────────────────────

  const computedItems = form.items.map(calcItem);
  const formSubtotal = computedItems.reduce((s, it) => s + it.qty * it.rate, 0);
  const formGst = computedItems.reduce((s, it) => s + (it.qty * it.rate * it.gstRate) / 100, 0);
  const formTotal = formSubtotal + formGst;

  // ── Form helpers ──────────────────────────────────────────────────────────

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setShowVendorDropdown(false);
    setItemDropdowns({});
    setItemSearches({});
  }

  function startNew() {
    resetForm();
    setMode('new');
  }

  function startEdit(bill: BizPurchaseBill) {
    const vendor = store!.parties[bill.vendorId];
    setForm({
      number: bill.number,
      vendorId: bill.vendorId,
      vendorSearch: vendor?.name ?? '',
      date: bill.date,
      dueDate: bill.dueDate ?? '',
      notes: bill.notes ?? '',
      items: bill.items.map(it => ({ ...it })),
    });
    setEditingId(bill.id);
    setMode('new');
  }

  function cancelForm() {
    resetForm();
    setMode('bills');
  }

  function updateItem(i: number, updates: Partial<BizPurchaseItem>) {
    setForm(f => ({
      ...f,
      items: f.items.map((it, idx) => (idx === i ? { ...it, ...updates } : it)),
    }));
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(i: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  function getItemMatches(i: number) {
    const q = (itemSearches[i] ?? '').toLowerCase();
    if (!q) return allProducts.slice(0, 8);
    return allProducts
      .filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
      .slice(0, 8);
  }

  function selectProduct(i: number, productId: string) {
    const p = store!.products[productId];
    if (!p) return;
    updateItem(i, { name: p.name, rate: p.costPrice, gstRate: p.gstRate, productId: p.id });
    setItemSearches(s => { const n = { ...s }; delete n[i]; return n; });
    setItemDropdowns(d => ({ ...d, [i]: false }));
  }

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(form.vendorSearch.toLowerCase()),
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vendorId || form.items.length === 0) return;

    const finalItems = form.items.map(calcItem);
    const sub = finalItems.reduce((s, it) => s + it.qty * it.rate, 0);
    const gst = finalItems.reduce((s, it) => s + (it.qty * it.rate * it.gstRate) / 100, 0);
    const total = sub + gst;

    const payload = {
      number: form.number.trim(),
      date: form.date,
      dueDate: form.dueDate || undefined,
      vendorId: form.vendorId,
      items: finalItems,
      subtotal: sub,
      gstAmount: gst,
      total,
      paidAmount: editingId ? (purchases[editingId]?.paidAmount ?? 0) : 0,
      status: (editingId ? purchases[editingId]?.status : 'pending') as BizPurchaseBill['status'],
      notes: form.notes.trim() || undefined,
    };

    if (editingId) {
      updatePurchaseBill(editingId, payload);
    } else {
      addPurchaseBill(payload);
    }

    resetForm();
    setMode('bills');
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deletePurchaseBill(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  // ── Tab label ─────────────────────────────────────────────────────────────

  const tabLabel = mode === 'new' && editingId ? 'Edit Bill' : 'New Bill';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* ── Header ── */}
      <SAPHeader
        fullWidth
        sticky
        title="Purchase Bills"
        subtitle="Vendor Invoices · ITC · Payables"
        kpis={[
          { label: 'Total Payable', value: fmtCurrency(totalPayable), color: 'error' },
          { label: 'Bills This Month', value: String(billsThisMonth), color: 'neutral' },
          { label: 'ITC This Month', value: fmtCurrency(itcThisMonth), color: 'success' },
          { label: 'Paid This Month', value: fmtCurrency(paidThisMonth), color: 'primary' },
        ]}
        modes={[
          {
            label: 'View',
            options: [
              { key: 'bills', label: 'Bills' },
              { key: 'new', label: mode === 'new' ? tabLabel : 'New Bill' },
            ],
            value: mode,
            onChange: v => {
              if (v === 'new') startNew();
              else { cancelForm(); }
            },
          },
        ]}
        actions={
          mode === 'bills' ? (
            <button
              onClick={startNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <Plus size={16} /> New Bill
            </button>
          ) : null
        }
      />

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ═══════════ BILLS LIST MODE ═══════════ */}
        {mode === 'bills' && (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search bill # or vendor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <Filter size={12} className="text-slate-400 ml-1" />
                {(['all', 'pending', 'paid', 'partial'] as FilterStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                      filterStatus === s
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <ArrowUpDown size={12} className="text-slate-400 ml-1" />
                {([
                  { key: 'date', label: 'Date' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'vendor', label: 'Vendor' },
                ] as { key: SortKey; label: string }[]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortKey(opt.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      sortKey === opt.key
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <ShoppingBag size={48} className="text-slate-300 dark:text-slate-600" />
                  <p className="text-base font-bold text-slate-400 dark:text-slate-500">No purchase bills found</p>
                  <p className="text-sm text-slate-400 dark:text-slate-600">
                    {search || filterStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Record your first vendor bill to get started'}
                  </p>
                  {!search && filterStatus === 'all' && (
                    <button
                      onClick={startNew}
                      className="mt-1 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <Plus size={15} /> Add First Bill
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      {[
                        'Bill #', 'Date', 'Due Date', 'Vendor', 'Items',
                        'Subtotal', 'GST', 'Total', 'Paid', 'Balance', 'Status', 'Actions',
                      ].map(col => (
                        <th
                          key={col}
                          className="text-left px-3 py-2.5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map(bill => {
                      const vendor = store.parties[bill.vendorId];
                      const balance = bill.total - bill.paidAmount;
                      const st = STATUS_CONFIG[bill.status];
                      return (
                        <tr
                          key={bill.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="px-3 py-2.5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {bill.number || <span className="text-slate-400 italic font-normal">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{bill.date}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {bill.dueDate || <span className="text-slate-300 dark:text-slate-600">—</span>}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                            {vendor?.name ?? <span className="text-slate-400 italic">Unknown</span>}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                              {bill.items.length}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                            {fmtCurrency(bill.subtotal)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {fmtCurrency(bill.gstAmount)}
                          </td>
                          <td className="px-3 py-2.5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {fmtCurrency(bill.total)}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                            {fmtCurrency(bill.paidAmount)}
                          </td>
                          <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                            <span className={balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              {fmtCurrency(balance)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${st.badge}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(bill)}
                                title="Edit"
                                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>

                              {/* Mark Paid */}
                              {(bill.status === 'pending' || bill.status === 'partial') && (
                                <button
                                  onClick={() => markPurchasePaid(bill.id)}
                                  title="Mark as Paid"
                                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(bill.id)}
                                title={deleteConfirm === bill.id ? 'Confirm delete' : 'Delete'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  deleteConfirm === bill.id
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                                }`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ NEW / EDIT BILL MODE ═══════════ */}
        {mode === 'new' && (
          <div className="flex-1 overflow-auto">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Left Column ── */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                    <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Bill Details
                    </h2>

                    {/* Bill Number */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Bill Number
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. VEN-2024-001"
                        value={form.number}
                        onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                      />
                    </div>

                    {/* Vendor Typeahead */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Vendor <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={vendorInputRef}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search vendor..."
                          value={form.vendorId
                            ? (store.parties[form.vendorId]?.name ?? form.vendorSearch)
                            : form.vendorSearch}
                          onChange={e => {
                            setForm(f => ({ ...f, vendorSearch: e.target.value, vendorId: '' }));
                            setShowVendorDropdown(true);
                          }}
                          onFocus={() => setShowVendorDropdown(true)}
                          onBlur={() => setTimeout(() => setShowVendorDropdown(false), 150)}
                          autoComplete="off"
                        />
                        {form.vendorId && (
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, vendorId: '', vendorSearch: '' }))}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X size={14} />
                          </button>
                        )}
                        {showVendorDropdown && filteredVendors.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                            {filteredVendors.map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onMouseDown={e => {
                                  e.preventDefault();
                                  setForm(f => ({ ...f, vendorId: v.id, vendorSearch: v.name }));
                                  setShowVendorDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2.5 text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between gap-2"
                              >
                                <span className="font-medium truncate">{v.name}</span>
                                {v.gstin && (
                                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
                                    {v.gstin}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        {showVendorDropdown && filteredVendors.length === 0 && form.vendorSearch.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500">
                            No vendors found. Add one in Party Register.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Bill Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={form.date}
                          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Due Date <span className="text-slate-400 normal-case font-normal">(optional)</span>
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={form.dueDate}
                          onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Notes <span className="text-slate-400 normal-case font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Payment terms, reference, remarks..."
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Right Column ── */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                    {/* Items header */}
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Line Items <span className="text-red-500">*</span>
                      </h2>
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Plus size={13} /> Add Row
                      </button>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-1 px-1 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span className="col-span-4">Item Name</span>
                      <span className="col-span-2 text-right">Qty</span>
                      <span className="col-span-2 text-right">Rate (₹)</span>
                      <span className="col-span-2 text-right">GST %</span>
                      <span className="col-span-1 text-right">Amt</span>
                      <span className="col-span-1" />
                    </div>

                    {/* Item rows */}
                    <div className="space-y-2">
                      {form.items.map((item, i) => {
                        const computed = calcItem(item);
                        const matches = getItemMatches(i);
                        const showDrop = itemDropdowns[i] && matches.length > 0;
                        return (
                          <div key={i} className="grid grid-cols-12 gap-1 items-center">
                            {/* Name with product autocomplete */}
                            <div className="col-span-4 relative">
                              <input
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Item name"
                                value={item.productId ? item.name : (itemSearches[i] ?? item.name)}
                                onChange={e => {
                                  setItemSearches(s => ({ ...s, [i]: e.target.value }));
                                  updateItem(i, { name: e.target.value, productId: undefined });
                                  setItemDropdowns(d => ({ ...d, [i]: true }));
                                }}
                                onFocus={() => setItemDropdowns(d => ({ ...d, [i]: true }))}
                                onBlur={() => setTimeout(() => setItemDropdowns(d => ({ ...d, [i]: false })), 150)}
                              />
                              {showDrop && (
                                <div className="absolute top-full left-0 right-0 mt-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-36 overflow-y-auto">
                                  {matches.map(p => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onMouseDown={e => { e.preventDefault(); selectProduct(i, p.id); }}
                                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between gap-2"
                                    >
                                      <span className="font-medium truncate">{p.name}</span>
                                      <span className="text-slate-400 dark:text-slate-500 shrink-0">
                                        ₹{p.costPrice}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Qty */}
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              className="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.qty}
                              onChange={e => updateItem(i, { qty: parseFloat(e.target.value) || 1 })}
                            />

                            {/* Rate */}
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                              value={item.rate || ''}
                              onChange={e => updateItem(i, { rate: parseFloat(e.target.value) || 0 })}
                            />

                            {/* GST rate */}
                            <select
                              className="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none text-right"
                              value={item.gstRate}
                              onChange={e => updateItem(i, { gstRate: parseInt(e.target.value) })}
                            >
                              {GST_RATES.map(r => (
                                <option key={r} value={r}>{r}%</option>
                              ))}
                            </select>

                            {/* Amount */}
                            <span className="col-span-1 text-xs font-bold text-slate-700 dark:text-slate-200 text-right tabular-nums">
                              {fmtCurrency(computed.amount)}
                            </span>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => removeItem(i)}
                              disabled={form.items.length === 1}
                              className="col-span-1 flex justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add row button (secondary) */}
                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Plus size={13} /> Add Row
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-bold tabular-nums">{fmtCurrency(formSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>GST (ITC)</span>
                      <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {fmtCurrency(formGst)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                      <span>Total Payable</span>
                      <span className="tabular-nums">{fmtCurrency(formTotal)}</span>
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!form.vendorId || form.items.length === 0 || form.items.every(it => !it.name)}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                    >
                      {editingId ? 'Update Bill' : 'Save Bill'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
