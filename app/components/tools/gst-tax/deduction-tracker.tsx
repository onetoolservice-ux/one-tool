'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Info, CheckCircle2, TrendingDown } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ═══════════════════════════════════════════════════════════════════════════════
// TAX DEDUCTION PLANNER — 80C / 80D and all major deductions FY 2024-25
// ═══════════════════════════════════════════════════════════════════════════════

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtK = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

interface DeductionInput {
  label: string;
  key: string;
  max?: number;
  hint?: string;
}

const SEC_80C_ITEMS: DeductionInput[] = [
  { label: 'EPF / VPF contribution', key: 'epf', hint: 'Employee provident fund contributions' },
  { label: 'PPF deposit', key: 'ppf', hint: 'Public provident fund' },
  { label: 'ELSS mutual funds', key: 'elss', hint: 'Equity linked savings scheme' },
  { label: 'NSC investment', key: 'nsc', hint: 'National savings certificate' },
  { label: 'Tax-saving FD (5-year)', key: 'taxfd', hint: 'Bank fixed deposit, min 5-year lock-in' },
  { label: 'LIC / life insurance premium', key: 'lic', hint: 'Premium paid for life insurance policies' },
  { label: 'Children tuition fees', key: 'tuition', hint: 'Full-time education, max 2 children' },
  { label: 'Home loan principal repayment', key: 'homeloan', hint: 'Principal component of EMI' },
  { label: 'Sukanya Samriddhi Yojana (SSY)', key: 'ssy', hint: 'For girl child account' },
  { label: 'NPS employee contribution', key: 'nps_emp', hint: 'Included in 80C limit' },
];

type TaxBracket = 5 | 20 | 30;

function ProgressBar({ used, max, color = 'blue' }: { used: number; max: number; color?: string }) {
  const pct = Math.min(100, max > 0 ? (used / max) * 100 : 0);
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
  const barColor = colorMap[color] ?? 'bg-blue-500';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
        <span>Used: {fmt(used)}</span>
        <span>Limit: {fmt(max)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor} ${pct >= 100 ? 'opacity-100' : 'opacity-80'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] mt-0.5">
        <span className={pct >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
          {pct >= 100 ? 'Limit reached' : `${(100 - pct).toFixed(0)}% remaining`}
        </span>
        <span className="text-slate-400 dark:text-slate-500">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  hint,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  max?: number;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
        {label}
        {max && <span className="ml-1 normal-case font-normal text-slate-400 dark:text-slate-500">(max {fmtK(max)})</span>}
      </label>
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{hint}</p>}
      <input
        type="number"
        min={0}
        max={max}
        value={value === 0 ? '' : value}
        onChange={(e) => {
          const v = Math.max(0, Number(e.target.value) || 0);
          onChange(max ? Math.min(v, max) : v);
        }}
        placeholder="0"
        className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full"
      />
    </div>
  );
}

export function DeductionTracker() {
  const [bracket, setBracket] = useState<TaxBracket>(30);
  const [seniorParent, setSeniorParent] = useState(false);

  // 80C fields
  const [c80, setC80] = useState<Record<string, number>>(
    Object.fromEntries(SEC_80C_ITEMS.map((i) => [i.key, 0]))
  );

  // 80CCD(1B)
  const [npsExtra, setNpsExtra] = useState(0);

  // 80D
  const [d80Self, setD80Self] = useState(0);
  const [d80Parents, setD80Parents] = useState(0);
  const [d80Checkup, setD80Checkup] = useState(0);

  // Other deductions
  const [e80, setE80] = useState(0); // education loan interest
  const [eea80, setEea80] = useState(0); // home loan interest additional
  const [g80, setG80] = useState(0); // donations
  const [tta80, setTta80] = useState(0); // savings interest
  const [hra, setHra] = useState(0); // HRA

  const totals = useMemo(() => {
    const raw80C = Object.values(c80).reduce((a, b) => a + b, 0);
    const sec80C = Math.min(raw80C, 150000);

    const sec80CCD1B = Math.min(npsExtra, 50000);

    const selfLimit = 25000; // 50000 for senior self — simplified: if user is senior they'd use 80TTB
    const parentLimit = seniorParent ? 50000 : 25000;
    const checkupWithin80D = Math.min(d80Checkup, 5000);
    const d80SelfCapped = Math.min(d80Self, selfLimit);
    const d80ParentsCapped = Math.min(d80Parents, parentLimit);
    const sec80D = Math.min(d80SelfCapped + d80ParentsCapped + checkupWithin80D, selfLimit + parentLimit);

    const sec80E = e80; // no limit on education loan interest
    const sec80EEA = Math.min(eea80, 150000);
    const sec80G = Math.min(g80 * 0.5, g80); // simplified: 50% of donation (worst case)
    const sec80TTA = Math.min(tta80, 10000); // 80TTB for senior: 50K, simplified here

    const totalDeductions = sec80C + sec80CCD1B + sec80D + sec80E + sec80EEA + sec80G + sec80TTA + hra;
    const taxSaved = Math.round(totalDeductions * (bracket / 100) * 1.04); // 4% cess

    return {
      raw80C,
      sec80C,
      sec80CCD1B,
      sec80D,
      sec80E,
      sec80EEA,
      sec80G,
      sec80TTA,
      totalDeductions,
      taxSaved,
      deductionsLeft: Math.max(0, 150000 - raw80C) + Math.max(0, 50000 - npsExtra),
    };
  }, [c80, npsExtra, d80Self, d80Parents, d80Checkup, e80, eea80, g80, tta80, hra, bracket, seniorParent]);

  const kpis = [
    { label: 'Total Deductions', value: fmtK(totals.totalDeductions), color: 'primary' as const },
    { label: 'Est. Tax Saved', value: fmtK(totals.taxSaved), color: 'success' as const },
    { label: 'More Room', value: fmtK(totals.deductionsLeft), color: 'warning' as const },
    { label: 'Tax Bracket', value: `${bracket}%`, color: 'neutral' as const },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Tax Deduction Planner"
        subtitle="Plan your deductions to minimize income tax — FY 2024-25 (Old Regime)"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Tax bracket selector */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Your Tax Bracket (for savings estimate)</p>
          <div className="flex gap-2">
            {([5, 20, 30] as TaxBracket[]).map((b) => (
              <button
                key={b}
                onClick={() => setBracket(b)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                  bracket === b
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {b}% slab
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Tax saved estimate includes 4% Health & Education cess. Only applicable under the Old Tax Regime.
          </p>
        </div>

        {/* Section 80C */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Section 80C</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Investments & payments — limit ₹1,50,000</p>
            </div>
            {totals.sec80C >= 150000 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={14} /> Maxed out
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEC_80C_ITEMS.map((item) => (
              <NumberInput
                key={item.key}
                label={item.label}
                hint={item.hint}
                value={c80[item.key]}
                onChange={(v) => setC80((prev) => ({ ...prev, [item.key]: v }))}
              />
            ))}
          </div>
          <ProgressBar used={totals.raw80C} max={150000} color="blue" />
        </div>

        {/* Section 80CCD(1B) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Section 80CCD(1B) — Additional NPS</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Over and above 80C — additional deduction up to ₹50,000</p>
          </div>
          <NumberInput
            label="Additional NPS contribution"
            hint="Voluntary NPS contribution in Tier-I account, beyond employer matching"
            max={50000}
            value={npsExtra}
            onChange={setNpsExtra}
          />
          <ProgressBar used={npsExtra} max={50000} color="violet" />
        </div>

        {/* Section 80D */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Section 80D — Medical Insurance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Self/family: ₹25K | Parents: ₹25K (₹50K if senior)</p>
          </div>

          {/* Senior parent toggle */}
          <button
            onClick={() => setSeniorParent((p) => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
              seniorParent
                ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${seniorParent ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
              {seniorParent && <CheckCircle2 size={10} className="text-white" />}
            </div>
            Senior citizen parents (60+ years) — higher limit ₹50,000
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberInput
              label="Self / family health insurance premium"
              hint="Policy for self, spouse, and dependent children"
              max={25000}
              value={d80Self}
              onChange={setD80Self}
            />
            <NumberInput
              label="Parents health insurance premium"
              hint={seniorParent ? 'Senior citizen parent — limit ₹50,000' : 'Limit ₹25,000 (₹50,000 if parents are senior citizens)'}
              max={seniorParent ? 50000 : 25000}
              value={d80Parents}
              onChange={setD80Parents}
            />
            <NumberInput
              label="Preventive health check-up"
              hint="Within 80D limit — sub-limit ₹5,000 (cash payment allowed)"
              max={5000}
              value={d80Checkup}
              onChange={setD80Checkup}
            />
          </div>
          <ProgressBar used={totals.sec80D} max={25000 + (seniorParent ? 50000 : 25000)} color="emerald" />
        </div>

        {/* Other deductions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Other Major Deductions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Education loan, home loan, donations, savings interest</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberInput
              label="80E — Education loan interest"
              hint="Interest on loan for higher education (self/spouse/children) — no upper limit"
              value={e80}
              onChange={setE80}
            />
            <NumberInput
              label="80EEA — Home loan interest (additional)"
              hint="First-time home buyers on affordable housing loan — limit ₹1,50,000"
              max={150000}
              value={eea80}
              onChange={setEea80}
            />
            <NumberInput
              label="80G — Charitable donations"
              hint="50% of donation amount shown (varies: 50% to 100% depending on fund)"
              value={g80}
              onChange={setG80}
            />
            <NumberInput
              label="80TTA — Savings account interest"
              hint="Interest from savings account (non-senior) — limit ₹10,000"
              max={10000}
              value={tta80}
              onChange={setTta80}
            />
            <NumberInput
              label="HRA — House Rent Allowance (Sec 10(13A))"
              hint="Actual HRA exempt from tax (min of: HRA received, 50%/40% of basic, rent paid minus 10% of basic)"
              value={hra}
              onChange={setHra}
            />
          </div>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-emerald-500" />
            Deduction Summary
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Section 80C (incl. investments)', value: totals.sec80C, max: 150000 },
              { label: 'Section 80CCD(1B) — Additional NPS', value: totals.sec80CCD1B, max: 50000 },
              { label: 'Section 80D — Medical insurance', value: totals.sec80D, max: 25000 + (seniorParent ? 50000 : 25000) },
              { label: 'Section 80E — Education loan interest', value: totals.sec80E, max: null },
              { label: 'Section 80EEA — Home loan interest', value: totals.sec80EEA, max: 150000 },
              { label: 'Section 80G — Donations (est. 50%)', value: totals.sec80G, max: null },
              { label: 'Section 80TTA — Savings interest', value: totals.sec80TTA, max: 10000 },
              { label: 'HRA Exemption (Sec 10(13A))', value: hra, max: null },
            ]
              .filter((r) => r.value > 0)
              .map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{row.label}</p>
                    {row.max && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Limit: {fmt(row.max)}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{fmt(row.value)}</span>
                </div>
              ))}
            <div className="flex items-center justify-between pt-2 mt-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Total Deductions</p>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{fmt(totals.totalDeductions)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Estimated Tax Saved @ {bracket}% + 4% cess</p>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{fmt(totals.taxSaved)}</span>
            </div>
          </div>
        </div>

        {/* Old regime note */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-4">
          <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
            <span className="font-semibold">Old Tax Regime only:</span> The New Tax Regime (default from FY 2023-24) does not allow most of the deductions above (80C, 80D, HRA, 80E, etc.). The new regime offers lower slab rates but removes most exemptions. Choose old regime explicitly when filing ITR to claim these deductions.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Disclaimer</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This planner provides estimates only. Actual tax savings depend on your gross income, applicable slab, specific sub-limits for each deduction, nature of investments, and whether proofs are accepted by your employer or the Income Tax Department. 80G deduction rates vary between 50% and 100% depending on the donee institution. HRA exemption requires actual rent receipts and is subject to LTA/CTC structure. Consult a qualified Chartered Accountant for precise tax planning advice before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
