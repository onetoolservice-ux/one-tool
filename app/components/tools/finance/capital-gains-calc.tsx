"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, Info, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

type AssetType = 'equity' | 'equity_mf' | 'debt_mf' | 'gold' | 'property' | 'unlisted';

const ASSET_TYPES: { id: AssetType; label: string; ltMonths: number; stcgRate: number; ltcgRate: number; ltcgExempt: number; indexation: boolean }[] = [
  { id: 'equity', label: 'Stocks / Equity ETF', ltMonths: 12, stcgRate: 20, ltcgRate: 12.5, ltcgExempt: 125000, indexation: false },
  { id: 'equity_mf', label: 'Equity Mutual Funds', ltMonths: 12, stcgRate: 20, ltcgRate: 12.5, ltcgExempt: 125000, indexation: false },
  { id: 'debt_mf', label: 'Debt Mutual Funds', ltMonths: 24, stcgRate: 30, ltcgRate: 12.5, ltcgExempt: 0, indexation: false },
  { id: 'gold', label: 'Physical Gold / SGB', ltMonths: 36, stcgRate: 30, ltcgRate: 20, ltcgExempt: 0, indexation: true },
  { id: 'property', label: 'Real Estate', ltMonths: 24, stcgRate: 30, ltcgRate: 12.5, ltcgExempt: 0, indexation: false },
  { id: 'unlisted', label: 'Unlisted Shares', ltMonths: 24, stcgRate: 30, ltcgRate: 12.5, ltcgExempt: 0, indexation: false },
];

// CII for indexation (gold, property — pre Budget 2024 for property)
const CII: Record<string, number> = {
  '2014': 240, '2015': 254, '2016': 264, '2017': 272, '2018': 280, '2019': 289,
  '2020': 301, '2021': 317, '2022': 331, '2023': 348, '2024': 363, '2025': 382,
};

interface Trade {
  id: string;
  assetType: AssetType;
  name: string;
  buyPrice: number;
  sellPrice: number;
  units: number;
  buyDate: string;
  sellDate: string;
}

function calcGain(trade: Trade) {
  const asset = ASSET_TYPES.find(a => a.id === trade.assetType)!;
  const buyDt = new Date(trade.buyDate);
  const sellDt = new Date(trade.sellDate);
  const monthsHeld = (sellDt.getFullYear() - buyDt.getFullYear()) * 12 + (sellDt.getMonth() - buyDt.getMonth());
  const isLT = monthsHeld >= asset.ltMonths;

  let costBasis = trade.buyPrice * trade.units;
  let saleValue = trade.sellPrice * trade.units;

  // Indexation (gold/property bought before July 2024)
  if (asset.indexation && isLT) {
    const buyYear = buyDt.getFullYear().toString();
    const sellYear = sellDt.getFullYear().toString();
    const ciiBase = CII[buyYear] || CII['2014'];
    const ciiSell = CII[sellYear] || CII['2025'];
    costBasis = costBasis * (ciiSell / ciiBase);
  }

  const gain = saleValue - costBasis;
  let tax = 0;

  if (!isLT) {
    // STCG
    tax = gain > 0 ? gain * (asset.stcgRate / 100) : 0;
  } else {
    // LTCG
    const taxableGain = Math.max(0, gain - (asset.ltcgExempt || 0));
    tax = taxableGain > 0 ? taxableGain * (asset.ltcgRate / 100) : 0;
  }

  const cess = tax * 0.04;
  return { gain, tax: Math.round(tax + cess), isLT, monthsHeld, costBasis, saleValue };
}

export const CapitalGainsCalc = () => {
  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', assetType: 'equity', name: 'Infosys', buyPrice: 1200, sellPrice: 1800, units: 100, buyDate: '2023-01-15', sellDate: '2025-02-10' },
    { id: '2', assetType: 'equity', name: 'HDFC Bank', buyPrice: 1500, sellPrice: 1400, units: 50, buyDate: '2024-06-01', sellDate: '2025-01-15' },
  ]);

  const addTrade = () => {
    setTrades(prev => [...prev, {
      id: Date.now().toString(), assetType: 'equity', name: 'Asset',
      buyPrice: 1000, sellPrice: 1200, units: 10,
      buyDate: '2024-01-01', sellDate: '2025-03-01',
    }]);
  };

  const removeTrade = (id: string) => setTrades(prev => prev.filter(t => t.id !== id));
  const updateTrade = (id: string, field: keyof Trade, value: string | number) =>
    setTrades(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const results = useMemo(() => trades.map(t => ({ ...t, ...calcGain(t) })), [trades]);

  const totals = useMemo(() => {
    const stcgGain = results.filter(r => !r.isLT && r.gain > 0).reduce((s, r) => s + r.gain, 0);
    const stcgLoss = results.filter(r => !r.isLT && r.gain < 0).reduce((s, r) => s + r.gain, 0);
    const ltcgGain = results.filter(r => r.isLT && r.gain > 0).reduce((s, r) => s + r.gain, 0);
    const ltcgLoss = results.filter(r => r.isLT && r.gain < 0).reduce((s, r) => s + r.gain, 0);
    const totalTax = results.reduce((s, r) => s + r.tax, 0);
    const netGain = results.reduce((s, r) => s + r.gain, 0);
    return { stcgGain, stcgLoss, ltcgGain, ltcgLoss, totalTax, netGain };
  }, [results]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Capital Gains Tax Calculator"
        subtitle="STCG & LTCG · FY 2024-25 rates"
        kpis={[
          { label: 'Total Tax', value: fmt(totals.totalTax), color: 'error' },
          { label: 'Net Gain / Loss', value: fmt(totals.netGain), color: totals.netGain >= 0 ? 'success' : 'error' },
          { label: 'STCG Profit', value: fmt(totals.stcgGain), color: 'warning' },
          { label: 'LTCG Profit', value: fmt(totals.ltcgGain), color: 'primary' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Trades */}
        <div className="space-y-3">
          {trades.map(t => {
            const r = results.find(r => r.id === t.id)!;
            return (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Asset Name</label>
                    <input className={inputCls} value={t.name} onChange={e => updateTrade(t.id, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Asset Type</label>
                    <select className={inputCls} value={t.assetType} onChange={e => updateTrade(t.id, 'assetType', e.target.value)}>
                      {ASSET_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Buy Price (₹)</label>
                    <input type="number" className={inputCls} value={t.buyPrice} onChange={e => updateTrade(t.id, 'buyPrice', +e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Sell Price (₹)</label>
                    <input type="number" className={inputCls} value={t.sellPrice} onChange={e => updateTrade(t.id, 'sellPrice', +e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Units / Qty</label>
                    <input type="number" className={inputCls} value={t.units} onChange={e => updateTrade(t.id, 'units', +e.target.value)} />
                  </div>
                  <button onClick={() => removeTrade(t.id)} className="text-slate-400 hover:text-red-500 self-center mt-4 md:mt-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className={labelCls}>Buy Date</label>
                    <input type="date" className={inputCls} value={t.buyDate} onChange={e => updateTrade(t.id, 'buyDate', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Sell Date</label>
                    <input type="date" className={inputCls} value={t.sellDate} onChange={e => updateTrade(t.id, 'sellDate', e.target.value)} />
                  </div>
                </div>
                {/* Result row */}
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className={`px-2 py-1 rounded-full font-semibold ${r.isLT ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>
                    {r.isLT ? 'LTCG' : 'STCG'} • {r.monthsHeld}m held
                  </span>
                  <span className={`px-2 py-1 rounded-full font-semibold ${r.gain >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {r.gain >= 0 ? 'Gain' : 'Loss'}: {fmt(Math.abs(r.gain))}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    Tax: {fmt(r.tax)}
                  </span>
                </div>
              </div>
            );
          })}

          <button onClick={addTrade}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Trade
          </button>
        </div>

        {/* Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex gap-3">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">FY 2024-25 rates (Finance Act 2024):</span> Equity STCG: 20% | Equity LTCG: 12.5% (₹1.25L annual exemption) | Debt MF: taxed at income tax slab rates | Gold LTCG: 20% with indexation. Health &amp; Education Cess: 4% on all taxes. Losses can be set off against gains of the same type; carry forward up to 8 years.
          </p>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Tax calculations are indicative and based on Finance Act 2024 rates. Actual tax liability may differ based on grandfathering provisions, cost inflation index (CII) figures for the relevant year, applicable surcharge, and set-off of losses. Property and gold indexation rules may differ for assets purchased before July 2024. Consult a Chartered Accountant for your ITR filing.
          </p>
        </div>
      </div>
    </div>
  );
};
