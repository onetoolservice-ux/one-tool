"use client";
import React, { useState, useMemo } from 'react';
import { Percent, Plus, Trash2, Download, Copy, Check, FileText } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const GST_SLABS = [0, 5, 12, 18, 28];

const HSN_COMMON: Record<string, { desc: string; rate: number }> = {
  '0101': { desc: 'Live horses, asses, mules', rate: 0 },
  '1001': { desc: 'Wheat and meslin', rate: 0 },
  '2106': { desc: 'Food preparations (misc)', rate: 18 },
  '3004': { desc: 'Medicaments / drugs', rate: 12 },
  '4901': { desc: 'Printed books', rate: 0 },
  '6101': { desc: 'Overcoats / woolen clothing', rate: 5 },
  '8471': { desc: 'Computers / laptops', rate: 18 },
  '8517': { desc: 'Mobile phones', rate: 18 },
  '9401': { desc: 'Seats / chairs', rate: 18 },
  '9403': { desc: 'Furniture', rate: 28 },
};

interface LineItem {
  id: number;
  desc: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
}

type TaxType = 'intra' | 'inter'; // intra = CGST+SGST, inter = IGST
type View = 'calculator' | 'invoice';

function KPI({ label, value, color = '' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-lg font-black truncate ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

export const GstCalculator = () => {
  const [taxType, setTaxType] = useState<TaxType>('intra');
  const [view, setView] = useState<View>('calculator');
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, desc: 'Product / Service 1', hsn: '8471', qty: 2, unit: 'pcs', rate: 25000, gstRate: 18 },
  ]);

  // Invoice metadata
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [sellerName, setSellerName] = useState('Your Company Name');
  const [buyerName, setBuyerName] = useState('Client / Customer');

  const [copied, setCopied] = useState(false);

  const addItem = () => setItems(prev => [...prev, {
    id: Date.now(), desc: 'New Item', hsn: '', qty: 1, unit: 'pcs', rate: 0, gstRate: 18,
  }]);

  const updateItem = (id: number, field: keyof LineItem, value: string | number) =>
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

  const removeItem = (id: number) => {
    if (items.length === 1) { showToast('At least one item is required', 'error'); return; }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const { totals, lines } = useMemo(() => {
    const lines = items.map(item => {
      const taxable = item.qty * item.rate;
      const gstAmt = taxable * item.gstRate / 100;
      const cgst = taxType === 'intra' ? gstAmt / 2 : 0;
      const sgst = taxType === 'intra' ? gstAmt / 2 : 0;
      const igst = taxType === 'inter' ? gstAmt : 0;
      return { ...item, taxable, gstAmt, cgst, sgst, igst, total: taxable + gstAmt };
    });
    const subtotal = lines.reduce((a, l) => a + l.taxable, 0);
    const totalGst = lines.reduce((a, l) => a + l.gstAmt, 0);
    const totalCgst = lines.reduce((a, l) => a + l.cgst, 0);
    const totalSgst = lines.reduce((a, l) => a + l.sgst, 0);
    const totalIgst = lines.reduce((a, l) => a + l.igst, 0);
    const grandTotal = subtotal + totalGst;
    return { lines, totals: { subtotal, totalGst, totalCgst, totalSgst, totalIgst, grandTotal } };
  }, [items, taxType]);

  const copyInvoiceSummary = () => {
    const text = `Invoice: ${invoiceNo}\nSubtotal: ${fmt(totals.subtotal)}\nGST: ${fmt(totals.totalGst)}\nTotal: ${fmt(totals.grandTotal)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportCsv = () => {
    const rows = [['Description', 'HSN', 'Qty', 'Unit', 'Rate', 'Taxable', 'GST%', 'CGST', 'SGST', 'IGST', 'Total']];
    lines.forEach(l => rows.push([l.desc, l.hsn, String(l.qty), l.unit, String(l.rate), String(l.taxable.toFixed(2)),
      `${l.gstRate}%`, String(l.cgst.toFixed(2)), String(l.sgst.toFixed(2)), String(l.igst.toFixed(2)), String(l.total.toFixed(2))]));
    rows.push(['', '', '', '', 'SUBTOTAL', String(totals.subtotal.toFixed(2)), '', '', '', '', '']);
    rows.push(['', '', '', '', 'GST', String(totals.totalGst.toFixed(2)), '', '', '', '', '']);
    rows.push(['', '', '', '', 'GRAND TOTAL', String(totals.grandTotal.toFixed(2)), '', '', '', '', '']);
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `${invoiceNo}-gst.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"><Percent size={18} className="text-orange-500"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">GST Invoice Calculator</h2>
            <p className="text-[11px] text-slate-400">Multi-item · CGST/SGST/IGST · HSN Codes</p>
          </div>
        </div>

        {/* Tax type toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-2">
          <button onClick={() => setTaxType('intra')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${taxType === 'intra' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Intra-State (CGST+SGST)
          </button>
          <button onClick={() => setTaxType('inter')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${taxType === 'inter' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Inter-State (IGST)
          </button>
        </div>

        <div className="flex-1"/>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button onClick={() => setView('calculator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'calculator' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            <Percent size={12} className="inline mr-1"/>Calculator
          </button>
          <button onClick={() => setView('invoice')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${view === 'invoice' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            <FileText size={12} className="inline mr-1"/>Invoice Preview
          </button>
        </div>

        <button onClick={copyInvoiceSummary} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          {copied ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>} Copy
        </button>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors">
          <Download size={12}/> Export CSV
        </button>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-6 py-3 flex-shrink-0 flex-wrap">
        <KPI label="Subtotal (Taxable)" value={fmt(totals.subtotal)}/>
        {taxType === 'intra' ? (
          <>
            <KPI label="CGST" value={fmt(totals.totalCgst)} color="text-orange-500"/>
            <KPI label="SGST" value={fmt(totals.totalSgst)} color="text-orange-500"/>
          </>
        ) : (
          <KPI label="IGST" value={fmt(totals.totalIgst)} color="text-orange-500"/>
        )}
        <KPI label="Total GST" value={fmt(totals.totalGst)} color="text-orange-600"/>
        <KPI label="Grand Total" value={fmt(totals.grandTotal)} color="text-emerald-600"/>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      {view === 'calculator' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: HSN Reference */}
          <div className="w-56 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">HSN Reference</p>
            </div>
            <div className="p-3 space-y-1">
              {Object.entries(HSN_COMMON).map(([hsn, { desc, rate }]) => (
                <button key={hsn} onClick={() => {
                  const last = items[items.length - 1];
                  if (last) updateItem(last.id, 'hsn', hsn);
                  if (last) updateItem(last.id, 'gstRate', rate);
                }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                  <div className="text-[10px] font-bold text-orange-500">{hsn} — {rate}%</div>
                  <div className="text-[10px] text-slate-500 truncate">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main: Line items */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {/* Header row */}
              <div className="grid grid-cols-[2fr_80px_70px_70px_90px_70px_90px_90px_90px_36px] gap-2 mb-2 px-2">
                {['Description', 'HSN', 'Qty', 'Unit', 'Rate (₹)', 'GST %', 'Taxable', taxType === 'intra' ? 'CGST/SGST' : 'IGST', 'Total', ''].map(h => (
                  <span key={h} className="text-[10px] font-bold text-slate-400 uppercase">{h}</span>
                ))}
              </div>

              {/* Line items */}
              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={line.id} className="grid grid-cols-[2fr_80px_70px_70px_90px_70px_90px_90px_90px_36px] gap-2 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2">
                    <input value={line.desc} onChange={e => updateItem(line.id, 'desc', e.target.value)}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-orange-300 outline-none text-slate-700 dark:text-slate-200"/>
                    <div className="relative">
                      <input value={line.hsn} onChange={e => {
                        updateItem(line.id, 'hsn', e.target.value);
                        const h = HSN_COMMON[e.target.value];
                        if (h) updateItem(line.id, 'gstRate', h.rate);
                      }}
                        className="text-xs font-mono px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-orange-300 outline-none w-full text-slate-700 dark:text-slate-200"
                        placeholder="HSN"/>
                    </div>
                    <input type="number" value={line.qty} onChange={e => updateItem(line.id, 'qty', Number(e.target.value))}
                      className="text-xs text-right px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-orange-300 outline-none text-slate-700 dark:text-slate-200" min={0}/>
                    <input value={line.unit} onChange={e => updateItem(line.id, 'unit', e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-orange-300 outline-none text-slate-700 dark:text-slate-200"/>
                    <input type="number" value={line.rate} onChange={e => updateItem(line.id, 'rate', Number(e.target.value))}
                      className="text-xs text-right px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-orange-300 outline-none text-slate-700 dark:text-slate-200" min={0}/>
                    <select value={line.gstRate} onChange={e => updateItem(line.id, 'gstRate', Number(e.target.value))}
                      className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-orange-300 outline-none text-slate-700 dark:text-slate-200">
                      {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                    </select>
                    <span className="text-xs text-right font-mono text-slate-600 dark:text-slate-400 pr-1">{fmt(line.taxable)}</span>
                    {taxType === 'intra' ? (
                      <span className="text-xs text-right font-mono text-orange-500 pr-1">
                        {fmt(line.cgst)}<br/><span className="text-slate-400 text-[10px]">each</span>
                      </span>
                    ) : (
                      <span className="text-xs text-right font-mono text-orange-500 pr-1">{fmt(line.igst)}</span>
                    )}
                    <span className="text-xs text-right font-bold font-mono text-slate-900 dark:text-white pr-1">{fmt(line.total)}</span>
                    <button onClick={() => removeItem(line.id)} className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item */}
              <button onClick={addItem} className="mt-3 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-800 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors w-full justify-center">
                <Plus size={14}/> Add Line Item
              </button>

              {/* Totals */}
              <div className="mt-6 ml-auto max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span><span className="font-mono">{fmt(totals.subtotal)}</span>
                </div>
                {taxType === 'intra' ? (
                  <>
                    <div className="flex justify-between text-xs text-orange-500">
                      <span>CGST</span><span className="font-mono">{fmt(totals.totalCgst)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-orange-500">
                      <span>SGST</span><span className="font-mono">{fmt(totals.totalSgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs text-orange-500">
                    <span>IGST</span><span className="font-mono">{fmt(totals.totalIgst)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 dark:bg-slate-700"/>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                  <span>Grand Total</span><span className="font-mono text-emerald-600">{fmt(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── INVOICE PREVIEW ─────────────────────────────────────────────────── */
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Invoice metadata */}
          <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-5 space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Invoice Details</p>
            {[
              { label: 'Invoice No.', value: invoiceNo, set: setInvoiceNo },
              { label: 'Invoice Date', value: invoiceDate, set: setInvoiceDate, type: 'date' },
              { label: 'Seller / From', value: sellerName, set: setSellerName },
              { label: 'Buyer / To', value: buyerName, set: setBuyerName },
            ].map(({ label, value, set, type }) => (
              <div key={label}>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{label}</label>
                <input type={type || 'text'} value={value} onChange={e => set(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-orange-400"/>
              </div>
            ))}
          </div>

          {/* Invoice preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
              {/* Invoice header */}
              <div className="bg-orange-500 px-8 py-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black">TAX INVOICE</h1>
                    <p className="text-orange-100 text-sm mt-1">{sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{invoiceNo}</p>
                    <p className="text-orange-100 text-sm">{invoiceDate}</p>
                    <span className="mt-1 inline-block text-xs bg-white/20 rounded px-2 py-0.5">
                      {taxType === 'intra' ? 'CGST + SGST' : 'IGST'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-orange-200">Bill To:</span>
                  <span className="ml-2 font-semibold">{buyerName}</span>
                </div>
              </div>

              {/* Items table */}
              <div className="p-6">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-orange-100 dark:border-orange-900/30">
                      <th className="text-left py-2 font-bold text-slate-500 uppercase text-[10px]">#</th>
                      <th className="text-left py-2 font-bold text-slate-500 uppercase text-[10px]">Description</th>
                      <th className="text-left py-2 font-bold text-slate-500 uppercase text-[10px]">HSN</th>
                      <th className="text-right py-2 font-bold text-slate-500 uppercase text-[10px]">Qty</th>
                      <th className="text-right py-2 font-bold text-slate-500 uppercase text-[10px]">Rate</th>
                      <th className="text-right py-2 font-bold text-slate-500 uppercase text-[10px]">Taxable</th>
                      <th className="text-right py-2 font-bold text-slate-500 uppercase text-[10px]">GST</th>
                      <th className="text-right py-2 font-bold text-slate-500 uppercase text-[10px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={line.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2.5 text-slate-400">{i + 1}</td>
                        <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{line.desc}</td>
                        <td className="py-2.5 font-mono text-slate-400">{line.hsn || '—'}</td>
                        <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{line.qty} {line.unit}</td>
                        <td className="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{fmt(line.rate)}</td>
                        <td className="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(line.taxable)}</td>
                        <td className="py-2.5 text-right font-mono text-orange-500">{line.gstRate}% = {fmt(line.gstAmt)}</td>
                        <td className="py-2.5 text-right font-bold font-mono text-slate-900 dark:text-white">{fmt(line.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Invoice totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span><span className="font-mono">{fmt(totals.subtotal)}</span>
                    </div>
                    {taxType === 'intra' ? (
                      <>
                        <div className="flex justify-between text-xs text-orange-500">
                          <span>CGST</span><span className="font-mono">{fmt(totals.totalCgst)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-orange-500">
                          <span>SGST</span><span className="font-mono">{fmt(totals.totalSgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-xs text-orange-500">
                        <span>IGST</span><span className="font-mono">{fmt(totals.totalIgst)}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"/>
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white">
                      <span>Grand Total</span>
                      <span className="font-mono text-emerald-600">{fmt(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-[10px] text-slate-400 text-center">
                  This is a computer-generated invoice preview. {taxType === 'intra' ? 'CGST & SGST applicable (Intra-State supply).' : 'IGST applicable (Inter-State supply).'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
