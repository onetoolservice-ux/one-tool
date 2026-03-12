"use client";
import React, { useState, useMemo } from 'react';
import { Home, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

export const HRACalculator = () => {
  const [basicSalary, setBasicSalary] = useState(600000);
  const [daAmount, setDaAmount] = useState(0);
  const [hraReceived, setHraReceived] = useState(240000);
  const [rentPaid, setRentPaid] = useState(300000);
  const [city, setCity] = useState<'metro' | 'non-metro'>('metro');

  const result = useMemo(() => {
    const basicDA = basicSalary + daAmount;
    const cityPct = city === 'metro' ? 0.50 : 0.40;

    // HRA exemption = minimum of three conditions
    const c1 = hraReceived; // actual HRA received
    const c2 = Math.max(0, rentPaid - basicDA * 0.10); // rent paid - 10% of basic+DA
    const c3 = basicDA * cityPct; // 40/50% of basic+DA

    const exemption = Math.min(c1, c2, c3);
    const taxableHRA = hraReceived - exemption;

    const limitingCondition =
      c1 <= c2 && c1 <= c3 ? 'Actual HRA received' :
      c2 <= c1 && c2 <= c3 ? 'Rent paid minus 10% of Basic+DA' :
      '50%/40% of Basic+DA (city limit)';

    return { c1, c2, c3, exemption, taxableHRA, limitingCondition };
  }, [basicSalary, daAmount, hraReceived, rentPaid, city]);

  const conditions = [
    { label: 'Actual HRA Received', value: result.c1, isMin: result.exemption === result.c1 },
    { label: `Rent Paid − 10% of Basic+DA`, value: result.c2, isMin: result.exemption === result.c2 },
    { label: `${city === 'metro' ? '50%' : '40%'} of Basic+DA (${city === 'metro' ? 'metro' : 'non-metro'})`, value: result.c3, isMin: result.exemption === result.c3 },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="HRA Exemption Calculator"
        subtitle="Section 10(13A) · Three-condition minimum rule"
        kpis={[
          { label: 'HRA Exempt', value: fmt(result.exemption), color: 'success' },
          { label: 'HRA Taxable', value: fmt(result.taxableHRA), color: result.taxableHRA > 0 ? 'error' : 'neutral' },
          { label: 'HRA Received', value: fmt(hraReceived), color: 'neutral' },
          { label: 'City', value: city === 'metro' ? 'Metro (50%)' : 'Non-Metro (40%)', color: 'neutral' },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Your Details (Annual)</h2>

            <div className="space-y-1">
              <label className={labelCls}>Basic Salary (₹)</label>
              <input type="number" className={inputCls} value={basicSalary} onChange={e => setBasicSalary(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Dearness Allowance — DA (₹)</label>
              <input type="number" className={inputCls} value={daAmount} onChange={e => setDaAmount(+e.target.value)} />
              <p className="text-xs text-slate-400">Usually 0 for private sector</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>HRA Received from Employer (₹)</label>
              <input type="number" className={inputCls} value={hraReceived} onChange={e => setHraReceived(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Actual Rent Paid (₹)</label>
              <input type="number" className={inputCls} value={rentPaid} onChange={e => setRentPaid(+e.target.value)} />
              <p className="text-xs text-slate-400">Must be &gt;10% of Basic for any exemption</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>City of Residence</label>
              <div className="flex gap-2">
                {(['metro', 'non-metro'] as const).map(c => (
                  <button key={c} onClick={() => setCity(c)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${city === c ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {c === 'metro' ? 'Metro (50%)' : 'Non-Metro (40%)'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">Metro: Mumbai, Delhi, Kolkata, Chennai</p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Three conditions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Three Conditions — Minimum is Exempt</h3>
              <div className="space-y-3">
                {conditions.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${c.isMin ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}>
                    <div className="flex items-center gap-2">
                      {c.isMin && <CheckCircle className="w-4 h-4 text-sky-500" />}
                      {!c.isMin && <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                      <span className={`text-sm ${c.isMin ? 'font-semibold text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {c.label}
                      </span>
                    </div>
                    <span className={`font-bold text-sm ${c.isMin ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {fmt(c.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-slate-500 mb-1">HRA Exempt</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(result.exemption)}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Not added to taxable income</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="text-xs text-slate-500 mb-1">HRA Taxable</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(result.taxableHRA)}</div>
                <div className="text-xs text-red-500 mt-1">Added to taxable income</div>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800 flex gap-3">
              <Info className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
              <div className="text-sm text-sky-700 dark:text-sky-300">
                <p className="font-semibold mb-1">Limiting condition: {result.limitingCondition}</p>
                <p>You can exempt <strong>{fmt(result.exemption)}</strong> from your HRA of {fmt(hraReceived)}.
                {result.taxableHRA > 0 && ` Remaining ${fmt(result.taxableHRA)} is taxable.`}
                </p>
                {rentPaid < (basicSalary + daAmount) * 0.10 && (
                  <p className="mt-1 text-amber-600 dark:text-amber-400 font-semibold">Rent paid is less than 10% of Basic+DA — no HRA exemption possible.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Calculated as per Section 10(13A) of the Income Tax Act. Metro cities eligible for 50% exemption: Mumbai, Delhi, Kolkata, Chennai. Actual exemption is verified and applied by your employer during TDS computation. Consult a Chartered Accountant before claiming HRA exemption in your Income Tax Return.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Annual Summary</div>
              {[
                { label: 'Basic + DA', value: basicSalary + daAmount },
                { label: 'HRA Received', value: hraReceived },
                { label: 'Rent Paid', value: rentPaid },
                { label: 'HRA Exempt', value: result.exemption, green: true },
                { label: 'HRA Taxable', value: result.taxableHRA, red: true },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 text-sm">
                  <span className="text-slate-500">{r.label}</span>
                  <span className={r.green ? 'font-semibold text-emerald-600 dark:text-emerald-400' : r.red ? 'font-semibold text-red-500' : 'text-slate-700 dark:text-slate-300'}>
                    {fmt(r.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
