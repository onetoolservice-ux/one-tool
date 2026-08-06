'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Download, Upload, Package, ChevronDown, AlertTriangle, CheckCircle, X, Search } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate,
  addProduct, updateProduct, deleteProduct,
  fmtCurrency, PRODUCT_CATEGORIES, UNITS, GST_RATES,
  type BizOSStore, type BizProduct,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'catalog' | 'add' | 'import';

const EMPTY_PRODUCT: Omit<BizProduct, 'id' | 'createdAt'> = {
  name: '', sku: '', category: 'Other', unit: 'pcs',
  sellingPrice: 0, costPrice: 0, stock: 0, lowStockAlert: 10, supplierId: '', gstRate: 18,
};

// CSV column targets
const CSV_TARGETS = ['name', 'sku', 'category', 'unit', 'sellingPrice', 'costPrice', 'stock', 'lowStockAlert', 'gstRate', 'skip'] as const;
type CsvTarget = typeof CSV_TARGETS[number];

const TARGET_LABELS: Record<CsvTarget, string> = {
  name: 'Product Name *', sku: 'SKU', category: 'Category', unit: 'Unit',
  sellingPrice: 'Selling Price', costPrice: 'Cost Price', stock: 'Stock Qty',
  lowStockAlert: 'Low Stock Alert', gstRate: 'GST Rate %', skip: '— Skip —',
};

function guessTarget(header: string): CsvTarget {
  const h = header.toLowerCase().trim();
  if (h.includes('name') || h === 'product') return 'name';
  if (h.includes('sku') || h.includes('code')) return 'sku';
  if (h.includes('cat')) return 'category';
  if (h.includes('unit')) return 'unit';
  if (h.includes('sell') || h.includes('mrp') || h.includes('sale')) return 'sellingPrice';
  if (h.includes('cost') || h.includes('purchase') || h.includes('buy')) return 'costPrice';
  if (h.includes('stock') || h.includes('qty') || h.includes('quantity')) return 'stock';
  if (h.includes('alert') || h.includes('min') || h.includes('reorder')) return 'lowStockAlert';
  if (h.includes('gst') || h.includes('tax')) return 'gstRate';
  return 'skip';
}

function parseCSV(text: string): string[][] {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { row.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    row.push(current.trim());
    return row;
  });
}

function exportCSV(products: BizProduct[], parties: BizOSStore['parties']): void {
  const headers = ['Name', 'SKU', 'Category', 'Unit', 'Selling Price', 'Cost Price', 'Stock', 'Low Stock Alert', 'GST Rate', 'Supplier'];
  const rows = products.map(p => [
    p.name, p.sku ?? '', p.category, p.unit,
    p.sellingPrice, p.costPrice, p.stock, p.lowStockAlert,
    p.gstRate, p.supplierId ? (parties[p.supplierId]?.name ?? '') : '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'product-catalog.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────

export function BizProducts() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('catalog');
  const [showStats, setShowStats] = useState(false);
  const [editProduct, setEditProduct] = useState<BizProduct | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: 'stock' | 'sellingPrice'; value: string } | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'stock' | 'sellingPrice' | 'margin' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // CSV import state
  const [csvRaw, setCsvRaw] = useState('');
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<number, CsvTarget>>({});
  const [csvStep, setCsvStep] = useState<1 | 2 | 3>(1);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  if (!store) return null;

  const products = Object.values(store.products);
  const vendors = Object.values(store.parties).filter(p => p.type === 'vendor');
  const lowCount = products.filter(p => p.lowStockAlert > 0 && p.stock <= p.lowStockAlert).length;

  const usedCategories = [...new Set(products.map(p => p.category))].sort();

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
      const matchCat = !categoryFilter || p.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (!sortKey) return a.name.localeCompare(b.name);
      let va: number | string, vb: number | string;
      if (sortKey === 'name') { va = a.name; vb = b.name; }
      else if (sortKey === 'stock') { va = a.stock; vb = b.stock; }
      else if (sortKey === 'sellingPrice') { va = a.sellingPrice; vb = b.sellingPrice; }
      else { va = margin(a); vb = margin(b); }
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  // ── FORM handlers ────────────────────────────────────────────────────────

  function openAdd() {
    setEditProduct(null);
    setForm({ ...EMPTY_PRODUCT });
    setMode('add');
  }

  function openEdit(p: BizProduct) {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku ?? '', category: p.category, unit: p.unit, sellingPrice: p.sellingPrice, costPrice: p.costPrice, stock: p.stock, lowStockAlert: p.lowStockAlert, supplierId: p.supplierId ?? '', gstRate: p.gstRate });
    setMode('add');
  }

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, sku: form.sku?.trim() || undefined, supplierId: form.supplierId || undefined, sellingPrice: Number(form.sellingPrice), costPrice: Number(form.costPrice), stock: Number(form.stock), lowStockAlert: Number(form.lowStockAlert), gstRate: Number(form.gstRate) };
    if (editProduct) { updateProduct(editProduct.id, data); } else { addProduct(data); }
    setMode('catalog');
    setEditProduct(null);
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) { deleteProduct(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  }

  function commitInline() {
    if (!inlineEdit) return;
    const val = parseFloat(inlineEdit.value);
    if (!isNaN(val) && val >= 0) updateProduct(inlineEdit.id, { [inlineEdit.field]: val });
    setInlineEdit(null);
  }

  // ── CSV import handlers ────────────────────────────────────────────────────

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setCsvRaw(ev.target?.result as string); };
    reader.readAsText(file);
  }

  function parseAndProceed() {
    if (!csvRaw.trim()) return;
    const rows = parseCSV(csvRaw);
    if (rows.length < 2) return;
    const [headers, ...data] = rows;
    setCsvHeaders(headers);
    setCsvRows(data);
    const mapping: Record<number, CsvTarget> = {};
    headers.forEach((h, i) => { mapping[i] = guessTarget(h); });
    setCsvMapping(mapping);
    setCsvStep(2);
  }

  function buildPreviewRows() {
    return csvRows.slice(0, 10).map(row => {
      const obj: Record<string, string> = {};
      Object.entries(csvMapping).forEach(([i, target]) => {
        if (target !== 'skip') obj[target] = row[parseInt(i)] ?? '';
      });
      return { ...obj, _valid: !!obj.name } as Record<string, string | boolean> & { _valid: boolean };
    });
  }

  function handleImport() {
    const nameColIdx = Object.entries(csvMapping).find(([, v]) => v === 'name')?.[0];
    if (nameColIdx === undefined) return;
    let imported = 0, skipped = 0;
    csvRows.forEach(row => {
      const obj: Record<string, string> = {};
      Object.entries(csvMapping).forEach(([i, target]) => {
        if (target !== 'skip') obj[target] = row[parseInt(i)]?.trim() ?? '';
      });
      if (!obj.name) { skipped++; return; }
      addProduct({
        name: obj.name,
        sku: obj.sku || undefined,
        category: obj.category || 'Other',
        unit: obj.unit || 'pcs',
        sellingPrice: parseFloat(obj.sellingPrice) || 0,
        costPrice: parseFloat(obj.costPrice) || 0,
        stock: parseFloat(obj.stock) || 0,
        lowStockAlert: parseFloat(obj.lowStockAlert) || 10,
        gstRate: parseFloat(obj.gstRate) || 18,
        supplierId: undefined,
      });
      imported++;
    });
    setImportResult({ imported, skipped });
    setCsvStep(3);
  }

  function resetImport() {
    setCsvRaw(''); setCsvRows([]); setCsvHeaders([]); setCsvMapping({}); setCsvStep(1); setImportResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const margin = (p: BizProduct) => p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100) : 0;

  // Live preview for Add/Edit form
  const previewMargin = form.sellingPrice > 0 ? Math.round(((form.sellingPrice - form.costPrice) / form.sellingPrice) * 100) : 0;
  const previewGstAmt = Math.round(form.sellingPrice * (form.gstRate / 100));
  const previewPriceInclGst = form.sellingPrice + previewGstAmt;

  // Preview rows for step 2
  const previewRows = csvStep === 2 ? buildPreviewRows() : [];
  const importableCount = csvRows.filter(row => {
    const nameColIdx = Object.entries(csvMapping).find(([, v]) => v === 'name')?.[0];
    return nameColIdx !== undefined && row[parseInt(nameColIdx)]?.trim();
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth sticky
        title="Product Catalog"
        subtitle="Add · Edit · Bulk Import · Export"
        kpis={showStats ? [
          { label: 'Total Products', value: products.length, color: 'neutral', icon: Package },
          { label: 'Low Stock', value: lowCount, color: lowCount > 0 ? 'error' : 'neutral', icon: AlertTriangle },
          { label: 'Stock Value (MRP)', value: fmtCurrency(products.reduce((s, p) => s + p.stock * p.sellingPrice, 0)), color: 'success' },
          { label: 'Stock Value (Cost)', value: fmtCurrency(products.reduce((s, p) => s + p.stock * p.costPrice, 0)), color: 'primary' },
        ] : undefined}
        actions={
          <div className="flex gap-2 items-center">
            {/* Mode tabs — SAP blue style, right-aligned */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5 border border-slate-200 dark:border-slate-700">
              {([
                { key: 'catalog', label: 'Catalog' },
                { key: 'add', label: editProduct ? 'Edit Product' : 'Add Product' },
                { key: 'import', label: 'Bulk Import' },
              ] as { key: Mode; label: string }[]).map(opt => (
                <button key={opt.key}
                  onClick={() => { setMode(opt.key); if (opt.key !== 'add') setEditProduct(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === opt.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStats(s => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                showStats
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {showStats ? 'Hide Stats' : 'View Stats'}
            </button>
            <button
              onClick={mode === 'catalog' ? () => exportCSV(products, store.parties) : undefined}
              disabled={mode !== 'catalog'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                mode === 'catalog'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed'
              }`}>
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={mode === 'catalog' ? openAdd : undefined}
              disabled={mode !== 'catalog'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'catalog'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}>
              <Plus size={16} /> Add Product
            </button>
          </div>
        }
      />

      {/* ── MODE: CATALOG ─────────────────────────────────────────────────── */}
      {mode === 'catalog' && (
        <div className="flex flex-col h-[calc(100vh-140px)]">

          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-3 flex-wrap shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                className="pl-8 pr-3 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Category chips */}
            <div className="flex gap-1.5 overflow-x-auto flex-1">
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${!categoryFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                All
              </button>
              {usedCategories.map(cat => (
                <button key={cat}
                  onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0 ml-auto">
              {filtered.length} of {products.length}
            </span>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-center px-6">
              <Package size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                {products.length === 0 ? 'No products yet' : 'No products match your filters'}
              </p>
              {products.length === 0 && (
                <div className="flex gap-3 justify-center">
                  <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold">
                    <Plus size={15} /> Add Manually
                  </button>
                  <button onClick={() => setMode('import')} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Upload size={15} /> Import CSV
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    {/* Sortable: Product */}
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        Product {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="text-slate-300 dark:text-slate-600">↕</span>}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    {/* Sortable: Stock */}
                    <th className="px-4 py-3 text-right">
                      <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-auto">
                        Stock {sortKey === 'stock' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="text-slate-300 dark:text-slate-600">↕</span>}
                      </button>
                    </th>
                    {/* Sortable: Selling */}
                    <th className="px-4 py-3 text-right">
                      <button onClick={() => toggleSort('sellingPrice')} className="flex items-center gap-1 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-auto">
                        Selling ₹ {sortKey === 'sellingPrice' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="text-slate-300 dark:text-slate-600">↕</span>}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cost ₹</th>
                    {/* Sortable: Margin */}
                    <th className="px-4 py-3 text-right">
                      <button onClick={() => toggleSort('margin')} className="flex items-center gap-1 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-auto">
                        Margin {sortKey === 'margin' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="text-slate-300 dark:text-slate-600">↕</span>}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">GST</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(p => {
                    const isLow = p.lowStockAlert > 0 && p.stock <= p.lowStockAlert;
                    const supplier = p.supplierId ? store.parties[p.supplierId] : null;
                    const m = margin(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 group transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white leading-snug">{p.name}</p>
                          {p.sku && <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.sku}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">{p.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inlineEdit?.id === p.id && inlineEdit.field === 'stock' ? (
                            <input type="number" min="0" autoFocus
                              className="w-20 px-2 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-right focus:outline-none"
                              value={inlineEdit.value}
                              onChange={e => setInlineEdit(ie => ie ? { ...ie, value: e.target.value } : null)}
                              onBlur={commitInline}
                              onKeyDown={e => { if (e.key === 'Enter') commitInline(); if (e.key === 'Escape') setInlineEdit(null); }} />
                          ) : (
                            <button onClick={() => setInlineEdit({ id: p.id, field: 'stock', value: String(p.stock) })}
                              className={`font-black text-sm flex items-center gap-1 ml-auto group/cell ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                              {isLow && <AlertTriangle size={11} />}
                              {p.stock} {p.unit}
                              <Edit2 size={10} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inlineEdit?.id === p.id && inlineEdit.field === 'sellingPrice' ? (
                            <input type="number" min="0" step="0.01" autoFocus
                              className="w-24 px-2 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-right focus:outline-none"
                              value={inlineEdit.value}
                              onChange={e => setInlineEdit(ie => ie ? { ...ie, value: e.target.value } : null)}
                              onBlur={commitInline}
                              onKeyDown={e => { if (e.key === 'Enter') commitInline(); if (e.key === 'Escape') setInlineEdit(null); }} />
                          ) : (
                            <button onClick={() => setInlineEdit({ id: p.id, field: 'sellingPrice', value: String(p.sellingPrice) })}
                              className="font-bold text-slate-900 dark:text-white flex items-center gap-1 ml-auto">
                              {fmtCurrency(p.sellingPrice)}<Edit2 size={10} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium">{fmtCurrency(p.costPrice)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${m >= 20 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : m >= 10 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>{m}%</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{p.gstRate}%</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{supplier?.name ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 size={13} /></button>
                            <button onClick={() => handleDelete(p.id)}
                              className={`p-1.5 rounded-lg transition-colors ${deleteConfirm === p.id ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODE: ADD / EDIT + IMPORT ────────────────────────────────────── */}
      <div className={mode !== 'catalog' ? 'p-4 lg:p-6' : ''}>

        {/* ── MODE: ADD / EDIT ──────────────────────────────────────────────── */}
        {mode === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start w-full">

            {/* ── Form (left 3 cols) ─────────────────────────────────────────── */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              {editProduct && (
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-1.5">
                  <Edit2 size={12} /> Editing: <span className="font-black">{editProduct.name}</span>
                </p>
              )}
              <form onSubmit={handleSubmitForm} className="space-y-5">

                {/* Name + SKU */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input required autoFocus
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="OPC Cement 50kg" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">SKU</label>
                    <input
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CEM-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                  </div>
                </div>

                {/* Category + Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Category</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Unit</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Selling Price + Cost Price + GST */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Selling Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none">₹</span>
                      <input type="number" min="0" step="0.01"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="400" value={form.sellingPrice || ''} onChange={e => setForm(f => ({ ...f, sellingPrice: parseFloat(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Cost Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none">₹</span>
                      <input type="number" min="0" step="0.01"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="350" value={form.costPrice || ''} onChange={e => setForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">GST %</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        value={form.gstRate} onChange={e => setForm(f => ({ ...f, gstRate: parseInt(e.target.value) }))}>
                        {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Stock + Low Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Opening Stock</label>
                    <input type="number" min="0"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0" value={form.stock || ''} onChange={e => setForm(f => ({ ...f, stock: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Low Stock Alert</label>
                    <input type="number" min="0"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10" value={form.lowStockAlert || ''} onChange={e => setForm(f => ({ ...f, lowStockAlert: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>

                {/* Supplier */}
                {vendors.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Supplier (Optional)</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        value={form.supplierId ?? ''} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}>
                        <option value="">None</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => { setMode('catalog'); setEditProduct(null); }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    {editProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Live Preview (right 2 cols) ────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4 sticky top-24">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Live Preview</p>
                {form.name ? (
                  <>
                    <div className="mb-5">
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{form.name}</p>
                      {form.sku && <p className="text-xs font-mono text-slate-400 mt-1">{form.sku}</p>}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">{form.category}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">{form.unit}</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Selling Price</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtCurrency(form.sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Cost Price</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtCurrency(form.costPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Gross Margin</span>
                        <span className={`text-sm font-black ${previewMargin >= 20 ? 'text-emerald-600 dark:text-emerald-400' : previewMargin >= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {previewMargin}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">GST ({form.gstRate}%)</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">+{fmtCurrency(previewGstAmt)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 mt-1">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Price incl. GST</span>
                        <span className="text-base font-black text-blue-700 dark:text-blue-300">{fmtCurrency(previewPriceInclGst)}</span>
                      </div>
                    </div>
                    {(form.stock > 0 || form.lowStockAlert > 0) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Stock: <strong className="text-slate-700 dark:text-slate-200">{form.stock} {form.unit}</strong>
                          {form.lowStockAlert > 0 && <> · Alert at <strong className="text-amber-600 dark:text-amber-400">{form.lowStockAlert}</strong></>}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Package size={36} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Fill the form to preview your product</p>
                  </div>
                )}
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-4">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2">Quick Tips</p>
                <ul className="text-xs text-amber-700 dark:text-amber-300/80 space-y-1.5">
                  <li>• SKU helps with barcode scanning & CSV import</li>
                  <li>• GST rate auto-fills when adding to invoices</li>
                  <li>• Set Low Stock Alert to track reorder point</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE: BULK IMPORT ─────────────────────────────────────────────── */}
        {mode === 'import' && (
          <div className="w-full space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-2">
              {([1, 2, 3] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${csvStep >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {csvStep > s ? <CheckCircle size={14} /> : s}
                  </div>
                  <span className={`text-xs font-semibold ${csvStep === s ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {['Upload CSV', 'Map Columns', 'Import'][i]}
                  </span>
                  {i < 2 && <div className="w-8 h-px bg-slate-200 dark:bg-slate-700" />}
                </div>
              ))}
            </div>

            {/* Step 1: Upload */}
            {csvStep === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Upload a CSV file</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">First row should be headers. Columns can be in any order.</p>
                </div>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={24} className="text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Click to upload CSV</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">or paste CSV text below</p>
                  <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Or paste CSV text</p>
                  <textarea
                    className="w-full h-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={'Name,SKU,Selling Price,Stock\n"OPC Cement 50kg","CEM-001",450,200\n"Steel Rod 12mm","ROD-012",85,500'}
                    value={csvRaw}
                    onChange={e => setCsvRaw(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setMode('catalog')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold">Cancel</button>
                  <button onClick={parseAndProceed} disabled={!csvRaw.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-bold transition-colors">
                    Next: Map Columns →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Column Mapping */}
            {csvStep === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">Map columns to product fields</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{csvRows.length} rows detected. At minimum, map the "Product Name" column.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {csvHeaders.map((header, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1 truncate">{header}</span>
                      <span className="text-slate-400 text-xs">→</span>
                      <div className="relative">
                        <select
                          className="pl-2 pr-6 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                          value={csvMapping[i] ?? 'skip'}
                          onChange={e => setCsvMapping(m => ({ ...m, [i]: e.target.value as CsvTarget }))}
                        >
                          {CSV_TARGETS.map(t => <option key={t} value={t}>{TARGET_LABELS[t]}</option>)}
                        </select>
                        <ChevronDown size={11} className="absolute right-1.5 top-2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview table */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview (first 10 rows)</p>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          {Object.entries(csvMapping).filter(([, v]) => v !== 'skip').map(([i, target]) => (
                            <th key={i} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">{TARGET_LABELS[target]}</th>
                          ))}
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">Valid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {previewRows.map((row, i) => (
                          <tr key={i} className={row._valid ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                            {Object.entries(csvMapping).filter(([, v]) => v !== 'skip').map(([col, target]) => (
                              <td key={col} className="px-3 py-1.5 text-slate-700 dark:text-slate-300 truncate max-w-24">{(row as Record<string, string>)[target] || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                            ))}
                            <td className="px-3 py-1.5">{row._valid ? <CheckCircle size={13} className="text-emerald-500" /> : <X size={13} className="text-red-500" />}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <strong>{importableCount}</strong> of <strong>{csvRows.length}</strong> rows will be imported. {csvRows.length - importableCount > 0 && <span className="text-amber-600 dark:text-amber-400">{csvRows.length - importableCount} will be skipped (missing name).</span>}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setCsvStep(1)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold">← Back</button>
                  <button onClick={handleImport} disabled={importableCount === 0}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-bold transition-colors">
                    Import {importableCount} Products
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {csvStep === 3 && importResult && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Import Complete!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                  <strong className="text-emerald-600 dark:text-emerald-400">{importResult.imported} products</strong> imported successfully.
                </p>
                {importResult.skipped > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">{importResult.skipped} rows skipped (missing name).</p>
                )}
                <div className="flex gap-3 justify-center mt-6">
                  <button onClick={resetImport}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold">Import More</button>
                  <button onClick={() => { resetImport(); setMode('catalog'); }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    View Catalog →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
