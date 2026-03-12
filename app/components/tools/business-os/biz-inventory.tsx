'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle, Package, ChevronDown, Search, Edit2 } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate,
  addProduct, updateProduct, deleteProduct,
  fmtCurrency, PRODUCT_CATEGORIES, UNITS, GST_RATES,
  type BizOSStore, type BizProduct,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_PRODUCT: Omit<BizProduct, 'id' | 'createdAt'> = {
  name: '',
  sku: '',
  category: 'Other',
  unit: 'pcs',
  sellingPrice: 0,
  costPrice: 0,
  stock: 0,
  lowStockAlert: 10,
  supplierId: '',
  gstRate: 18,
};

export function BizInventory() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<BizProduct | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: 'stock' | 'sellingPrice'; value: string } | null>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  if (!store) return null;

  const vendors = Object.values(store.parties).filter(p => p.type === 'vendor');
  const products = Object.values(store.products);
  const lowStockItems = products.filter(p => p.lowStockAlert > 0 && p.stock <= p.lowStockAlert);

  const allCategories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const totalSellingValue = products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0);

  function openAdd() {
    setForm({ ...EMPTY_PRODUCT });
    setEditProduct(null);
    setShowForm(true);
  }

  function openEdit(p: BizProduct) {
    setEditProduct(p);
    setForm({
      name: p.name, sku: p.sku ?? '', category: p.category, unit: p.unit,
      sellingPrice: p.sellingPrice, costPrice: p.costPrice, stock: p.stock,
      lowStockAlert: p.lowStockAlert, supplierId: p.supplierId ?? '', gstRate: p.gstRate,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = {
      ...form,
      sku: form.sku?.trim() || undefined,
      supplierId: form.supplierId || undefined,
      sellingPrice: Number(form.sellingPrice),
      costPrice: Number(form.costPrice),
      stock: Number(form.stock),
      lowStockAlert: Number(form.lowStockAlert),
      gstRate: Number(form.gstRate),
    };
    if (editProduct) {
      updateProduct(editProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowForm(false);
    setEditProduct(null);
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deleteProduct(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function commitInlineEdit() {
    if (!inlineEdit) return;
    const val = parseFloat(inlineEdit.value);
    if (isNaN(val) || val < 0) { setInlineEdit(null); return; }
    updateProduct(inlineEdit.id, { [inlineEdit.field]: val });
    setInlineEdit(null);
  }

  const margin = (p: BizProduct) =>
    p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth sticky
        title="Inventory Manager"
        subtitle="Product catalog · Stock levels · Supplier tracking"
        kpis={[
          { label: 'Total Products', value: products.length, color: 'neutral', icon: Package },
          { label: 'Low Stock', value: lowStockItems.length, color: lowStockItems.length > 0 ? 'error' : 'neutral', icon: AlertTriangle },
          { label: 'Stock Value (Cost)', value: fmtCurrency(totalStockValue), color: 'primary' },
          { label: 'Stock Value (MRP)', value: fmtCurrency(totalSellingValue), color: 'success' },
        ]}
        actions={
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
            <Plus size={16} /> Add Product
          </button>
        }
      />

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">{editProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-light">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Product Name *</label>
                  <input required autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. OPC Cement 50kg" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">SKU</label>
                  <input className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SKU-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                      value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Unit</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                      value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Selling Price (₹)</label>
                  <input type="number" min="0" step="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0" value={form.sellingPrice || ''} onChange={e => setForm(f => ({ ...f, sellingPrice: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Cost Price (₹)</label>
                  <input type="number" min="0" step="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0" value={form.costPrice || ''} onChange={e => setForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">GST Rate (%)</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                      value={form.gstRate} onChange={e => setForm(f => ({ ...f, gstRate: parseInt(e.target.value) }))}>
                      {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Current Stock</label>
                  <input type="number" min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0" value={form.stock || ''} onChange={e => setForm(f => ({ ...f, stock: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Low Stock Alert</label>
                  <input type="number" min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10" value={form.lowStockAlert || ''} onChange={e => setForm(f => ({ ...f, lowStockAlert: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>

              {vendors.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Supplier (Optional)</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                      value={form.supplierId ?? ''} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}>
                      <option value="">None</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                  {editProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
        {/* Low Stock Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Low Stock Alert — {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(p => (
                <span key={p.id} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-lg font-semibold">
                  {p.name}: {p.stock} {p.unit} (alert: {p.lowStockAlert})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48 max-w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {allCategories.map(c => (
              <button key={c}
                onClick={() => setFilterCat(c)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterCat === c ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'}`}>
                {c}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{filtered.length} products</span>
        </div>

        {/* Products Table */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Package size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">No products yet</p>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold">
              <Plus size={15} /> Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selling ₹</th>
                    <th className="text-right px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Margin</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">GST</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(p => {
                    const isLow = p.lowStockAlert > 0 && p.stock <= p.lowStockAlert;
                    const supplier = p.supplierId ? store.parties[p.supplierId] : null;
                    const m = margin(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          {p.sku && <p className="text-xs text-slate-400 font-mono">{p.sku}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">{p.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inlineEdit?.id === p.id && inlineEdit.field === 'stock' ? (
                            <input
                              type="number" min="0" autoFocus
                              className="w-20 px-2 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={inlineEdit.value}
                              onChange={e => setInlineEdit(ie => ie ? { ...ie, value: e.target.value } : null)}
                              onBlur={commitInlineEdit}
                              onKeyDown={e => { if (e.key === 'Enter') commitInlineEdit(); if (e.key === 'Escape') setInlineEdit(null); }}
                            />
                          ) : (
                            <button
                              onClick={() => setInlineEdit({ id: p.id, field: 'stock', value: String(p.stock) })}
                              className={`font-black text-sm flex items-center gap-1 ml-auto ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}
                            >
                              {isLow && <AlertTriangle size={12} />}
                              {p.stock} {p.unit}
                              <Edit2 size={11} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inlineEdit?.id === p.id && inlineEdit.field === 'sellingPrice' ? (
                            <input
                              type="number" min="0" step="0.01" autoFocus
                              className="w-24 px-2 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-right focus:outline-none"
                              value={inlineEdit.value}
                              onChange={e => setInlineEdit(ie => ie ? { ...ie, value: e.target.value } : null)}
                              onBlur={commitInlineEdit}
                              onKeyDown={e => { if (e.key === 'Enter') commitInlineEdit(); if (e.key === 'Escape') setInlineEdit(null); }}
                            />
                          ) : (
                            <button
                              onClick={() => setInlineEdit({ id: p.id, field: 'sellingPrice', value: String(p.sellingPrice) })}
                              className="font-bold text-slate-900 dark:text-white flex items-center gap-1 ml-auto"
                            >
                              {fmtCurrency(p.sellingPrice)}
                              <Edit2 size={11} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-bold ${m >= 20 ? 'text-emerald-600 dark:text-emerald-400' : m >= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {m}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{p.gstRate}%</span>
                        </td>
                        <td className="px-4 py-3">
                          {supplier ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{supplier.name}</span>
                          ) : (
                            <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(p.id)}
                              className={`p-1.5 rounded-lg transition-colors ${deleteConfirm === p.id ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
