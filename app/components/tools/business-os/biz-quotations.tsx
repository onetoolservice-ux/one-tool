'use client';

import { useEffect, useState } from 'react';
import {
  FileText, Plus, Trash2, Edit2, ThumbsUp, ThumbsDown,
  Search, CheckCircle, TrendingUp, List,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, fmtCurrency, todayISO,
  addQuotation, updateQuotation, deleteQuotation, convertQuoteToInvoice,
  getQuotations, GST_RATES,
  type BizOSStore, type BizQuotation, type BizInvoiceItem,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'quotes' | 'new';
type FilterKey = 'all' | 'open' | 'accepted' | 'rejected' | 'expired' | 'converted';

const EMPTY_ITEM: BizInvoiceItem = { name: '', qty: 1, rate: 0, gstRate: 18, amount: 0 };

function calcItem(item: BizInvoiceItem): BizInvoiceItem {
  const base = item.qty * item.rate;
  const gst = (base * item.gstRate) / 100;
  return { ...item, amount: base + gst };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

type QuoteStatus = BizQuotation['status'];

interface StatusConfig {
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<QuoteStatus, StatusConfig> = {
  draft:     { label: 'Draft',          color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  sent:      { label: 'Sent',           color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  accepted:  { label: 'Accepted',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected:  { label: 'Rejected',       color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  expired:   { label: 'Expired',        color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
  converted: { label: 'Invoice Created', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

function isEffectivelyExpired(q: BizQuotation, today: string): boolean {
  return (q.status === 'draft' || q.status === 'sent') && q.validTill < today;
}

export function BizQuotations() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('quotes');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDate, setFormDate] = useState(todayISO());
  const [formValidTill, setFormValidTill] = useState(addDays(todayISO(), 15));
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<BizInvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [itemDropdowns, setItemDropdowns] = useState<Record<number, boolean>>({});
  const [itemSearches, setItemSearches] = useState<Record<number, string>>({});

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  if (!store) return null;

  const today = todayISO();
  const quotations = Object.values(getQuotations(store)).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
  const customers = Object.values(store.parties).filter(
    p => p.type === 'customer' || p.type === 'other',
  );
  const allProducts = Object.values(store.products);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalCount = quotations.length;

  const openQuotes = quotations.filter(q =>
    (q.status === 'draft' || q.status === 'sent' || q.status === 'accepted') &&
    !isEffectivelyExpired(q, today),
  );

  const wonCount = quotations.filter(
    q => q.status === 'accepted' || q.status === 'converted',
  ).length;
  const lostCount = quotations.filter(q => q.status === 'rejected').length;
  const winRate = wonCount + lostCount > 0
    ? Math.round((wonCount / (wonCount + lostCount)) * 100)
    : 0;

  const openValue = openQuotes.reduce((s, q) => s + q.total, 0);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = quotations.filter(q => {
    const customer = store.parties[q.customerId];
    const matchesSearch =
      !search ||
      q.number.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'open') {
      return (
        (q.status === 'draft' || q.status === 'sent' || q.status === 'accepted') &&
        !isEffectivelyExpired(q, today)
      );
    }
    if (filter === 'accepted') return q.status === 'accepted' || q.status === 'converted';
    if (filter === 'rejected') return q.status === 'rejected';
    if (filter === 'expired') return isEffectivelyExpired(q, today) || q.status === 'expired';
    if (filter === 'converted') return q.status === 'converted';
    return true;
  });

  // ── Form helpers ──────────────────────────────────────────────────────────
  const computedItems = formItems.map(calcItem);
  const subtotal = computedItems.reduce((s, it) => s + it.qty * it.rate, 0);
  const gstAmount = computedItems.reduce(
    (s, it) => s + (it.qty * it.rate * it.gstRate) / 100,
    0,
  );
  const total = subtotal + gstAmount;

  const selectedCustomer = formCustomerId ? store.parties[formCustomerId] : null;
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

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
    updateItem(i, { name: p.name, rate: p.sellingPrice, gstRate: p.gstRate, productId: p.id });
    setItemSearches(s => { const n = { ...s }; delete n[i]; return n; });
    setItemDropdowns(d => ({ ...d, [i]: false }));
  }

  function addItem() {
    setFormItems(items => [...items, { ...EMPTY_ITEM }]);
  }

  function updateItem(i: number, updates: Partial<BizInvoiceItem>) {
    setFormItems(items => items.map((it, idx) => (idx === i ? { ...it, ...updates } : it)));
  }

  function removeItem(i: number) {
    setFormItems(items => items.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    setEditingId(null);
    setFormCustomerId('');
    setFormDate(todayISO());
    setFormValidTill(addDays(todayISO(), 15));
    setFormNotes('');
    setFormItems([{ ...EMPTY_ITEM }]);
    setCustomerSearch('');
    setItemDropdowns({});
    setItemSearches({});
  }

  function openNewForm() {
    resetForm();
    setMode('new');
  }

  function openEditForm(q: BizQuotation) {
    setEditingId(q.id);
    setFormCustomerId(q.customerId);
    setFormDate(q.date);
    setFormValidTill(q.validTill);
    setFormNotes(q.notes ?? '');
    setFormItems(q.items.map(it => ({ ...it })));
    setCustomerSearch('');
    setItemDropdowns({});
    setItemSearches({});
    setMode('new');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formCustomerId || formItems.length === 0) return;
    const finalItems = formItems.map(calcItem);
    const sub = finalItems.reduce((s, it) => s + it.qty * it.rate, 0);
    const gst = finalItems.reduce((s, it) => s + (it.qty * it.rate * it.gstRate) / 100, 0);

    if (editingId) {
      updateQuotation(editingId, {
        date: formDate,
        validTill: formValidTill,
        customerId: formCustomerId,
        items: finalItems,
        subtotal: sub,
        gstAmount: gst,
        total: sub + gst,
        notes: formNotes.trim() || undefined,
      });
      showToast('Quotation updated.');
    } else {
      addQuotation({
        date: formDate,
        validTill: formValidTill,
        customerId: formCustomerId,
        items: finalItems,
        subtotal: sub,
        gstAmount: gst,
        total: sub + gst,
        status: 'draft',
        notes: formNotes.trim() || undefined,
      });
      showToast('Quotation created!');
    }
    resetForm();
    setMode('quotes');
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deleteQuotation(id);
      setDeleteConfirm(null);
      showToast('Quotation deleted.');
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function handleConvert(id: string) {
    convertQuoteToInvoice(id);
    showToast('Invoice created from quotation!');
  }

  function handleMarkAccepted(id: string) {
    updateQuotation(id, { status: 'accepted' });
    showToast('Marked as Accepted.');
  }

  function handleMarkRejected(id: string) {
    updateQuotation(id, { status: 'rejected' });
    showToast('Marked as Rejected.');
  }

  const FILTER_TABS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'expired', label: 'Expired' },
    { key: 'converted', label: 'Converted' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-xl text-sm font-bold animate-fade-in">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      <SAPHeader
        fullWidth
        sticky
        title="Quotations"
        subtitle="Estimates · Proposals · Win Rate"
        kpis={[
          {
            label: 'Total Quotes',
            value: totalCount,
            color: 'neutral',
            icon: List,
          },
          {
            label: 'Open Quotes',
            value: openQuotes.length,
            color: 'primary',
            icon: FileText,
          },
          {
            label: 'Win Rate',
            value: `${winRate}%`,
            color: 'success',
            icon: TrendingUp,
          },
          {
            label: 'Quote Value',
            value: fmtCurrency(openValue),
            color: 'primary',
          },
        ]}
        modes={[
          {
            label: 'View',
            value: mode,
            options: [
              { key: 'quotes', label: 'Quotes' },
              { key: 'new', label: editingId ? 'Edit Quote' : 'New Quote' },
            ],
            onChange: v => {
              if (v === 'quotes') { resetForm(); setMode('quotes'); }
              else openNewForm();
            },
          },
        ]}
      />

      {/* ── Quotes List Mode ──────────────────────────────────────────────── */}
      {mode === 'quotes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search quotes or customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5 shrink-0">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={openNewForm}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <Plus size={15} /> New Quote
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <FileText size={40} className="text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-base font-bold text-slate-400 dark:text-slate-500 mb-1">
                  No quotations found
                </p>
                <button
                  onClick={openNewForm}
                  className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Create your first quote →
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {['Quote #', 'Date', 'Valid Till', 'Customer', 'Total', 'Status', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(q => {
                    const customer = store.parties[q.customerId];
                    const expired = isEffectivelyExpired(q, today);
                    const effectiveStatus: QuoteStatus = expired && q.status !== 'expired' ? 'expired' : q.status;
                    const statusCfg = STATUS_CONFIG[effectiveStatus];
                    const canEdit = q.status === 'draft' || q.status === 'sent';
                    const canConvert = q.status === 'accepted' || q.status === 'sent';
                    const canAccept = q.status === 'sent';
                    const canReject = q.status === 'sent' || q.status === 'draft';
                    const isExpiredRow = expired;

                    return (
                      <tr
                        key={q.id}
                        className={`group transition-colors ${
                          isExpiredRow
                            ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-70'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {q.number}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {q.date}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap font-medium ${
                          isExpiredRow
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {q.validTill}
                          {isExpiredRow && (
                            <span className="ml-1 text-[10px] font-bold text-red-500 dark:text-red-400">(expired)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-[140px] truncate">
                          {customer?.name ?? <span className="text-slate-400 italic">Unknown</span>}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {fmtCurrency(q.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Edit */}
                            {canEdit && (
                              <button
                                onClick={() => openEditForm(q)}
                                title="Edit quote"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}

                            {/* Convert to Invoice */}
                            {canConvert && (
                              <button
                                onClick={() => handleConvert(q.id)}
                                title="Convert to Invoice"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <FileText size={14} />
                              </button>
                            )}

                            {/* Mark Accepted */}
                            {canAccept && (
                              <button
                                onClick={() => handleMarkAccepted(q.id)}
                                title="Mark Accepted"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                              >
                                <ThumbsUp size={14} />
                              </button>
                            )}

                            {/* Mark Rejected */}
                            {canReject && (
                              <button
                                onClick={() => handleMarkRejected(q.id)}
                                title="Mark Rejected"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(q.id)}
                              title={deleteConfirm === q.id ? 'Click again to confirm' : 'Delete'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                deleteConfirm === q.id
                                  ? 'bg-red-600 text-white'
                                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
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

      {/* ── New / Edit Quote Mode ─────────────────────────────────────────── */}
      {mode === 'new' && (
        <div className="flex-1 overflow-auto">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingId ? `Edit ${getQuotations(store)[editingId]?.number ?? 'Quote'}` : 'New Quotation'}
              </h2>
              <button
                type="button"
                onClick={() => { resetForm(); setMode('quotes'); }}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
              >
                ← Back to Quotes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ── Left: Customer + Dates + Notes ───────────────────────── */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quote Details</p>

                  {/* Customer */}
                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Customer *
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={selectedCustomer ? selectedCustomer.name : 'Search customer...'}
                        value={selectedCustomer ? '' : customerSearch}
                        onChange={e => {
                          setCustomerSearch(e.target.value);
                          setFormCustomerId('');
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                      />
                      {selectedCustomer && (
                        <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                          <span className="text-sm text-slate-900 dark:text-white font-semibold">{selectedCustomer.name}</span>
                        </div>
                      )}
                      {selectedCustomer && (
                        <button
                          type="button"
                          onClick={() => { setFormCustomerId(''); setCustomerSearch(''); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-base px-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredCustomers.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full text-left px-3 py-2.5 text-sm text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            onClick={() => {
                              setFormCustomerId(c.id);
                              setCustomerSearch('');
                              setShowCustomerDropdown(false);
                            }}
                          >
                            <span className="font-semibold">{c.name}</span>
                            {c.phone && <span className="ml-2 text-xs text-slate-400">{c.phone}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {showCustomerDropdown && !selectedCustomer && filteredCustomers.length === 0 && customerSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 px-3 py-2.5 text-xs text-slate-400">
                        No customers found. Add one in Party Register.
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Quote Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                    />
                  </div>

                  {/* Valid Till */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Valid Till
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValidTill}
                      onChange={e => setFormValidTill(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Terms, validity conditions, payment notes..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── Right: Line Items + Summary ───────────────────────────── */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Line Items *
                    </p>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus size={12} /> Add Row
                    </button>
                  </div>

                  {/* Column headers */}
                  <div className="grid grid-cols-12 gap-1 px-1 mb-1.5">
                    {[
                      { label: 'Item Name', span: 'col-span-4' },
                      { label: 'Qty', span: 'col-span-2 text-right' },
                      { label: 'Rate ₹', span: 'col-span-2 text-right' },
                      { label: 'GST%', span: 'col-span-2 text-right' },
                      { label: 'Amt', span: 'col-span-1 text-right' },
                      { label: '', span: 'col-span-1' },
                    ].map((h, i) => (
                      <span key={i} className={`${h.span} text-[10px] font-semibold text-slate-400 uppercase tracking-wider`}>
                        {h.label}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {formItems.map((item, i) => {
                      const computed = calcItem(item);
                      const itemMatches = getItemMatches(i);
                      const showDrop = itemDropdowns[i] && itemMatches.length > 0;
                      return (
                        <div key={i} className="grid grid-cols-12 gap-1 items-center">
                          {/* Item name with product typeahead */}
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
                                {itemMatches.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between gap-2"
                                    onMouseDown={e => { e.preventDefault(); selectProduct(i, p.id); }}
                                  >
                                    <span className="font-medium truncate">{p.name}</span>
                                    <span className="text-slate-400 dark:text-slate-500 shrink-0">
                                      ₹{p.sellingPrice}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Qty */}
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
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

                          {/* GST Rate */}
                          <select
                            className="col-span-2 px-1 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={item.gstRate}
                            onChange={e => updateItem(i, { gstRate: parseInt(e.target.value) })}
                          >
                            {GST_RATES.map(r => (
                              <option key={r} value={r}>{r}%</option>
                            ))}
                          </select>

                          {/* Amount */}
                          <span className="col-span-1 text-xs font-bold text-slate-700 dark:text-slate-200 text-right">
                            {fmtCurrency(computed.amount)}
                          </span>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="col-span-1 flex justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {formItems.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                      No items yet. Click &ldquo;Add Row&rdquo; to add line items.
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-bold">{fmtCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>GST</span>
                    <span className="font-bold">{fmtCurrency(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span>Total</span>
                    <span>{fmtCurrency(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setMode('quotes'); }}
                    className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formCustomerId || formItems.length === 0 || formItems.every(it => !it.name)}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                  >
                    {editingId ? 'Update Quote' : 'Create Quote'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
