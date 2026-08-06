"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  defaultRate: number;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', defaultRate: 84 },
  { code: 'EUR', name: 'Euro', symbol: '€', defaultRate: 91 },
  { code: 'GBP', name: 'British Pound', symbol: '£', defaultRate: 107 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', defaultRate: 22.9 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', defaultRate: 2.4 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', defaultRate: 63 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', defaultRate: 0.57 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', defaultRate: 19 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', defaultRate: 55 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', defaultRate: 0.0053 },
];

export function ForexCalc() {
  const [budgetInr, setBudgetInr] = useState(100000);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [customRate, setCustomRate] = useState(84);
  const [cardMarkup, setCardMarkup] = useState(3.5);
  const [forexCardMarkup, setForexCardMarkup] = useState(1.5);
  const [cashMargin, setCashMargin] = useState(2);
  const [tripDays, setTripDays] = useState(7);

  const currency = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    const c = CURRENCIES.find((x) => x.code === code);
    if (c) setCustomRate(c.defaultRate);
  };

  const result = useMemo(() => {
    const baseRate = customRate;
    const methods = [
      { name: 'Debit / Credit Card', markup: cardMarkup / 100 },
      { name: 'Forex Card', markup: forexCardMarkup / 100 },
      { name: 'Cash Exchange', markup: cashMargin / 100 },
    ].map((m) => {
      const effectiveRate = baseRate * (1 - m.markup);
      const foreignAmount = budgetInr / effectiveRate;
      const lossVsBase = budgetInr - (foreignAmount * baseRate);
      return { ...m, effectiveRate, foreignAmount, lossVsBase };
    });

    const bestMethod = methods.reduce((best, m) => m.foreignAmount > best.foreignAmount ? m : best, methods[0]);
    const worstMethod = methods.reduce((worst, m) => m.foreignAmount < worst.foreignAmount ? m : worst, methods[0]);
    const savedVsWorst = worstMethod.foreignAmount > 0 ? ((bestMethod.foreignAmount - worstMethod.foreignAmount) / worstMethod.foreignAmount) * budgetInr / bestMethod.foreignAmount : 0;

    const dailyBudgetForeign = tripDays > 0 ? bestMethod.foreignAmount / tripDays : 0;

    return { methods, bestMethod, savedVsWorst, dailyBudgetForeign, baseRate };
  }, [budgetInr, customRate, cardMarkup, forexCardMarkup, cashMargin, tripDays]);

  const kpis = [
    { label: 'Best Method', value: result.bestMethod.name.split(' ')[0], color: 'text-emerald-600 dark:text-emerald-400' },
    { label: `You Get (${currency.code})`, value: currency.symbol + result.bestMethod.foreignAmount.toFixed(0), color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Effective Rate', value: '₹' + result.bestMethod.effectiveRate.toFixed(2), color: 'text-slate-600 dark:text-slate-400' },
    { label: 'Saved vs Worst', value: fmt(result.savedVsWorst), color: 'text-teal-600 dark:text-teal-400' },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Forex Calculator"
        subtitle="How much foreign currency will you get for your travel budget?"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Travel Budget</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Budget Amount (₹)</p>
                <input type="number" className={inputCls} value={budgetInr} onChange={(e) => setBudgetInr(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-2'}>Destination Currency</p>
                <select
                  className={inputCls}
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Exchange Rate (₹ per 1 {currency.code})</p>
                <input type="number" step="0.01" className={inputCls} value={customRate} onChange={(e) => setCustomRate(Number(e.target.value))} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Update with current market rate from Google or RBI.</p>
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Trip Duration (days)</p>
                <input type="number" className={inputCls} value={tripDays} onChange={(e) => setTripDays(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Fee & Markup Rates</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Debit/Credit Card Markup (%)</p>
                <input type="number" step="0.1" className={inputCls} value={cardMarkup} onChange={(e) => setCardMarkup(Number(e.target.value))} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Most Indian banks charge 3-3.5% forex markup fee.</p>
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Forex Card Markup (%)</p>
                <input type="number" step="0.1" className={inputCls} value={forexCardMarkup} onChange={(e) => setForexCardMarkup(Number(e.target.value))} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Niyo, BookMyForex cards offer ~1-2% margins.</p>
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Cash Exchange Margin (%)</p>
                <input type="number" step="0.1" className={inputCls} value={cashMargin} onChange={(e) => setCashMargin(Number(e.target.value))} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Typically 1.5-3% at airport, 1-2% at city forex.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Method Comparison for {fmt(budgetInr)}</p>
          <div className="space-y-3">
            {result.methods.map((method, i) => {
              const isBest = method.name === result.bestMethod.name;
              return (
                <div key={method.name} className={`p-3 rounded-lg border ${isBest ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{method.name}</span>
                    {isBest && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Best</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <p className="font-medium">{currency.symbol} {method.foreignAmount.toFixed(0)}</p>
                      <p>You Receive</p>
                    </div>
                    <div>
                      <p className="font-medium">₹{method.effectiveRate.toFixed(2)}</p>
                      <p>Effective Rate</p>
                    </div>
                    <div>
                      <p className={`font-medium ${method.lossVsBase > 0 ? 'text-red-500 dark:text-red-400' : ''}`}>
                        {method.lossVsBase > 0 ? '-' + fmt(method.lossVsBase) : 'Nil'}
                      </p>
                      <p>Markup Loss</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Budget */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className={labelCls + ' mb-2 text-blue-600 dark:text-blue-400'}>Daily Budget Planner</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {currency.symbol} {result.dailyBudgetForeign.toFixed(0)}
              <span className="text-sm font-normal text-blue-500 dark:text-blue-400"> / day</span>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Over {tripDays} days using {result.bestMethod.name}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-2'}>₹1,000 gets you</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {currency.symbol} {(1000 / result.bestMethod.effectiveRate).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              At {result.bestMethod.name} rate (₹{result.bestMethod.effectiveRate.toFixed(2)}/{currency.code})
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Exchange rates fluctuate daily. Rates shown are illustrative — update with current market rates before planning. Forex card markups vary by provider. Some banks charge additional cross-border transaction fees. Under LRS (Liberalised Remittance Scheme), TCS of 20% applies on foreign travel spends above ₹7L/year (Finance Act 2023).
          </p>
        </div>
      </div>
    </div>
  );
}
