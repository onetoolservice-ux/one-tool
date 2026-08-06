'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, FileText, MapPin, Users, Building } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return fmt(n);
};

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// ─────────────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female' | 'joint';
type PropType = 'residential' | 'commercial' | 'plot';

interface StateRates {
  name: string;
  stampMale: number;       // percentage
  stampFemale: number;     // percentage
  regRate: number;         // percentage
  regCap?: number;         // max registration charge in INR
  note?: string;
}

const STATE_DATA: StateRates[] = [
  { name: 'Maharashtra', stampMale: 5, stampFemale: 4, regRate: 1, regCap: 30000, note: 'Registration capped at ₹30,000. Ready reckoner value applies.' },
  { name: 'Delhi', stampMale: 6, stampFemale: 4, regRate: 1, note: 'Circle rate applies. Stamp duty on circle rate or agreement value, whichever is higher.' },
  { name: 'Karnataka', stampMale: 5, stampFemale: 5, regRate: 1, note: 'Slab: <₹20L at 2%, ₹20–45L at 3%, >₹45L at 5%. Rate shown is for >₹45L.' },
  { name: 'Tamil Nadu', stampMale: 7, stampFemale: 7, regRate: 4 },
  { name: 'Telangana', stampMale: 5, stampFemale: 5, regRate: 0.5 },
  { name: 'Gujarat', stampMale: 4.9, stampFemale: 3.9, regRate: 1 },
  { name: 'Uttar Pradesh', stampMale: 7, stampFemale: 6, regRate: 1 },
  { name: 'Rajasthan', stampMale: 6, stampFemale: 5, regRate: 1 },
  { name: 'West Bengal', stampMale: 7, stampFemale: 7, regRate: 1, note: 'Rate shown is for properties <₹1 Cr. Higher value properties may attract different rates.' },
  { name: 'Punjab', stampMale: 7, stampFemale: 5, regRate: 1 },
  { name: 'Madhya Pradesh', stampMale: 7.5, stampFemale: 6.5, regRate: 1 },
  { name: 'Haryana', stampMale: 7, stampFemale: 5, regRate: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────

export function StampDuty() {
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [propValue, setPropValue] = useState(5000000);
  const [propType, setPropType] = useState<PropType>('residential');
  const [gender, setGender] = useState<Gender>('male');

  const calc = useMemo(() => {
    const state = STATE_DATA.find(s => s.name === selectedState) ?? STATE_DATA[0];

    // Determine effective stamp rate
    let stampRate = gender === 'female' || gender === 'joint' ? state.stampFemale : state.stampMale;

    // Commercial: typically 1-2% higher in most states
    if (propType === 'commercial') stampRate = Math.min(stampRate + 1, 10);
    // Plot: typically same as residential
    // (for simplicity, plots treated same as residential)

    const stampDuty = (propValue * stampRate) / 100;
    let regCharges = (propValue * state.regRate) / 100;
    if (state.regCap) regCharges = Math.min(regCharges, state.regCap);

    const totalRegCost = stampDuty + regCharges;
    const totalPropertyCost = propValue + totalRegCost;

    return {
      state,
      stampRate,
      stampDuty,
      regCharges,
      totalRegCost,
      totalPropertyCost,
    };
  }, [selectedState, propValue, propType, gender]);

  const kpis = [
    { label: 'Stamp Duty', value: fmtCr(calc.stampDuty), icon: FileText, color: 'warning' as const },
    { label: 'Registration', value: fmtCr(calc.regCharges), icon: MapPin, color: 'primary' as const },
    { label: 'Total Reg. Cost', value: fmtCr(calc.totalRegCost), icon: FileText, color: 'error' as const },
    { label: 'Total Property Cost', value: fmtCr(calc.totalPropertyCost), icon: Building, color: 'neutral' as const },
  ];

  const toggleCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
      active
        ? 'bg-rose-500 text-white shadow-sm'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Stamp Duty Calculator"
        subtitle="State-wise stamp duty and registration charges for Indian property transactions"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Inputs */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <MapPin size={15} className="text-rose-500" /> Property Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>State</label>
              <select
                className={inputCls}
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
              >
                {STATE_DATA.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Property Value (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={propValue}
                onChange={e => setPropValue(Number(e.target.value))}
                step={100000}
                min={0}
              />
              <p className="text-[10px] text-slate-400">{fmtCr(propValue)}</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Property Type</label>
              <div className="flex gap-2">
                {(['residential', 'commercial', 'plot'] as PropType[]).map(t => (
                  <button key={t} onClick={() => setPropType(t)} className={toggleCls(propType === t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Buyer Gender</label>
              <div className="flex gap-2">
                {([
                  { key: 'male', label: 'Male' },
                  { key: 'female', label: 'Female' },
                  { key: 'joint', label: 'Joint' },
                ] as { key: Gender; label: string }[]).map(g => (
                  <button key={g.key} onClick={() => setGender(g.key)} className={toggleCls(gender === g.key)}>
                    {g.label}
                  </button>
                ))}
              </div>
              {(gender === 'female' || gender === 'joint') && calc.state.stampFemale < calc.state.stampMale && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Female concession applied: {calc.state.stampFemale}% instead of {calc.state.stampMale}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FileText size={15} className="text-rose-500" /> Cost Breakdown — {selectedState}
          </h2>

          <div className="space-y-3">
            {/* Property Value */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Property Value</p>
                <p className="text-[10px] text-slate-400">Agreement / market value</p>
              </div>
              <p className="text-base font-black text-slate-800 dark:text-slate-100">{fmtCr(propValue)}</p>
            </div>

            {/* Stamp Duty */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Stamp Duty</p>
                <p className="text-[10px] text-slate-400">
                  {calc.stampRate}% on property value
                  {propType === 'commercial' && ' (commercial surcharge applied)'}
                </p>
              </div>
              <p className="text-base font-black text-rose-600 dark:text-rose-400">{fmtCr(calc.stampDuty)}</p>
            </div>

            {/* Registration */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Registration Charges</p>
                <p className="text-[10px] text-slate-400">
                  {calc.state.regRate}% on property value
                  {calc.state.regCap && ` (capped at ${fmtCr(calc.state.regCap)})`}
                </p>
              </div>
              <p className="text-base font-black text-orange-600 dark:text-orange-400">{fmtCr(calc.regCharges)}</p>
            </div>

            {/* Total Registration Cost */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 bg-rose-50 dark:bg-rose-950/20 rounded-lg px-2">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Registration Cost</p>
                <p className="text-[10px] text-slate-400">Stamp Duty + Registration</p>
              </div>
              <p className="text-lg font-black text-rose-600 dark:text-rose-400">{fmtCr(calc.totalRegCost)}</p>
            </div>

            {/* Total Property Cost */}
            <div className="flex items-center justify-between py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Total Property Cost</p>
                <p className="text-[10px] text-slate-400">Property + Stamp Duty + Registration</p>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{fmtCr(calc.totalPropertyCost)}</p>
            </div>
          </div>

          {/* As % of property value */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Registration Cost as % of Property Value</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((calc.totalRegCost / propValue) * 100 * 5, 100)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400 min-w-[48px] text-right">
                {propValue > 0 ? ((calc.totalRegCost / propValue) * 100).toFixed(2) : '0.00'}%
              </span>
            </div>
          </div>
        </div>

        {/* All States Reference */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Users size={15} className="text-slate-400" /> All States — Approximate Rates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">State</th>
                  <th className="text-center py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Stamp (Male)</th>
                  <th className="text-center py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Stamp (Female)</th>
                  <th className="text-center py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Registration</th>
                </tr>
              </thead>
              <tbody>
                {STATE_DATA.map(s => (
                  <tr
                    key={s.name}
                    onClick={() => setSelectedState(s.name)}
                    className={`border-b border-slate-50 dark:border-slate-800/60 cursor-pointer transition-colors ${
                      s.name === selectedState
                        ? 'bg-rose-50 dark:bg-rose-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2 font-semibold text-slate-700 dark:text-slate-300">{s.name}</td>
                    <td className="py-2 text-center text-slate-600 dark:text-slate-400">{s.stampMale}%</td>
                    <td className="py-2 text-center text-emerald-600 dark:text-emerald-400">{s.stampFemale}%</td>
                    <td className="py-2 text-center text-blue-600 dark:text-blue-400">
                      {s.regRate}%{s.regCap ? ' (capped)' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Click any row to select that state.</p>
        </div>

        {/* State-specific note */}
        {calc.state.note && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">{calc.state.note}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            These stamp duty and registration rates are approximate and based on publicly available data as of early 2026. Actual charges may vary based on the ready reckoner / circle rate (which is often higher than the agreement value), property age, location (municipal vs panchayat area), specific exemptions, and recent amendments by the state government. Commercial properties may attract additional surcharges. Always verify with the official state government registration website (e.g., igrs.maharashtra.gov.in, doris.delhigovt.nic.in) or consult a registered property lawyer before your transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
