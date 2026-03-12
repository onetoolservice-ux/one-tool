'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle, Clock, XCircle, FileText, ChevronDown, Search } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate,
  addInvoice, updateInvoice, deleteInvoice, markInvoicePaid,
  fmtCurrency, todayISO, GST_RATES,
  type BizOSStore, type BizInvoice, type BizInvoiceItem, type InvoiceStatus,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft:     { label: 'Draft',    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: <FileText size={12} /> },
  sent:      { label: 'Sent',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock size={12} /> },
  paid:      { label: 'Paid',     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle size={12} /> },
  overdue:   { label: 'Overdue',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <Clock size={12} /> },
  cancelled: { label: 'Cancelled',color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: <XCircle size={12} /> },
};

const EMPTY_ITEM: BizInvoiceItem = { name: '', qty: 1, rate: 0, gstRate: 18, amount: 0 };

function calcItem(item: BizInvoiceItem): BizInvoiceItem {
  const base = item.qty * item.rate;
  const gst = (base * item.gstRate) / 100;
  return { ...item, amount: base + gst };
}

export function BizInvoices() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all');
  const [filterParty, setFilterParty] = useState('');
  const [search, setSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Create Invoice form
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDate, setFormDate] = useState(todayISO());
  const [formDueDate, setFormDueDate] = useState('');
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

  if (!store) return null;

  const invoices = Object.values(store.invoices).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const customers = Object.values(store.parties).filter(p => p.type === 'customer' || p.type === 'other');

  // KPIs
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => {
    if (i.status === 'overdue') return true;
    return i.status === 'sent' && i.dueDate && new Date(i.dueDate) < new Date();
  }).reduce((s, i) => s + i.total, 0);

  // Filtered invoices
  const filtered = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (filterParty && inv.customerId !== filterParty) return false;
    const party = store.parties[inv.customerId];
    if (search && !inv.number.toLowerCase().includes(search.toLowerCase()) &&
        !party?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedInvoice = selectedInvoiceId ? store.invoices[selectedInvoiceId] : null;

  // Compute form totals
  const computedItems = formItems.map(calcItem);
  const subtotal = computedItems.reduce((s, it) => s + it.qty * it.rate, 0);
  const gstAmount = computedItems.reduce((s, it) => s + (it.qty * it.rate * it.gstRate / 100), 0);
  const total = subtotal + gstAmount;

  function addItem() {
    setFormItems(items => [...items, { ...EMPTY_ITEM }]);
  }

  function updateItem(i: number, updates: Partial<BizInvoiceItem>) {
    setFormItems(items => items.map((it, idx) => idx === i ? { ...it, ...updates } : it));
  }

  function removeItem(i: number) {
    setFormItems(items => items.filter((_, idx) => idx !== i));
  }

  function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!formCustomerId || formItems.length === 0) return;
    const finalItems = formItems.map(calcItem);
    const sub = finalItems.reduce((s, it) => s + it.qty * it.rate, 0);
    const gst = finalItems.reduce((s, it) => s + (it.qty * it.rate * it.gstRate / 100), 0);
    addInvoice({
      date: formDate,
      dueDate: formDueDate || undefined,
      customerId: formCustomerId,
      items: finalItems,
      subtotal: sub,
      gstAmount: gst,
      total: sub + gst,
      status: 'draft',
      notes: formNotes.trim() || undefined,
    });
    resetForm();
    setShowForm(false);
  }

  function resetForm() {
    setFormCustomerId('');
    setFormDate(todayISO());
    setFormDueDate('');
    setFormNotes('');
    setFormItems([{ ...EMPTY_ITEM }]);
    setCustomerSearch('');
    setItemDropdowns({});
    setItemSearches({});
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      if (selectedInvoiceId === id) setSelectedInvoiceId(null);
      deleteInvoice(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function handleMarkPaid(id: string) {
    markInvoicePaid(id);
  }

  const selectedCustomer = formCustomerId ? store.parties[formCustomerId] : null;
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  const allProducts = Object.values(store.products);

  function getItemMatches(i: number) {
    const q = (itemSearches[i] ?? '').toLowerCase();
    if (!q) return allProducts.slice(0, 8);
    return allProducts.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)).slice(0, 8);
  }

  function selectProduct(i: number, productId: string) {
    const p = store.products[productId];
    if (!p) return;
    updateItem(i, { name: p.name, rate: p.sellingPrice, gstRate: p.gstRate, productId: p.id });
    setItemSearches(s => { const n = { ...s }; delete n[i]; return n; });
    setItemDropdowns(d => ({ ...d, [i]: false }));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth sticky
        title="Invoice Manager"
        subtitle="Create · Track · Collect — GST invoicing"
        kpis={[
          { label: 'Total Invoiced', value: fmtCurrency(totalInvoiced), color: 'neutral' },
          { label: 'Collected', value: fmtCurrency(totalPaid), color: 'success', icon: CheckCircle },
          { label: 'Pending', value: fmtCurrency(totalPending), color: 'warning', icon: Clock },
          { label: 'Overdue', value: fmtCurrency(totalOverdue), color: 'error' },
        ]}
        actions={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
            <Plus size={16} /> New Invoice
          </button>
        }
      />

      {/* Create Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Create New Invoice</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-light">×</button>
            </div>
            <form onSubmit={handleCreateInvoice} className="overflow-y-auto flex-1">
              <div className="p-5 space-y-4">
                {/* Customer + Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Customer *</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={selectedCustomer ? selectedCustomer.name : 'Search customer...'}
                      value={selectedCustomer ? '' : customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setFormCustomerId(''); setShowCustomerDropdown(true); }}
                      onFocus={() => setShowCustomerDropdown(true)}
                    />
                    {selectedCustomer && (
                      <span className="absolute left-3 top-8 text-sm text-slate-900 dark:text-white font-medium">{selectedCustomer.name}</span>
                    )}
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                        {filteredCustomers.map(c => (
                          <button key={c.id} type="button"
                            className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                            onClick={() => { setFormCustomerId(c.id); setCustomerSearch(''); setShowCustomerDropdown(false); }}>
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Invoice Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formDate} onChange={e => setFormDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Due Date (Optional)</label>
                  <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formDueDate} onChange={e => setFormDueDate(e.target.value)} />
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items *</label>
                    <button type="button" onClick={addItem} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      <Plus size={12} /> Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-1 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span className="col-span-4">Description</span>
                      <span className="col-span-2 text-right">Qty</span>
                      <span className="col-span-2 text-right">Rate (₹)</span>
                      <span className="col-span-2 text-right">GST %</span>
                      <span className="col-span-1 text-right">Amt</span>
                      <span className="col-span-1"></span>
                    </div>
                    {formItems.map((item, i) => {
                      const computed = calcItem(item);
                      const itemMatches = getItemMatches(i);
                      const showDrop = itemDropdowns[i] && itemMatches.length > 0;
                      return (
                        <div key={i} className="grid grid-cols-12 gap-1 items-center">
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
                                  <button key={p.id} type="button"
                                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between gap-2"
                                    onMouseDown={e => { e.preventDefault(); selectProduct(i, p.id); }}>
                                    <span className="font-medium truncate">{p.name}</span>
                                    <span className="text-slate-400 dark:text-slate-500 shrink-0">₹{p.sellingPrice}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input type="number" min="1" className="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={item.qty} onChange={e => updateItem(i, { qty: parseFloat(e.target.value) || 1 })} />
                          <input type="number" min="0" step="0.01" className="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0" value={item.rate || ''} onChange={e => updateItem(i, { rate: parseFloat(e.target.value) || 0 })} />
                          <div className="col-span-2 relative">
                            <select className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                              value={item.gstRate} onChange={e => updateItem(i, { gstRate: parseInt(e.target.value) })}>
                              {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                            </select>
                          </div>
                          <span className="col-span-1 text-xs font-bold text-slate-700 dark:text-slate-200 text-right">{fmtCurrency(computed.amount)}</span>
                          <button type="button" onClick={() => removeItem(i)}
                            className="col-span-1 flex justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span><span className="font-bold">{fmtCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>GST</span><span className="font-bold">{fmtCurrency(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span>Total</span><span>{fmtCurrency(total)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Notes (Optional)</label>
                  <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Payment terms, bank details..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
                </div>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex gap-3 shrink-0">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold">Cancel</button>
                <button type="submit" disabled={!formCustomerId || formItems.length === 0 || formItems.every(it => !it.name)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-bold transition-colors">
                  Create Invoice (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-180px)]">
        {/* Invoice List */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search invoices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'] as const).map(s => (
                <button key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                    filterStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice items */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">No invoices found</p>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">Create one →</button>
              </div>
            ) : (
              filtered.map(inv => {
                const customer = store.parties[inv.customerId];
                const st = STATUS_CONFIG[inv.status];
                const isSelected = selectedInvoiceId === inv.id;
                const isOverdue = inv.status === 'sent' && inv.dueDate && new Date(inv.dueDate) < new Date();
                const effectiveStatus = isOverdue ? STATUS_CONFIG.overdue : st;
                return (
                  <div key={inv.id}
                    onClick={() => setSelectedInvoiceId(isSelected ? null : inv.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{inv.number}</p>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${effectiveStatus.color}`}>
                          {effectiveStatus.icon} {effectiveStatus.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{customer?.name ?? 'Unknown'} · {inv.date}</p>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white shrink-0">{fmtCurrency(inv.total)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Invoice Detail */}
        <div className="flex-1 overflow-y-auto">
          {!selectedInvoice ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <FileText size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-500 dark:text-slate-400">Select an invoice to view details</p>
            </div>
          ) : (
            <div className="p-5 max-w-2xl mx-auto space-y-4">
              {/* Invoice Header */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedInvoice.number}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Issued: {selectedInvoice.date}
                      {selectedInvoice.dueDate && ` · Due: ${selectedInvoice.dueDate}`}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${STATUS_CONFIG[selectedInvoice.status].color}`}>
                    {STATUS_CONFIG[selectedInvoice.status].icon}
                    {STATUS_CONFIG[selectedInvoice.status].label}
                  </span>
                </div>

                {/* Customer */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bill To</p>
                  <p className="font-bold text-slate-900 dark:text-white">{store.parties[selectedInvoice.customerId]?.name ?? 'Unknown'}</p>
                  {store.parties[selectedInvoice.customerId]?.address && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{store.parties[selectedInvoice.customerId]?.address}</p>
                  )}
                  {store.parties[selectedInvoice.customerId]?.gstin && (
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">GSTIN: {store.parties[selectedInvoice.customerId]?.gstin}</p>
                  )}
                </div>

                {/* Line Items */}
                <table className="w-full text-sm mb-5">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 text-xs font-black text-slate-500 uppercase tracking-wider">Item</th>
                      <th className="text-right py-2 text-xs font-black text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="text-right py-2 text-xs font-black text-slate-500 uppercase tracking-wider">Rate</th>
                      <th className="text-right py-2 text-xs font-black text-slate-500 uppercase tracking-wider">GST</th>
                      <th className="text-right py-2 text-xs font-black text-slate-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2 font-medium text-slate-900 dark:text-white">{item.name}</td>
                        <td className="py-2 text-right text-slate-600 dark:text-slate-300">{item.qty}</td>
                        <td className="py-2 text-right text-slate-600 dark:text-slate-300">{fmtCurrency(item.rate)}</td>
                        <td className="py-2 text-right text-slate-500 dark:text-slate-400">{item.gstRate}%</td>
                        <td className="py-2 text-right font-bold text-slate-900 dark:text-white">{fmtCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span><span className="font-bold">{fmtCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>GST</span><span className="font-bold">{fmtCurrency(selectedInvoice.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span>Total</span><span>{fmtCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-100 dark:border-slate-800 pt-3">
                    Note: {selectedInvoice.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                  <button
                    onClick={() => handleMarkPaid(selectedInvoice.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    <CheckCircle size={15} /> Mark as Paid
                  </button>
                )}
                {selectedInvoice.status === 'draft' && (
                  <button
                    onClick={() => updateInvoice(selectedInvoice.id, { status: 'sent' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    <Clock size={15} /> Mark as Sent
                  </button>
                )}
                {selectedInvoice.status !== 'cancelled' && selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => updateInvoice(selectedInvoice.id, { status: 'cancelled' })}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <XCircle size={15} /> Cancel
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedInvoice.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ml-auto ${
                    deleteConfirm === selectedInvoice.id
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                  }`}
                >
                  <Trash2 size={15} />
                  {deleteConfirm === selectedInvoice.id ? 'Confirm Delete' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
