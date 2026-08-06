'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  FileText, TrendingUp, Download, Copy, CheckCircle, Receipt,
  AlertCircle, Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, fmtCurrency,
  getITC, getPurchaseBills,
  type BizOSStore, type BizInvoice,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'gstr1' | 'gstr3b' | 'itc';

const GST_RATE_BANDS = [5, 12, 18, 28] as const;

interface RateBand {
  rate: number;
  taxable: number;
  gst: number;
  count: number;
}

interface GSTSummary {
  outputGST: number;
  itc: number;
  netPayable: number;
  totalTaxableSales: number;
  rateBands: RateBand[];
  invoices: BizInvoice[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthRange(selectedMonth: string): [string, string] {
  const [y, m] = selectedMonth.split('-').map(Number);
  const from = `${selectedMonth}-01`;
  const to = new Date(y, m, 0).toISOString().split('T')[0]; // last day of month
  return [from, to];
}

function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function computeGSTSummary(store: BizOSStore, selectedMonth: string, from: string, to: string): GSTSummary {
  const allInvoices = Object.values(store.invoices);
  const monthInvoices = allInvoices.filter(
    inv => inv.date.startsWith(selectedMonth) && inv.status !== 'cancelled',
  );

  // Rate band breakdown from invoice items
  const bandMap: Record<number, { taxable: number; gst: number; count: number }> = {};
  let totalTaxableSales = 0;
  let outputGST = 0;

  monthInvoices.forEach(inv => {
    inv.items.forEach(item => {
      const taxable = item.qty * item.rate;
      const gst = (taxable * item.gstRate) / 100;
      totalTaxableSales += taxable;
      outputGST += gst;
      if (!bandMap[item.gstRate]) bandMap[item.gstRate] = { taxable: 0, gst: 0, count: 0 };
      bandMap[item.gstRate].taxable += taxable;
      bandMap[item.gstRate].gst += gst;
      bandMap[item.gstRate].count += 1;
    });
  });

  const rateBands: RateBand[] = Object.entries(bandMap).map(([rate, d]) => ({
    rate: Number(rate),
    taxable: d.taxable,
    gst: d.gst,
    count: d.count,
  })).sort((a, b) => a.rate - b.rate);

  const itc = getITC(store, from, to);
  const netPayable = outputGST - itc;

  return { outputGST, itc, netPayable, totalTaxableSales, rateBands, invoices: monthInvoices };
}

function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-black text-slate-900 dark:text-white">{fmtCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── GSTR-1 Section ──────────────────────────────────────────────────────────

function GSTR1View({ store, summary, selectedMonth }: {
  store: BizOSStore;
  summary: GSTSummary;
  selectedMonth: string;
}) {
  const [rateFilter, setRateFilter] = useState<number | 'all'>('all');

  const filtered = summary.invoices.filter(inv => {
    if (rateFilter === 'all') return true;
    return inv.items.some(it => it.gstRate === rateFilter);
  });

  const allRates = Array.from(new Set(
    summary.invoices.flatMap(inv => inv.items.map(it => it.gstRate)),
  )).sort((a, b) => a - b);

  function handleExport() {
    const headers = ['Invoice #', 'Date', 'Customer', 'GSTIN', 'Taxable (₹)', 'GST %', 'GST Amt (₹)', 'Total (₹)'];
    const rows = summary.invoices.flatMap(inv => {
      const customer = store.parties[inv.customerId];
      return inv.items.map(item => [
        inv.number,
        inv.date,
        customer?.name ?? 'Unknown',
        customer?.gstin ?? '',
        (item.qty * item.rate).toFixed(2),
        item.gstRate,
        ((item.qty * item.rate * item.gstRate) / 100).toFixed(2),
        item.amount.toFixed(2),
      ]);
    });
    downloadCSV(headers, rows, `GSTR1-${selectedMonth}.csv`);
  }

  // HSN summary grouped by rate
  const hsnByRate: Record<number, { taxable: number; gst: number; count: number }> = {};
  summary.invoices.forEach(inv => {
    inv.items.forEach(item => {
      const t = item.qty * item.rate;
      const g = (t * item.gstRate) / 100;
      if (!hsnByRate[item.gstRate]) hsnByRate[item.gstRate] = { taxable: 0, gst: 0, count: 0 };
      hsnByRate[item.gstRate].taxable += t;
      hsnByRate[item.gstRate].gst += g;
      hsnByRate[item.gstRate].count += 1;
    });
  });

  return (
    <div className="space-y-5">
      {/* Rate Band Summary Cards */}
      <div>
        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          GST Rate Breakdown
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {GST_RATE_BANDS.map(rate => {
            const band = summary.rateBands.find(b => b.rate === rate);
            return (
              <div key={rate} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  GST {rate}%
                </p>
                {band ? (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      Taxable: <span className="font-bold text-slate-800 dark:text-slate-200">{fmtCurrency(band.taxable)}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      GST: <span className="font-bold text-blue-700 dark:text-blue-400">{fmtCurrency(band.gst)}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-300 dark:text-slate-600 italic">No sales</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Row */}
        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Total Taxable</p>
            <p className="text-lg font-black text-blue-800 dark:text-blue-300">{fmtCurrency(summary.totalTaxableSales)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Total Output GST</p>
            <p className="text-lg font-black text-blue-800 dark:text-blue-300">{fmtCurrency(summary.outputGST)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Grand Total</p>
            <p className="text-lg font-black text-blue-800 dark:text-blue-300">{fmtCurrency(summary.totalTaxableSales + summary.outputGST)}</p>
          </div>
        </div>
      </div>

      {/* Invoice-wise Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Invoice-wise Outward Supplies
          </h3>
          <div className="flex items-center gap-2">
            {/* Rate filter */}
            <div className="flex gap-1">
              <button
                onClick={() => setRateFilter('all')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${rateFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                All
              </button>
              {allRates.map(r => (
                <button
                  key={r}
                  onClick={() => setRateFilter(r)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${rateFilter === r ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {r}%
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">No invoices for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {['Invoice #', 'Date', 'Customer', 'GSTIN', 'Taxable', 'GST %', 'GST Amt', 'Total'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(inv => {
                  const customer = store.parties[inv.customerId];
                  // If rate filter is active, only show matching items
                  const displayItems = rateFilter === 'all'
                    ? inv.items
                    : inv.items.filter(it => it.gstRate === rateFilter);
                  return displayItems.map((item, i) => {
                    const taxable = item.qty * item.rate;
                    const gstAmt = (taxable * item.gstRate) / 100;
                    return (
                      <tr key={`${inv.id}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {i === 0 ? inv.number : ''}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {i === 0 ? inv.date : ''}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {i === 0 ? (customer?.name ?? 'Unknown') : ''}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {i === 0 ? (customer?.gstin ?? '—') : ''}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 text-right whitespace-nowrap">
                          {fmtCurrency(taxable)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            {item.gstRate}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-blue-700 dark:text-blue-400 text-right whitespace-nowrap">
                          {fmtCurrency(gstAmt)}
                        </td>
                        <td className="px-4 py-2.5 font-black text-slate-900 dark:text-white text-right whitespace-nowrap">
                          {fmtCurrency(taxable + gstAmt)}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HSN Summary */}
      {Object.keys(hsnByRate).length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              HSN / Rate Summary
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Grouped by GST rate for GSTR-1 Table 12
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {['GST Rate', 'Total Taxable', 'Total GST', 'Txn Count'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(hsnByRate)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([rate, d]) => (
                    <tr key={rate} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          {rate}%
                        </span>
                      </td>
                      <td className="px-5 py-2.5 font-bold text-slate-800 dark:text-slate-200">{fmtCurrency(d.taxable)}</td>
                      <td className="px-5 py-2.5 font-bold text-blue-700 dark:text-blue-400">{fmtCurrency(d.gst)}</td>
                      <td className="px-5 py-2.5 text-slate-500 dark:text-slate-400">{d.count} lines</td>
                    </tr>
                  ))}
                <tr className="bg-slate-50 dark:bg-slate-800/40 font-black">
                  <td className="px-5 py-2.5 text-slate-700 dark:text-slate-200">TOTAL</td>
                  <td className="px-5 py-2.5 text-slate-800 dark:text-white">{fmtCurrency(summary.totalTaxableSales)}</td>
                  <td className="px-5 py-2.5 text-blue-700 dark:text-blue-400">{fmtCurrency(summary.outputGST)}</td>
                  <td className="px-5 py-2.5 text-slate-500 dark:text-slate-400">
                    {Object.values(hsnByRate).reduce((s, d) => s + d.count, 0)} lines
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GSTR-3B Section ─────────────────────────────────────────────────────────

function GSTR3BView({ store, summary, selectedMonth, from, to }: {
  store: BizOSStore;
  summary: GSTSummary;
  selectedMonth: string;
  from: string;
  to: string;
}) {
  const [copied, setCopied] = useState(false);

  const purchaseBills = getPurchaseBills(store);
  const periodBills = Object.values(purchaseBills).filter(b => b.date >= from && b.date <= to);

  // ITC by rate band
  const itcBandMap: Record<number, { taxable: number; gst: number }> = {};
  periodBills.forEach(bill => {
    bill.items.forEach(item => {
      const t = item.qty * item.rate;
      const g = (t * item.gstRate) / 100;
      if (!itcBandMap[item.gstRate]) itcBandMap[item.gstRate] = { taxable: 0, gst: 0 };
      itcBandMap[item.gstRate].taxable += t;
      itcBandMap[item.gstRate].gst += g;
    });
  });

  const hasPurchases = Object.keys(itcBandMap).length > 0;

  function handleCopySummary() {
    const lines = [
      `GSTR-3B Summary — ${selectedMonth}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `Business: ${store.settings.businessName || 'N/A'}`,
      `GSTIN: ${store.settings.gstin || 'N/A'}`,
      '',
      '== OUTWARD SUPPLIES (Section 3.1) ==',
      ...summary.rateBands.map(b =>
        `  GST ${b.rate}% | Taxable: ${fmtCurrency(b.taxable)} | CGST: ${fmtCurrency(b.gst / 2)} | SGST: ${fmtCurrency(b.gst / 2)}`,
      ),
      `  TOTAL Output GST: ${fmtCurrency(summary.outputGST)}`,
      '',
      '== INPUT TAX CREDIT (Section 4) ==',
      ...(hasPurchases
        ? Object.entries(itcBandMap).map(([r, d]) =>
            `  GST ${r}% | Taxable: ${fmtCurrency(d.taxable)} | ITC: ${fmtCurrency(d.gst)}`,
          )
        : ['  No purchase bills recorded.']),
      `  TOTAL ITC: ${fmtCurrency(summary.itc)}`,
      '',
      '== NET TAX PAYABLE ==',
      `  Output GST:  ${fmtCurrency(summary.outputGST)}`,
      `  (-) ITC:     ${fmtCurrency(summary.itc)}`,
      `  (=) Net:     ${fmtCurrency(summary.netPayable)} ${summary.netPayable > 0 ? '(Payable)' : '(Refundable)'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="space-y-5">
      {/* Section 1 — Outward Supplies */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Section 3.1 — Outward Supplies
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            From sales invoices · Intra-state assumed (CGST + SGST split)
          </p>
        </div>
        {summary.rateBands.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500">No outward supplies this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {['GST Rate', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total GST'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.rateBands.map(band => (
                  <tr key={band.rate} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {band.rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{fmtCurrency(band.taxable)}</td>
                    <td className="px-5 py-3 font-bold text-blue-700 dark:text-blue-400">{fmtCurrency(band.gst / 2)}</td>
                    <td className="px-5 py-3 font-bold text-indigo-700 dark:text-indigo-400">{fmtCurrency(band.gst / 2)}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-600">—</td>
                    <td className="px-5 py-3 font-black text-slate-900 dark:text-white">{fmtCurrency(band.gst)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/40 font-black">
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-200">TOTAL</td>
                  <td className="px-5 py-3 text-slate-800 dark:text-white">{fmtCurrency(summary.totalTaxableSales)}</td>
                  <td className="px-5 py-3 text-blue-700 dark:text-blue-400">{fmtCurrency(summary.outputGST / 2)}</td>
                  <td className="px-5 py-3 text-indigo-700 dark:text-indigo-400">{fmtCurrency(summary.outputGST / 2)}</td>
                  <td className="px-5 py-3 text-slate-400 dark:text-slate-600">—</td>
                  <td className="px-5 py-3 text-slate-900 dark:text-white">{fmtCurrency(summary.outputGST)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 — ITC */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Section 4 — Input Tax Credit
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            From purchase bills recorded in the system
          </p>
        </div>
        {!hasPurchases ? (
          <div className="p-8 text-center">
            <AlertCircle size={28} className="text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No purchase bills recorded for this period</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Add purchase bills via the Purchase Bills tool to track ITC</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {['GST Rate', 'Taxable', 'CGST', 'SGST', 'Total ITC'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(itcBandMap)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([rate, d]) => (
                    <tr key={rate} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {rate}%
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{fmtCurrency(d.taxable)}</td>
                      <td className="px-5 py-3 font-bold text-emerald-700 dark:text-emerald-400">{fmtCurrency(d.gst / 2)}</td>
                      <td className="px-5 py-3 font-bold text-teal-700 dark:text-teal-400">{fmtCurrency(d.gst / 2)}</td>
                      <td className="px-5 py-3 font-black text-slate-900 dark:text-white">{fmtCurrency(d.gst)}</td>
                    </tr>
                  ))}
                <tr className="bg-slate-50 dark:bg-slate-800/40 font-black">
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-200">TOTAL</td>
                  <td className="px-5 py-3 text-slate-800 dark:text-white">
                    {fmtCurrency(Object.values(itcBandMap).reduce((s, d) => s + d.taxable, 0))}
                  </td>
                  <td className="px-5 py-3 text-emerald-700 dark:text-emerald-400">{fmtCurrency(summary.itc / 2)}</td>
                  <td className="px-5 py-3 text-teal-700 dark:text-teal-400">{fmtCurrency(summary.itc / 2)}</td>
                  <td className="px-5 py-3 text-slate-900 dark:text-white">{fmtCurrency(summary.itc)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3 — Net Tax */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
          Net Tax Position
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-1">Output Tax</p>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">{fmtCurrency(summary.outputGST)}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">(-) ITC Available</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{fmtCurrency(summary.itc)}</p>
          </div>
          <div className={`rounded-xl p-4 border ${summary.netPayable > 0
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${summary.netPayable > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
              (=) {summary.netPayable > 0 ? 'Net Payable' : 'Net Refundable'}
            </p>
            <p className={`text-2xl font-black ${summary.netPayable > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
              {fmtCurrency(Math.abs(summary.netPayable))}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            This is a preparation summary. Share this with your CA/accountant for actual GSTR-3B filing.
            Figures are based on invoices and purchase bills recorded in the system.
          </p>
        </div>

        <button
          onClick={handleCopySummary}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-colors">
          {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
          {copied ? 'Copied!' : 'Copy Summary for CA'}
        </button>
      </div>
    </div>
  );
}

// ─── ITC Tracker Section ──────────────────────────────────────────────────────

function ITCTrackerView({ store }: { store: BizOSStore }) {
  const allBills = Object.values(getPurchaseBills(store));
  const hasBills = allBills.length > 0;

  // Last 6 months ITC trend
  const trendData = useMemo(() => {
    const months: { month: string; itc: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const itc = allBills
        .filter(b => b.date.startsWith(monthStr))
        .reduce((s, b) => s + b.gstAmount, 0);
      months.push({ month: label, itc });
    }
    return months;
  }, [allBills]);

  // FY ITC total (April to March)
  const fyStart = useMemo(() => {
    const now = new Date();
    const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-04-01`;
  }, []);
  const fyEnd = useMemo(() => {
    const now = new Date();
    const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
    return `${year}-03-31`;
  }, []);
  const fyITC = allBills.filter(b => b.date >= fyStart && b.date <= fyEnd).reduce((s, b) => s + b.gstAmount, 0);

  const statusColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'partial') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="space-y-5">
      {!hasBills ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Receipt size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-500 dark:text-slate-400 mb-1">Add purchase bills to track ITC</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Go to the Purchase Bills tool to record vendor invoices and unlock ITC tracking.
          </p>
        </div>
      ) : (
        <>
          {/* Bills Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Purchase Bills — ITC Register
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                GST paid on purchases = Input Tax Credit available
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {['Bill #', 'Date', 'Vendor', 'Total Bill', 'GST Paid (ITC)', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-2.5 font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allBills
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(bill => {
                      const vendor = store.parties[bill.vendorId];
                      return (
                        <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{bill.number}</td>
                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{bill.date}</td>
                          <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {vendor?.name ?? 'Unknown'}
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200 text-right whitespace-nowrap">
                            {fmtCurrency(bill.total)}
                          </td>
                          <td className="px-5 py-3 font-black text-emerald-700 dark:text-emerald-400 text-right whitespace-nowrap">
                            {fmtCurrency(bill.gstAmount)}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black capitalize ${statusColor(bill.status)}`}>
                              {bill.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly ITC Trend Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
              Monthly ITC Trend (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="itc" name="ITC" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FY ITC Total */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-xl p-3">
              <TrendingUp size={24} className="text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                Total ITC Available This FY
              </p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{fmtCurrency(fyITC)}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                Apr {fyStart.slice(0, 4)} — Mar {fyEnd.slice(0, 4)} · {allBills.filter(b => b.date >= fyStart && b.date <= fyEnd).length} bills
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BizGST() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('gstr1');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue());

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  const [from, to] = useMemo(() => getMonthRange(selectedMonth), [selectedMonth]);

  const summary = useMemo(() => {
    if (!store) return null;
    return computeGSTSummary(store, selectedMonth, from, to);
  }, [store, selectedMonth, from, to]);

  if (!store || !summary) return null;

  const netPayableColor = summary.netPayable > 0 ? 'error' : 'success';

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <SAPHeader
        fullWidth
        sticky
        title="GST Return Helper"
        subtitle="GSTR-1 · GSTR-3B · ITC Tracker"
        kpis={[
          {
            label: 'Output GST',
            value: fmtCurrency(summary.outputGST),
            color: 'primary',
            icon: FileText,
            subtitle: 'GST collected on sales',
          },
          {
            label: 'Input Tax Credit',
            value: fmtCurrency(summary.itc),
            color: 'success',
            icon: TrendingUp,
            subtitle: 'GST paid on purchases',
          },
          {
            label: 'Net Tax Payable',
            value: fmtCurrency(Math.abs(summary.netPayable)),
            color: netPayableColor,
            subtitle: summary.netPayable > 0 ? 'Amount to pay' : summary.netPayable < 0 ? 'Refundable' : 'Nil',
          },
          {
            label: 'Taxable Sales',
            value: fmtCurrency(summary.totalTaxableSales),
            color: 'neutral',
            subtitle: `${summary.invoices.length} invoices`,
          },
        ]}
        modes={[
          {
            label: 'View',
            value: mode,
            options: [
              { key: 'gstr1', label: 'GSTR-1' },
              { key: 'gstr3b', label: 'GSTR-3B' },
              { key: 'itc', label: 'ITC Tracker' },
            ],
            onChange: v => setMode(v as Mode),
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Period</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        }
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Prep notice */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-black">Preparation Tool Only</span> — This tool helps you prepare your GST return data.
              Actual filing must be done on the GST Portal (gstin.gov.in) by you or your CA.
            </p>
          </div>

          {mode === 'gstr1' && (
            <GSTR1View store={store} summary={summary} selectedMonth={selectedMonth} />
          )}
          {mode === 'gstr3b' && (
            <GSTR3BView store={store} summary={summary} selectedMonth={selectedMonth} from={from} to={to} />
          )}
          {mode === 'itc' && (
            <ITCTrackerView store={store} />
          )}
        </div>
      </div>
    </div>
  );
}
