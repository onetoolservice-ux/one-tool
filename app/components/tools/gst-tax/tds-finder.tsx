'use client';

import { useState, useMemo } from 'react';
import { Search, AlertTriangle, Info } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ═══════════════════════════════════════════════════════════════════════════════
// TDS RATE FINDER — Section-wise TDS rates & thresholds FY 2024-25
// ═══════════════════════════════════════════════════════════════════════════════

interface TDSSection {
  section: string;
  nature: string;
  threshold: string;
  rateWithPAN: string;
  rateNoPAN: string;
  notes?: string;
}

const TDS_DATA: TDSSection[] = [
  {
    section: '192',
    nature: 'Salary',
    threshold: 'Basic exemption limit',
    rateWithPAN: 'As per slab',
    rateNoPAN: '20%',
    notes: 'Based on estimated annual salary and applicable tax slab',
  },
  {
    section: '192A',
    nature: 'Premature EPF withdrawal',
    threshold: '₹50,000',
    rateWithPAN: '10%',
    rateNoPAN: '20%',
    notes: 'Applicable if PF balance withdrawn before 5 years of service',
  },
  {
    section: '193',
    nature: 'Interest on securities / debentures',
    threshold: '₹10,000',
    rateWithPAN: '10%',
    rateNoPAN: '20%',
    notes: 'Listed debentures, government securities, etc.',
  },
  {
    section: '194',
    nature: 'Dividends (other than u/s 115O)',
    threshold: '₹5,000',
    rateWithPAN: '10%',
    rateNoPAN: '20%',
    notes: 'Dividends paid by domestic companies to resident shareholders',
  },
  {
    section: '194A',
    nature: 'Interest (bank / post office / others)',
    threshold: '₹40,000 (₹50,000 for senior citizens)',
    rateWithPAN: '10%',
    rateNoPAN: '20%',
    notes: 'Bank FD interest; higher threshold for senior citizens (60+ years)',
  },
  {
    section: '194B',
    nature: 'Lottery / crossword puzzle / card game winnings',
    threshold: '₹10,000 per prize',
    rateWithPAN: '30%',
    rateNoPAN: '30%',
    notes: 'No PAN benefit — same rate regardless of PAN availability',
  },
  {
    section: '194C',
    nature: 'Payments to contractors / sub-contractors',
    threshold: '₹30,000 per payment / ₹1,00,000 annual',
    rateWithPAN: '1% (individual/HUF) / 2% (others)',
    rateNoPAN: '20%',
    notes: 'Advertising, catering, transport, labour contracts, etc.',
  },
  {
    section: '194D',
    nature: 'Insurance commission',
    threshold: '₹15,000',
    rateWithPAN: '5%',
    rateNoPAN: '20%',
    notes: 'Commission paid to insurance agents by insurance companies',
  },
  {
    section: '194H',
    nature: 'Commission or brokerage',
    threshold: '₹15,000',
    rateWithPAN: '5%',
    rateNoPAN: '20%',
    notes: 'Commission on sale of goods, securities brokerage (excl. securities transactions)',
  },
  {
    section: '194I',
    nature: 'Rent (land, building, plant & machinery)',
    threshold: '₹2,40,000 per year',
    rateWithPAN: '10% (land/building) / 2% (plant & machinery)',
    rateNoPAN: '20%',
    notes: 'Monthly rent >₹20,000 triggers TDS; machinery rent at lower 2% rate',
  },
  {
    section: '194IA',
    nature: 'TDS on purchase of immovable property',
    threshold: '₹50,00,000',
    rateWithPAN: '1%',
    rateNoPAN: '1%',
    notes: 'Buyer deducts TDS on property purchase from seller; Form 26QB filing required',
  },
  {
    section: '194J',
    nature: 'Professional / technical fees',
    threshold: '₹30,000',
    rateWithPAN: '10% (professional) / 2% (technical/royalty)',
    rateNoPAN: '20%',
    notes: 'Doctors, lawyers, CA, engineers; lower 2% for technical services',
  },
  {
    section: '194N',
    nature: 'Cash withdrawal from bank / post office',
    threshold: '₹1,00,00,000',
    rateWithPAN: '2% (>₹1Cr) / 5% (>₹1Cr, ITR not filed for 3 yrs)',
    rateNoPAN: '2% / 5%',
    notes: 'Higher 5% rate if ITR not filed for preceding 3 financial years',
  },
  {
    section: '194Q',
    nature: 'Purchase of goods (buyer deducts)',
    threshold: '₹50,00,000 per seller per year',
    rateWithPAN: '0.1%',
    rateNoPAN: '5%',
    notes: 'Applicable for buyers with turnover >₹10Cr; does not apply if TCS u/s 206C(1H) already collected',
  },
  {
    section: '206C',
    nature: 'TCS — Tax Collected at Source (various)',
    threshold: 'Various (see notes)',
    rateWithPAN: 'Various (0.1% to 20%)',
    rateNoPAN: 'Various',
    notes: 'Seller collects tax: Scrap (1%), Timber (2.5%), Tendu leaves (5%), Foreign remittance (5%/20%), LRS (5%)',
  },
];

export function TdsFinder() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return TDS_DATA;
    return TDS_DATA.filter(
      (row) =>
        row.section.toLowerCase().includes(q) ||
        row.nature.toLowerCase().includes(q) ||
        (row.notes ?? '').toLowerCase().includes(q)
    );
  }, [query]);

  const kpis = [
    { label: 'Sections', value: `${TDS_DATA.length}+`, color: 'neutral' as const },
    { label: 'FY', value: '2024-25', color: 'neutral' as const },
    { label: 'Results', value: `${filtered.length}`, color: filtered.length < TDS_DATA.length ? 'primary' as const : 'neutral' as const },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="TDS Rate Finder"
        subtitle="Section-wise TDS rates & thresholds — FY 2024-25"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by section number or payment type (e.g. 194C, rent, salary)..."
            className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full"
          />
        </div>

        {/* Table — desktop */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Section</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nature of Payment</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Threshold</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Rate (with PAN)</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Rate (no PAN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                      No sections found matching &quot;{query}&quot;
                    </td>
                  </tr>
                )}
                {filtered.map((row, idx) => (
                  <tr
                    key={row.section}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${idx % 2 === 0 ? '' : 'bg-slate-50/40 dark:bg-slate-800/20'}`}
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-800">
                        {row.section}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{row.nature}</p>
                      {row.notes && (
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 leading-relaxed">{row.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{row.threshold}</span>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">{row.rateWithPAN}</span>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span className="text-red-600 dark:text-red-400 font-semibold text-sm">{row.rateNoPAN}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-4">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
            <span className="font-semibold">Key rule:</span> TDS must be deducted at source before making payment. Failure to deduct attracts interest u/s 201(1A) at 1% per month (for non-deduction) and 1.5% per month (for non-deposit). Deductee can claim TDS credit in their ITR via Form 26AS / AIS.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Disclaimer</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This tool provides general reference rates for FY 2024-25 based on publicly available CBDT guidelines. TDS rates, thresholds, and applicability may vary based on specific facts, CBDT notifications, and judicial interpretations. Rates shown may not reflect recent amendments or circular clarifications. Always consult a qualified Chartered Accountant or tax advisor for exact TDS computation, applicability determination, and compliance. Do not rely solely on this tool for statutory compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
