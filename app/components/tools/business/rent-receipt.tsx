"use client";
import React, { useState, useRef, useMemo } from 'react';
import {
  Download, FileText, Home, User, Building, Calendar,
  CreditCard, Hash, Info, RefreshCw, Copy
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { logger } from '@/app/lib/utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────
type PayMode = 'Cash' | 'NEFT/IMPS' | 'UPI' | 'Cheque' | 'Bank Transfer';

interface ReceiptData {
  tenantName: string;
  landlordName: string;
  landlordPan: string;
  amount: string;
  address: string;
  city: string;
  startMonth: string;         // YYYY-MM
  payMode: PayMode;
  txnRef: string;             // UPI/NEFT ref or cheque no
  receiptPrefix: string;      // e.g. "RR"
  showHraInfo: boolean;
}

// ─── Number-to-words (Indian) ─────────────────────────────────────────────────
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function numWords(n: number): string {
  if (n === 0) return 'Zero';
  const r = (x: number): string => {
    if (x === 0) return '';
    if (x < 20) return ONES[x] + ' ';
    if (x < 100) return TENS[Math.floor(x / 10)] + (x % 10 ? ' ' + ONES[x % 10] : '') + ' ';
    if (x < 1000) return ONES[Math.floor(x / 100)] + ' Hundred ' + r(x % 100);
    if (x < 100000) return r(Math.floor(x / 1000)) + 'Thousand ' + r(x % 1000);
    if (x < 10000000) return r(Math.floor(x / 100000)) + 'Lakh ' + r(x % 100000);
    return r(Math.floor(x / 10000000)) + 'Crore ' + r(x % 10000000);
  };
  return r(Math.round(n)).trim();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const RentReceiptGenerator = () => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<ReceiptData>({
    tenantName: 'Arjun Kumar',
    landlordName: 'Rajesh Sharma',
    landlordPan: 'ABCDE1234F',
    amount: '18500',
    address: 'Flat 402, Green Valley Apartments, Koramangala',
    city: 'Bangalore – 560034',
    startMonth: new Date().toISOString().slice(0, 7),
    payMode: 'NEFT/IMPS',
    txnRef: '',
    receiptPrefix: 'RR',
    showHraInfo: true,
  });

  const receiptRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof ReceiptData, v: string | boolean) => setData(prev => ({ ...prev, [k]: v }));

  // ── Generate months list ────────────────────────────────────────────────────
  const months = useMemo(() => {
    const count = mode === 'batch' ? 12 : 1;
    const result: { label: string; yearMonth: string }[] = [];
    try {
      let d = new Date(data.startMonth + '-01');
      if (isNaN(d.getTime())) d = new Date();
      d.setDate(1);
      for (let i = 0; i < count; i++) {
        result.push({
          label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
          yearMonth: d.toISOString().slice(0, 7),
        });
        d.setMonth(d.getMonth() + 1);
      }
    } catch { result.push({ label: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), yearMonth: data.startMonth }); }
    return result;
  }, [data.startMonth, mode]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const rentAmt = Number(data.amount) || 0;
  const annualRent = rentAmt * 12;
  const hraExempt80gg = Math.min(rentAmt * 12, rentAmt * 12 - 0.1 * 600000);
  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const kpis = [
    { label: 'Monthly Rent', val: `₹${fmt(rentAmt)}`, sub: data.payMode, color: 'text-blue-600' },
    { label: 'Annual Rent', val: `₹${fmt(annualRent)}`, sub: `${months.length} receipt${months.length > 1 ? 's' : ''}`, color: 'text-emerald-600' },
    { label: 'HRA Exemption (approx)', val: `₹${fmt(Math.max(0, hraExempt80gg))}`, sub: 'Subject to actual HRA limits', color: 'text-violet-600' },
    { label: 'PAN Required?', val: rentAmt > 8333 ? 'YES' : 'Not Required', sub: rentAmt > 8333 ? 'Rent > ₹8,333/mo' : 'Rent ≤ ₹8,333/mo', color: rentAmt > 8333 ? 'text-rose-600' : 'text-slate-500' },
  ];

  // ── PDF Download ────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    if (!rentAmt) return showToast('Enter a valid rent amount', 'error');
    setLoading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();

      if (mode === 'single') {
        const h = (canvas.height * pw) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pw, h);
      } else {
        // Paginate for batch
        const totalH = (canvas.height * pw) / canvas.width;
        const pages = Math.ceil(totalH / ph);
        for (let p = 0; p < pages; p++) {
          if (p > 0) pdf.addPage();
          const srcY = (p * ph * canvas.width) / pw;
          const srcH = Math.min(canvas.height - srcY, (ph * canvas.width) / pw);
          const pc = document.createElement('canvas');
          pc.width = canvas.width; pc.height = srcH;
          pc.getContext('2d')?.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          pdf.addImage(pc.toDataURL('image/png'), 'PNG', 0, 0, pw, (srcH * pw) / canvas.width);
        }
      }
      pdf.save(`Rent_Receipts_${data.tenantName.replace(/\s+/g, '_')}.pdf`);
      showToast('PDF downloaded successfully', 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || 'PDF generation failed', 'error');
      logger.error('PDF error:', err);
    } finally { setLoading(false); }
  };

  const copyText = () => {
    const text = months.map((m, i) => [
      `Receipt No: ${data.receiptPrefix}-${String(i + 1).padStart(3, '0')}`,
      `Month: ${m.label}`,
      `Tenant: ${data.tenantName}`,
      `Amount: ₹${fmt(rentAmt)}`,
      `Payment Mode: ${data.payMode}${data.txnRef ? ` (Ref: ${data.txnRef})` : ''}`,
      `Address: ${data.address}, ${data.city}`,
      `Landlord: ${data.landlordName} | PAN: ${data.landlordPan}`,
    ].join('\n')).join('\n\n─────────────────────\n\n');
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard', 'success'));
  };

  // ── Single receipt JSX builder ──────────────────────────────────────────────
  const Receipt = ({ monthLabel, index }: { monthLabel: string; index: number }) => {
    const receiptNo = `${data.receiptPrefix}-${String(index + 1).padStart(3, '0')}`;
    return (
      <div style={{
        border: '2px solid #1e293b', padding: '28px 32px', background: '#fffff8',
        marginBottom: index < months.length - 1 ? 32 : 0, pageBreakInside: 'avoid', position: 'relative'
      }}>
        {/* Revenue stamp placeholder */}
        <div style={{
          position: 'absolute', top: 16, right: 16, width: 56, height: 56,
          border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff', transform: 'rotate(-2deg)', borderRadius: 4
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#e2e8f0' }}>₹</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1.2 }}>Revenue<br />Stamp</div>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', margin: 0, color: '#0f172a' }}>Rent Receipt</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>Receipt No: <b style={{ color: '#0f172a' }}>{receiptNo}</b></span>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>Period: <b style={{ color: '#0f172a' }}>{monthLabel}</b></span>
          </div>
        </div>

        {/* Body */}
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#1e293b', lineHeight: 2 }}>
          <p style={{ margin: '0 0 8px' }}>
            Received with thanks from{' '}
            <span style={{ fontWeight: 700, borderBottom: '1.5px solid #0f172a', paddingBottom: 1 }}>{data.tenantName}</span>
          </p>
          <p style={{ margin: '0 0 8px' }}>
            the sum of{' '}
            <span style={{ fontWeight: 700, borderBottom: '1.5px solid #0f172a', paddingBottom: 1 }}>
              ₹{fmt(rentAmt)}/- (Rupees {numWords(rentAmt)} Only)
            </span>
          </p>
          <p style={{ margin: '0 0 8px' }}>
            towards rent for the month of{' '}
            <span style={{ fontWeight: 700, borderBottom: '1.5px solid #0f172a', paddingBottom: 1 }}>{monthLabel}</span>
          </p>
          <p style={{ margin: '0 0 4px' }}>for the property located at:</p>
          <p style={{ margin: '0 0 8px', paddingLeft: 16, borderLeft: '3px solid #e2e8f0', color: '#475569', fontStyle: 'italic' }}>
            {data.address}, {data.city}
          </p>
          <p style={{ margin: '0 0 4px', fontSize: 12 }}>
            <b>Payment Mode:</b> {data.payMode}
            {data.txnRef && <span style={{ color: '#64748b' }}> · Ref: {data.txnRef}</span>}
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: '#475569' }}>
            {data.landlordPan && <p style={{ margin: 0 }}>Landlord PAN: <b style={{ color: '#0f172a' }}>{data.landlordPan}</b></p>}
            {data.showHraInfo && rentAmt > 8333 && (
              <p style={{ margin: '4px 0 0', fontSize: 10, color: '#7c3aed' }}>★ PAN required for HRA claims (rent &gt; ₹1L/yr)</p>
            )}
          </div>
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div style={{ borderBottom: '1.5px solid #0f172a', marginBottom: 4, height: 32 }}></div>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>{data.landlordName}</p>
            <p style={{ fontSize: 9, color: '#94a3b8', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Landlord Signature</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Home size={18} className="text-blue-600" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Rent Receipt Generator</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['single', 'batch'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === m ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}>
              {m === 'single' ? 'Single Month' : 'Annual (12)'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={copyText} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
            <Copy size={13} /> Copy Text
          </button>
          <button onClick={downloadPDF} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all disabled:opacity-50">
            <Download size={13} /> {loading ? 'Generating…' : `Download ${mode === 'batch' ? '12 Receipts' : 'Receipt'}`}
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-xl font-black mt-0.5 ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[320px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Parties */}
            <section className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12} /> Parties</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tenant Name</label>
                  <input value={data.tenantName} onChange={e => set('tenantName', e.target.value)}
                    className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Landlord Name</label>
                  <input value={data.landlordName} onChange={e => set('landlordName', e.target.value)}
                    className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Landlord PAN</label>
                  <input value={data.landlordPan} onChange={e => set('landlordPan', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
              </div>
            </section>

            {/* Property & Rent */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Home size={12} /> Property & Rent</p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Rent (₹)</label>
                <input type="text" inputMode="numeric" value={data.amount}
                  onChange={e => set('amount', e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full h-8 px-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address</label>
                <textarea value={data.address} onChange={e => set('address', e.target.value)} rows={2}
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City / PIN</label>
                <input value={data.city} onChange={e => set('city', e.target.value)}
                  className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
              </div>
            </section>

            {/* Payment Details */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CreditCard size={12} /> Payment</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Month</label>
                  <input type="month" value={data.startMonth} onChange={e => set('startMonth', e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Receipt Prefix</label>
                  <input value={data.receiptPrefix} onChange={e => set('receiptPrefix', e.target.value)}
                    className="w-full h-8 px-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Mode</label>
                <select value={data.payMode} onChange={e => set('payMode', e.target.value as PayMode)}
                  className="w-full h-8 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white">
                  {(['Cash', 'NEFT/IMPS', 'UPI', 'Cheque', 'Bank Transfer'] as PayMode[]).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              {data.payMode !== 'Cash' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {data.payMode === 'Cheque' ? 'Cheque No.' : 'Transaction Ref / UTR'}
                  </label>
                  <input value={data.txnRef} onChange={e => set('txnRef', e.target.value)}
                    placeholder={data.payMode === 'UPI' ? 'UPI Ref No.' : 'TXN / UTR No.'}
                    className="w-full h-8 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
              )}
            </section>

            {/* HRA Info toggle */}
            <section className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 pb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.showHraInfo} onChange={e => set('showHraInfo', e.target.checked)}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Show HRA / PAN reminder on receipt</span>
              </label>
              {data.showHraInfo && (
                <div className="mt-2 p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                  <p className="text-[10px] text-violet-700 dark:text-violet-300 font-semibold leading-relaxed">
                    ★ Annual rent &gt; ₹1L requires landlord PAN for HRA exemption u/s 10(13A).<br />
                    Monthly ≈ ₹8,333 threshold applies.
                  </p>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* ── RIGHT: RECEIPT PREVIEW ── */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 flex justify-center py-6 px-4">
          <div style={{ width: 680 }}>
            {/* Preview header bar */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Preview · {mode === 'batch' ? '12 receipts (scroll to see all)' : 'Single Receipt'}
              </span>
              <span className="text-xs text-slate-400">
                Annual total: ₹{fmt(rentAmt * months.length)}
              </span>
            </div>

            {/* Receipts */}
            <div ref={receiptRef} style={{ background: '#ffffff', padding: '32px', fontFamily: 'Georgia, serif' }}>
              {months.map((m, i) => (
                <Receipt key={m.yearMonth} monthLabel={m.label} index={i} />
              ))}

              {/* HRA Summary (batch only) */}
              {mode === 'batch' && data.showHraInfo && (
                <div style={{ marginTop: 32, border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 20px', background: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>Annual Rent Summary — For HRA Exemption</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      { label: 'Monthly Rent', val: `₹${fmt(rentAmt)}` },
                      { label: 'Annual Rent', val: `₹${fmt(annualRent)}` },
                      { label: 'PAN Required', val: rentAmt > 8333 ? 'YES' : 'No' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>{label}</p>
                        <p style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 10 }}>
                    Landlord: {data.landlordName} · PAN: {data.landlordPan} · Period: {months[0]?.label} – {months[months.length - 1]?.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
