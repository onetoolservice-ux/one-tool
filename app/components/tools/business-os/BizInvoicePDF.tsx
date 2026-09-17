'use client';

import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { fmtCurrency, type BizInvoice, type BizParty, type BizOSStore } from './biz-os-store';

// ── Amount in words (Indian numbering: lakh/crore) ──────────────────────────────

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`;
}

function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n);
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' + twoDigits(n % 100) : ''}`;
}

/** Converts a rupee amount to words using the Indian lakh/crore grouping, e.g. 152340.50 -> "One Lakh Fifty Two Thousand Three Hundred Forty Rupees and Fifty Paise Only". */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';

  let n = rupees;
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  let words = parts.length ? `${parts.join(' ')} Rupees` : 'Zero Rupees';
  if (paise > 0) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
}

// ── UPI deep link ────────────────────────────────────────────────────────────

function buildUpiLink(vpa: string, payeeName: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export function DownloadInvoicePdfButton({ invoice, customer, store }: {
  invoice: BizInvoice;
  customer: BizParty | undefined;
  store: BizOSStore;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { businessName, businessPhone, businessAddress, gstin, upiId } = store.settings;
  const upiLink = upiId
    ? buildUpiLink(upiId, businessName || 'Business', invoice.total, `Invoice ${invoice.number}`)
    : null;

  async function handleDownload() {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`${invoice.number}.pdf`);
    } catch (err) {
      alert(getErrorMessage(err) || 'PDF generation failed');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
      >
        <Download size={15} /> {downloading ? 'Generating…' : 'Download PDF'}
      </button>

      {/* Off-screen printable invoice — captured by html2canvas, never shown to the user directly. */}
      <div className="fixed top-0 pointer-events-none" style={{ left: '-9999px', zIndex: -1 }}>
        <div ref={previewRef} className="bg-white text-slate-900 w-[794px] p-10 flex flex-col text-sm">
          <div className="flex justify-between items-start mb-8 pb-5 border-b-2 border-slate-900">
            <div>
              <h2 className="font-bold text-lg text-slate-900">{businessName || 'Your Business'}</h2>
              {gstin && <p className="text-xs text-slate-500">GSTIN: {gstin}</p>}
              {businessAddress && <p className="text-xs text-slate-500 mt-1">{businessAddress}</p>}
              {businessPhone && <p className="text-xs text-slate-500">{businessPhone}</p>}
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black tracking-wider text-slate-900">INVOICE</h1>
              <p className="text-slate-400 font-semibold mt-1">#{invoice.number}</p>
              <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                <p>Date: <strong className="text-slate-700">{invoice.date}</strong></p>
                {invoice.dueDate && <p>Due: <strong className="text-slate-700">{invoice.dueDate}</strong></p>}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill To</p>
            <h3 className="font-bold text-base text-slate-900">{customer?.name ?? 'Unknown Customer'}</h3>
            {customer?.gstin && <p className="text-xs text-slate-500">GSTIN: {customer.gstin}</p>}
            {customer?.address && <p className="text-xs text-slate-500">{customer.address}</p>}
            {customer?.phone && <p className="text-xs text-slate-500">{customer.phone}</p>}
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="text-left border-b-2 border-slate-900">
                <th className="py-2 text-xs font-black text-slate-500 uppercase w-8">#</th>
                <th className="py-2 text-xs font-black text-slate-500 uppercase">Description</th>
                <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-16">Qty</th>
                <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-24">Rate</th>
                <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-16">GST</th>
                <th className="py-2 text-xs font-black text-slate-500 uppercase text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-3 text-slate-400 text-sm">{i + 1}</td>
                  <td className="py-3 font-semibold">{item.name}</td>
                  <td className="py-3 text-right text-slate-600">{item.qty}</td>
                  <td className="py-3 text-right text-slate-600">{fmtCurrency(item.rate)}</td>
                  <td className="py-3 text-right text-orange-500 text-xs">{item.gstRate}%</td>
                  <td className="py-3 text-right font-bold">{fmtCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-start gap-8 mt-auto">
            {upiLink ? (
              <div className="flex flex-col items-center gap-1.5 pt-2">
                <QRCodeCanvas value={upiLink} size={100} />
                <p className="text-[9px] text-slate-400 font-semibold">Scan to pay via UPI</p>
              </div>
            ) : <div />}

            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span><span className="font-mono">{fmtCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>GST</span><span className="font-mono">{fmtCurrency(invoice.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-xl font-black border-t-2 border-slate-900 pt-3 text-slate-900">
                <span>TOTAL</span><span className="font-mono">{fmtCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500 italic">{amountInWords(invoice.total)}</p>

          {invoice.notes && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Notes</p>
              <p className="text-xs text-slate-500">{invoice.notes}</p>
            </div>
          )}

          <p className="mt-10 pt-4 text-center text-[10px] text-slate-300 border-t border-slate-50">
            Generated by OneTool · Invoice #{invoice.number}
          </p>
        </div>
      </div>
    </>
  );
}
