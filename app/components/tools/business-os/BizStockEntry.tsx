'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate,
  addStockMovement, getProductMovements,
  fmtCurrency, todayISO,
  type BizOSStore, type BizTransaction,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'entry' | 'history';
type EntryType = 'in' | 'out';

const DEFAULT_FORM = {
  type: 'in' as EntryType,
  productId: '',
  qty: '',
  rate: '',
  partyId: '',
  date: todayISO(),
  notes: '',
  invoiceId: '',
};

export function BizStockEntry() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('entry');
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [productSearch, setProductSearch] = useState('');
  const [showProductDrop, setShowProductDrop] = useState(false);
  const [partySearch, setPartySearch] = useState('');
  const [showPartyDrop, setShowPartyDrop] = useState(false);
  const [successBanner, setSuccessBanner] = useState<{ productName: string; qty: number; type: EntryType; newStock: number } | null>(null);

  // History filters
  const [histFilterType, setHistFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [histFilterProduct, setHistFilterProduct] = useState('');
  const [histFilterParty, setHistFilterParty] = useState('');

  const productRef = useRef<HTMLDivElement>(null);
  const partyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) setShowProductDrop(false);
      if (partyRef.current && !partyRef.current.contains(e.target as Node)) setShowPartyDrop(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!store) return null;

  const products = Object.values(store.products);
  const parties = Object.values(store.parties);

  // Relevant parties for current entry type
  const relevantParties = parties.filter(p =>
    form.type === 'in' ? (p.type === 'vendor' || p.type === 'other') : (p.type === 'customer' || p.type === 'other'),
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(productSearch.toLowerCase()),
  );

  const filteredParties = relevantParties.filter(p =>
    p.name.toLowerCase().includes(partySearch.toLowerCase()),
  );

  // Open invoices for selected party
  const openInvoices = form.partyId
    ? Object.values(store.invoices).filter(inv =>
        inv.customerId === form.partyId && (inv.status === 'sent' || inv.status === 'draft'),
      )
    : [];

  // Selected product/party
  const selectedProduct = form.productId ? store.products[form.productId] : null;
  const selectedParty = form.partyId ? store.parties[form.partyId] : null;

  // KPIs for this month
  const today = todayISO();
  const thisMonth = today.slice(0, 7);
  const allMovements = store.transactions.filter(t => t.productId);
  const monthMovements = allMovements.filter(t => t.date.startsWith(thisMonth));
  const todayMovements = allMovements.filter(t => t.date === today);
  const monthIn = monthMovements.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthOut = monthMovements.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  function selectProduct(id: string) {
    const p = store!.products[id];
    if (!p) return;
    setForm(f => ({
      ...f,
      productId: id,
      rate: String(f.type === 'in' ? p.costPrice : p.sellingPrice),
    }));
    setProductSearch('');
    setShowProductDrop(false);
  }

  function selectParty(id: string) {
    setForm(f => ({ ...f, partyId: id, invoiceId: '' }));
    setPartySearch('');
    setShowPartyDrop(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.qty || !form.rate) return;
    const qty = parseFloat(form.qty);
    const rate = parseFloat(form.rate);
    if (isNaN(qty) || isNaN(rate) || qty <= 0) return;

    addStockMovement({
      productId: form.productId,
      type: form.type,
      qty,
      rate,
      partyId: form.partyId || undefined,
      date: form.date,
      notes: form.notes.trim() || undefined,
      invoiceId: form.invoiceId || undefined,
    });

    const newStock = Math.max(0, (selectedProduct?.stock ?? 0) + (form.type === 'in' ? qty : -qty));
    setSuccessBanner({ productName: selectedProduct?.name ?? '', qty, type: form.type, newStock });
    setTimeout(() => setSuccessBanner(null), 4000);
    setForm({ ...DEFAULT_FORM });
    setProductSearch(''); setPartySearch('');
  }

  // History
  const allProductMovements: BizTransaction[] = store.transactions.filter(t => !!t.productId);
  const histFiltered = allProductMovements.filter(t => {
    if (histFilterType === 'in' && t.type !== 'expense') return false;
    if (histFilterType === 'out' && t.type !== 'income') return false;
    if (histFilterProduct && t.productId !== histFilterProduct) return false;
    if (histFilterParty && t.partyId !== histFilterParty) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const total = selectedProduct && form.qty && form.rate
    ? parseFloat(form.qty) * parseFloat(form.rate)
    : 0;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <SAPHeader
        fullWidth sticky
        title="Stock Entry"
        subtitle="Record goods received and dispatched"
        kpis={[
          { label: 'Movements Today', value: todayMovements.length, color: 'neutral', icon: Package },
          { label: 'Received This Month', value: fmtCurrency(monthIn), color: 'primary', icon: ArrowDownCircle },
          { label: 'Dispatched This Month', value: fmtCurrency(monthOut), color: 'success', icon: ArrowUpCircle },
          { label: 'Total Movements', value: allMovements.length, color: 'neutral' },
        ]}
        actions={
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5 border border-slate-200 dark:border-slate-700">
            {([
              { key: 'entry', label: 'New Entry' },
              { key: 'history', label: 'Movement History' },
            ] as { key: Mode; label: string }[]).map(opt => (
              <button key={opt.key}
                onClick={() => setMode(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === opt.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── ENTRY MODE ─────────────────────────────────────────────────────── */}
        {mode === 'entry' && (
          <div className="flex-1 grid grid-cols-[420px_1fr] gap-0 overflow-hidden">

            {/* LEFT: Form */}
            <div className="border-r border-slate-200 dark:border-slate-700 overflow-y-auto p-4 space-y-3">
            {/* Success Banner */}
            {successBanner && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center gap-3">
                <ArrowDownCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {successBanner.type === 'in' ? 'Stock received!' : 'Stock dispatched!'}
                    {' '}{successBanner.qty} units of <strong>{successBanner.productName}</strong>
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">New stock level: {successBanner.newStock} units</p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className="flex gap-2">
                  {([
                    { key: 'in', label: '↓ Goods Received', color: 'bg-blue-500 text-white', inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
                    { key: 'out', label: '↑ Goods Dispatched', color: 'bg-emerald-500 text-white', inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
                  ] as const).map(t => (
                    <button key={t.key} type="button"
                      onClick={() => {
                        const newType = t.key as EntryType;
                        setForm(f => ({ ...f, type: newType, partyId: '', invoiceId: '', rate: selectedProduct ? String(newType === 'in' ? selectedProduct.costPrice : selectedProduct.sellingPrice) : f.rate }));
                        setPartySearch('');
                      }}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${form.type === t.key ? t.color : t.inactive}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Product Search */}
                <div ref={productRef}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Product *</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={selectedProduct ? selectedProduct.name : 'Search product...'}
                      value={selectedProduct ? '' : productSearch}
                      onChange={e => { setProductSearch(e.target.value); setForm(f => ({ ...f, productId: '', rate: '' })); setShowProductDrop(true); }}
                      onFocus={() => setShowProductDrop(true)}
                    />
                    {selectedProduct && (
                      <span className="absolute left-8 top-2 text-sm text-slate-900 dark:text-white font-semibold truncate max-w-[calc(100%-3rem)]">
                        {selectedProduct.name}
                        <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">({selectedProduct.stock} {selectedProduct.unit} in stock)</span>
                      </span>
                    )}
                    {showProductDrop && filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredProducts.map(p => (
                          <button key={p.id} type="button"
                            className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                            onClick={() => selectProduct(p.id)}>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                              {p.sku && <p className="text-xs text-slate-400 font-mono">{p.sku}</p>}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{p.stock} {p.unit}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Qty + Rate */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Quantity *</label>
                    <input required type="number" min="0.01" step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
                    {selectedProduct && <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.unit}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {form.type === 'in' ? 'Cost Price ₹' : 'Sale Price ₹'} *
                    </label>
                    <input required type="number" min="0" step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total</label>
                    <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-black text-slate-700 dark:text-slate-200">
                      {total > 0 ? fmtCurrency(total) : '—'}
                    </div>
                  </div>
                </div>

                {/* Party */}
                <div ref={partyRef}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    {form.type === 'in' ? 'Vendor (Optional)' : 'Customer (Optional)'}
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={selectedParty ? selectedParty.name : `Search ${form.type === 'in' ? 'vendor' : 'customer'}...`}
                      value={selectedParty ? '' : partySearch}
                      onChange={e => { setPartySearch(e.target.value); setForm(f => ({ ...f, partyId: '', invoiceId: '' })); setShowPartyDrop(true); }}
                      onFocus={() => setShowPartyDrop(true)}
                    />
                    {selectedParty && (
                      <span className="absolute left-3 top-2 text-sm text-slate-900 dark:text-white font-semibold">{selectedParty.name}</span>
                    )}
                    {showPartyDrop && filteredParties.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                        <button type="button" className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                          onClick={() => { setForm(f => ({ ...f, partyId: '', invoiceId: '' })); setPartySearch(''); setShowPartyDrop(false); }}>
                          None
                        </button>
                        {filteredParties.map(p => (
                          <button key={p.id} type="button"
                            className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                            onClick={() => selectParty(p.id)}>
                            {p.name} <span className="text-xs text-slate-400 capitalize">· {p.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Link to Invoice (only for out with a customer selected) */}
                {form.type === 'out' && openInvoices.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Link to Invoice (Optional)</label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        value={form.invoiceId}
                        onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))}
                      >
                        <option value="">No invoice</option>
                        {openInvoices.map(inv => (
                          <option key={inv.id} value={inv.id}>{inv.number} — {fmtCurrency(inv.total)} ({inv.status})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Date + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                    <input type="date"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Notes</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Lot #, vehicle no., etc."
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>

                {/* Stock impact preview */}
                {selectedProduct && form.qty && parseFloat(form.qty) > 0 && (
                  <div className={`rounded-xl p-3 text-sm flex items-center justify-between ${form.type === 'in' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                    <span className={`font-semibold ${form.type === 'in' ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      Stock impact on {selectedProduct.name}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {selectedProduct.stock} {form.type === 'in' ? '+' : '−'} {form.qty} = {' '}
                      <span className={form.type === 'in' ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}>
                        {Math.max(0, selectedProduct.stock + (form.type === 'in' ? parseFloat(form.qty) : -parseFloat(form.qty)))} {selectedProduct.unit}
                      </span>
                    </span>
                  </div>
                )}

                <button type="submit" disabled={!form.productId || !form.qty || !form.rate}
                  className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40 ${form.type === 'in' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {form.type === 'in' ? '↓ Record Goods Received' : '↑ Record Goods Dispatched'}
                </button>
              </form>
            </div>
            </div>{/* /LEFT form */}

            {/* RIGHT: Recent movements */}
            <div className="overflow-y-auto p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Recent Movements</p>
              {allMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300 dark:text-slate-600">
                  <Package size={32} className="mb-2" />
                  <p className="text-sm">No movements yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allMovements.slice(0, 30).map(tx => {
                    const product = tx.productId ? store.products[tx.productId] : null;
                    const party = tx.partyId ? store.parties[tx.partyId] : null;
                    const isIn = tx.type === 'expense';
                    return (
                      <div key={tx.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm ${isIn ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'}`}>
                        <span className={`shrink-0 ${isIn ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {isIn ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{product?.name ?? '—'}</p>
                          <p className="text-xs text-slate-400">{tx.date}{party ? ` · ${party.name}` : ''}</p>
                        </div>
                        <span className="font-black text-slate-700 dark:text-slate-200 shrink-0">{fmtCurrency(tx.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY MODE ───────────────────────────────────────────────────── */}
        {mode === 'history' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                {(['all', 'in', 'out'] as const).map(t => (
                  <button key={t}
                    onClick={() => setHistFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${histFilterType === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    {t === 'all' ? 'All' : t === 'in' ? '↓ Received' : '↑ Dispatched'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={histFilterProduct}
                  onChange={e => setHistFilterProduct(e.target.value)}
                >
                  <option value="">All products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={histFilterParty}
                  onChange={e => setHistFilterParty(e.target.value)}
                >
                  <option value="">All parties</option>
                  {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{histFiltered.length} movements</span>
            </div>

            {histFiltered.length === 0 ? (
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                <Package size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No stock movements yet</p>
              </div>
            ) : (
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        {['Date', 'Product', 'Direction', 'Qty', 'Rate', 'Total', 'Party', 'Invoice', 'Notes'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {histFiltered.map(tx => {
                        const product = tx.productId ? store.products[tx.productId] : null;
                        const party = tx.partyId ? store.parties[tx.partyId] : null;
                        const invoice = tx.invoiceId ? store.invoices[tx.invoiceId] : null;
                        const isIn = tx.type === 'expense';
                        return (
                          <tr key={tx.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isIn ? '' : 'bg-emerald-50/30 dark:bg-emerald-900/5'}`}>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{tx.date}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 dark:text-white">{product?.name ?? '—'}</p>
                              {product?.sku && <p className="text-xs text-slate-400 font-mono">{product.sku}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isIn ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                {isIn ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                                {isIn ? 'In' : 'Out'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              {/* We derive qty from description parsing — just show amount / rate if available */}
                              {product ? `— ${product.unit}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">—</td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{fmtCurrency(tx.amount)}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{party?.name ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                            <td className="px-4 py-3">
                              {invoice ? (
                                <span className="text-xs font-mono text-amber-600 dark:text-amber-400">{invoice.number}</span>
                              ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 max-w-32 truncate">{tx.notes ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

