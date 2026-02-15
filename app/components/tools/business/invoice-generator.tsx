"use client";
import React, { useState, useRef, useMemo } from 'react';
import { FileText, Plus, Trash2, Download, Upload, PenTool, X, Settings2, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';

const CURRENCIES = ['₹', '$', '€', '£', '¥'];
const GST_SLABS = [0, 5, 12, 18, 28];
type TaxMode = 'none' | 'inclusive' | 'exclusive';
type TaxType = 'gst' | 'vat';

interface LineItem { id: number; name: string; qty: number; rate: number; gstRate: number; }

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-8 text-xs px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-400 transition-all font-medium text-slate-800 dark:text-white"/>
    </div>
  );
}

export const InvoiceGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('₹');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [taxMode, setTaxMode] = useState<TaxMode>('exclusive');
  const [taxType, setTaxType] = useState<TaxType>('gst');
  const [gstType, setGstType] = useState<'intra' | 'inter'>('intra');
  const [discountRate, setDiscountRate] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState('Thank you for your business!');
  const [terms, setTerms] = useState('Payment due within 30 days.');
  const previewRef = useRef<HTMLDivElement>(null);

  const [meta, setMeta] = useState({
    number: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    due: '',
    po: '',
  });
  const [from, setFrom] = useState({ name: 'OneTool Inc.', gstin: '', email: 'billing@onetool.com', address: 'Bangalore, Karnataka - 560001', phone: '' });
  const [to, setTo] = useState({ name: 'Acme Corp', gstin: '', email: 'accounts@acme.com', address: 'Mumbai, Maharashtra - 400001', phone: '' });
  const [items, setItems] = useState<LineItem[]>([{ id: 1, name: 'Professional Services', qty: 1, rate: 50000, gstRate: 18 }]);

  const { subtotal, discountAmt, taxableAmt, cgst, sgst, igst, totalTax, grandTotal } = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
    const discountAmt = (subtotal * discountRate) / 100;
    const taxableAmt = subtotal - discountAmt;
    const totalTax = taxMode === 'none' ? 0 : items.reduce((s, i) => {
      const lineAmt = i.qty * i.rate * (1 - discountRate / 100);
      return s + lineAmt * i.gstRate / 100;
    }, 0);
    const cgst = gstType === 'intra' ? totalTax / 2 : 0;
    const sgst = gstType === 'intra' ? totalTax / 2 : 0;
    const igst = gstType === 'inter' ? totalTax : 0;
    const grandTotal = taxableAmt + totalTax + Number(shipping);
    return { subtotal, discountAmt, taxableAmt, cgst, sgst, igst, totalTax, grandTotal };
  }, [items, discountRate, shipping, taxMode, gstType]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'sign') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Upload JPG, PNG or WebP', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    const url = URL.createObjectURL(file);
    if (type === 'logo') setLogo(url); else setSignature(url);
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    if (!items.some(i => i.name && i.qty > 0)) {
      showToast('Add at least one valid line item', 'error'); return;
    }
    setLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`Invoice_${meta.number}.pdf`);
      showToast('PDF downloaded', 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || 'PDF generation failed', 'error');
    } finally { setLoading(false); }
  };

  const clearAll = () => {
    setItems([{ id: 1, name: '', qty: 1, rate: 0, gstRate: 18 }]);
    setLogo(null); setSignature(null);
    setMeta({ number: 'INV-001', date: new Date().toISOString().split('T')[0], due: '', po: '' });
    setFrom({ name: '', gstin: '', email: '', address: '', phone: '' });
    setTo({ name: '', gstin: '', email: '', address: '', phone: '' });
    showToast('Cleared', 'success');
  };

  const fmt = (n: number) => `${currency} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      {/* ── LEFT: EDITOR ──────────────────────────────────────────────────── */}
      <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><FileText size={15} className="text-blue-600"/></div>
          <div className="flex-1">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Invoice Studio Pro</h2>
            <p className="text-[10px] text-slate-400">GST · CGST/SGST · PDF Export</p>
          </div>
          <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none" title="Brand color"/>
          <button onClick={clearAll} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"><RotateCcw size={13}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Branding */}
          <div className="grid grid-cols-2 gap-3">
            <label className="h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {logo ? <img src={logo} className="h-full object-contain p-1 rounded-xl"/> : <><Upload size={14} className="text-slate-400"/><span className="text-[10px] text-slate-400 mt-1">Upload Logo</span></>}
              <input type="file" className="hidden" accept="image/*" onChange={e => handleImage(e, 'logo')}/>
            </label>
            <label className="h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {signature ? <img src={signature} className="h-full object-contain p-1 rounded-xl"/> : <><PenTool size={14} className="text-slate-400"/><span className="text-[10px] text-slate-400 mt-1">Signature</span></>}
              <input type="file" className="hidden" accept="image/*" onChange={e => handleImage(e, 'sign')}/>
            </label>
          </div>

          {/* Invoice meta */}
          <div className="grid grid-cols-2 gap-2">
            <Field label="Invoice #" value={meta.number} onChange={v => setMeta(p => ({ ...p, number: v }))}/>
            <Field label="Date" type="date" value={meta.date} onChange={v => setMeta(p => ({ ...p, date: v }))}/>
            <Field label="Due Date" type="date" value={meta.due} onChange={v => setMeta(p => ({ ...p, due: v }))}/>
            <Field label="PO Number" value={meta.po} onChange={v => setMeta(p => ({ ...p, po: v }))} placeholder="Optional"/>
          </div>

          {/* Currency */}
          <div className="flex gap-1">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${currency === c ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>{c}</button>
            ))}
          </div>

          {/* From / To */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-black text-blue-500 uppercase">From (Seller)</p>
            <Field label="Company Name" value={from.name} onChange={v => setFrom(p => ({ ...p, name: v }))}/>
            <div className="grid grid-cols-2 gap-2">
              <Field label="GSTIN" value={from.gstin} onChange={v => setFrom(p => ({ ...p, gstin: v }))} placeholder="15-digit GSTIN"/>
              <Field label="Phone" value={from.phone} onChange={v => setFrom(p => ({ ...p, phone: v }))}/>
            </div>
            <Field label="Email" value={from.email} onChange={v => setFrom(p => ({ ...p, email: v }))}/>
            <Field label="Address" value={from.address} onChange={v => setFrom(p => ({ ...p, address: v }))}/>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-black text-emerald-500 uppercase">Bill To (Buyer)</p>
            <Field label="Company / Client Name" value={to.name} onChange={v => setTo(p => ({ ...p, name: v }))}/>
            <div className="grid grid-cols-2 gap-2">
              <Field label="GSTIN" value={to.gstin} onChange={v => setTo(p => ({ ...p, gstin: v }))} placeholder="Optional"/>
              <Field label="Phone" value={to.phone} onChange={v => setTo(p => ({ ...p, phone: v }))}/>
            </div>
            <Field label="Email" value={to.email} onChange={v => setTo(p => ({ ...p, email: v }))}/>
            <Field label="Address" value={to.address} onChange={v => setTo(p => ({ ...p, address: v }))}/>
          </div>

          {/* Tax settings */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tax Settings</p>
            <div className="flex gap-1">
              {(['none', 'exclusive', 'inclusive'] as TaxMode[]).map(m => (
                <button key={m} onClick={() => setTaxMode(m)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${taxMode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{m === 'none' ? 'No Tax' : m}</button>
              ))}
            </div>
            {taxMode !== 'none' && (
              <div className="flex gap-1">
                <button onClick={() => setGstType('intra')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${gstType === 'intra' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Intra (CGST+SGST)</button>
                <button onClick={() => setGstType('inter')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${gstType === 'inter' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Inter (IGST)</button>
              </div>
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Line Items</p>
              <button onClick={() => setItems(p => [...p, { id: Date.now(), name: '', qty: 1, rate: 0, gstRate: 18 }])}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <Plus size={10}/> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex gap-1.5 items-center mb-1.5">
                    <input value={item.name} onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))}
                      className="flex-1 h-7 text-xs px-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-400 font-semibold text-slate-800 dark:text-white" placeholder="Item / Service"/>
                    <button onClick={() => { if (items.length > 1) setItems(p => p.filter(x => x.id !== item.id)); }}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={11}/>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold">QTY</span>
                      <input type="number" value={item.qty} min={0}
                        onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, qty: Number(e.target.value) } : x))}
                        className="w-full h-7 text-xs text-right px-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-400 text-slate-800 dark:text-white"/>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold">RATE ({currency})</span>
                      <input type="number" value={item.rate} min={0}
                        onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, rate: Number(e.target.value) } : x))}
                        className="w-full h-7 text-xs text-right px-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-400 text-slate-800 dark:text-white"/>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold">GST %</span>
                      <select value={item.gstRate}
                        onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, gstRate: Number(e.target.value) } : x))}
                        className="w-full h-7 text-xs px-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none text-slate-800 dark:text-white">
                        {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other charges */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Discount %</label>
              <input type="number" value={discountRate} min={0} max={100}
                onChange={e => setDiscountRate(Number(e.target.value))}
                className="w-full h-8 text-xs text-right px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-400 text-slate-800 dark:text-white"/>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Shipping ({currency})</label>
              <input type="number" value={shipping} min={0}
                onChange={e => setShipping(Number(e.target.value))}
                className="w-full h-8 text-xs text-right px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-400 text-slate-800 dark:text-white"/>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none resize-none text-slate-700 dark:text-slate-200"/>
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Terms & Conditions</label>
            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2}
              className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none resize-none text-slate-700 dark:text-slate-200"/>
          </div>
        </div>

        {/* Download button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={downloadPDF} disabled={loading}
            className="w-full h-10 rounded-xl font-bold text-xs flex justify-center items-center gap-2 text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: brandColor }}>
            {loading ? 'Generating...' : <><Download size={14}/> Download PDF</>}
          </button>
        </div>
      </div>

      {/* ── RIGHT: PREVIEW ──────────────────────────────────────────────────── */}
      <div className="flex-1 bg-slate-200/60 dark:bg-black/40 p-6 flex justify-center overflow-y-auto">
        <div className="shadow-2xl my-2">
          <div ref={previewRef} className="bg-white text-slate-900 w-[794px] min-h-[1123px] p-10 flex flex-col text-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-5 border-b-2" style={{ borderColor: brandColor }}>
              <div>
                {logo && <img src={logo} className="h-14 w-auto object-contain mb-2"/>}
                <h2 className="font-bold text-lg text-slate-900">{from.name}</h2>
                {from.gstin && <p className="text-xs text-slate-500">GSTIN: {from.gstin}</p>}
                <p className="text-xs text-slate-500 mt-1">{from.address}</p>
                {from.email && <p className="text-xs text-slate-500">{from.email}</p>}
                {from.phone && <p className="text-xs text-slate-500">{from.phone}</p>}
              </div>
              <div className="text-right">
                <h1 className="text-5xl font-black tracking-wider" style={{ color: brandColor }}>INVOICE</h1>
                <p className="text-slate-400 font-semibold mt-1">#{meta.number}</p>
                <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                  <p>Date: <strong className="text-slate-700">{meta.date}</strong></p>
                  {meta.due && <p>Due: <strong className="text-slate-700">{meta.due}</strong></p>}
                  {meta.po && <p>PO#: <strong className="text-slate-700">{meta.po}</strong></p>}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="flex justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill To</p>
                <h3 className="font-bold text-base text-slate-900">{to.name}</h3>
                {to.gstin && <p className="text-xs text-slate-500">GSTIN: {to.gstin}</p>}
                <p className="text-xs text-slate-500">{to.address}</p>
                {to.email && <p className="text-xs text-slate-500">{to.email}</p>}
              </div>
              {taxMode !== 'none' && (
                <div className="text-right">
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {gstType === 'intra' ? 'CGST + SGST (Intra-State)' : 'IGST (Inter-State)'}
                  </span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full mb-6">
              <thead>
                <tr className="text-left border-b-2" style={{ borderColor: brandColor }}>
                  <th className="py-2 text-xs font-black text-slate-500 uppercase w-8">#</th>
                  <th className="py-2 text-xs font-black text-slate-500 uppercase">Description</th>
                  <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-16">Qty</th>
                  <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-28">Rate</th>
                  {taxMode !== 'none' && <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-16">GST</th>}
                  <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const lineTotal = item.qty * item.rate;
                  return (
                    <tr key={item.id} className="border-b border-slate-50">
                      <td className="py-3 text-slate-400 text-sm">{i + 1}</td>
                      <td className="py-3 font-semibold">{item.name}</td>
                      <td className="py-3 text-right text-slate-600">{item.qty}</td>
                      <td className="py-3 text-right text-slate-600">{fmt(item.rate)}</td>
                      {taxMode !== 'none' && <td className="py-3 text-right text-orange-500 text-xs">{item.gstRate}%</td>}
                      <td className="py-3 text-right font-bold">{fmt(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-auto">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-sm text-orange-500">
                    <span>Discount ({discountRate}%)</span><span className="font-mono">−{fmt(discountAmt)}</span>
                  </div>
                )}
                {taxMode !== 'none' && gstType === 'intra' && (
                  <>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>CGST</span><span className="font-mono">{fmt(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>SGST</span><span className="font-mono">{fmt(sgst)}</span>
                    </div>
                  </>
                )}
                {taxMode !== 'none' && gstType === 'inter' && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>IGST</span><span className="font-mono">{fmt(igst)}</span>
                  </div>
                )}
                {Number(shipping) > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span><span className="font-mono">{fmt(Number(shipping))}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black border-t-2 pt-3" style={{ borderColor: brandColor, color: brandColor }}>
                  <span>TOTAL</span><span className="font-mono">{fmt(grandTotal)}</span>
                </div>
                {signature && <img src={signature} className="h-12 w-auto object-contain ml-auto mt-4"/>}
              </div>
            </div>

            {/* Notes & Terms */}
            {(notes || terms) && (
              <div className="mt-10 pt-4 border-t border-slate-100 grid grid-cols-2 gap-6">
                {notes && <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Notes</p><p className="text-xs text-slate-500">{notes}</p></div>}
                {terms && <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Terms & Conditions</p><p className="text-xs text-slate-500">{terms}</p></div>}
              </div>
            )}

            <p className="mt-auto pt-4 text-center text-[10px] text-slate-300 border-t border-slate-50">Generated by OneTool · Invoice #{meta.number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
